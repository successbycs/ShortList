// Run the installed handler, lock implementation and response parser in isolation.
// Vendor code stays in memory; no network, VS Code activation or user data.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const [root, candidate] = process.argv.slice(2);
if (!root || !candidate) throw Error('Usage: node prove_codex_queue_patch.cjs EXTENSION CANDIDATE');
const original = fs.readFileSync(path.join(root, 'out/extension.js'), 'utf8');
const patched = fs.readFileSync(candidate, 'utf8');
assert.equal(crypto.createHash('sha256').update(original).digest('hex'),
  '550b03e76ac5a83cb25788aa3240ba445d0e7c7d4e76af8331442687529617ef');

function between(source, start, end) {
  const first = source.indexOf(start);
  assert(first >= 0, `Missing extraction start: ${start}`);
  assert.equal(source.indexOf(start, first + start.length), -1, 'Ambiguous extraction');
  const last = source.indexOf(end, first + start.length);
  assert(last > first, `Missing extraction end: ${end}`);
  return source.slice(first + start.length, last);
}

const lockSource = between(original, 'NN=class{', '});var q3e=');
const Lock = vm.runInNewContext('(class{' + lockSource + ')');
const handlerKey = '"queued-follow-up-send-lock-release":';
const handlerEnd = ',"set-vs-context":';
const oldHandler = between(original, handlerKey, handlerEnd);
const newHandler = between(patched, handlerKey, handlerEnd);
assert.equal(newHandler, oldHandler.slice(0, -1) + ';return{success:true}}');
assert.equal(patched, original.replace(oldHandler, newHandler), 'Unrelated bundle change');

const webview = fs.readFileSync(path.join(root,
  'webview/assets/app-initial-28419e5a8181.js'), 'utf8');
const parser = between(webview, 'onFetchResponse(e){', 'async get(e,t,n,r,i)');
const receiver = vm.runInNewContext('({onFetchResponse(e){' + parser + '})');

async function roundTrip(handlerSource, locks, params) {
  const factory = vm.runInNewContext('(function(){return ({' + handlerKey + handlerSource + '})})');
  const handler = factory.call({ queuedFollowUpSendLocks: locks })
    ['queued-follow-up-send-lock-release'];
  const result = await handler(params);
  // Same JSON serialization contract as the extension-to-webview bridge.
  return new Promise((resolve, reject) => {
    const requests = new Map([['test', { resolve, reject }]]);
    receiver.onFetchResponse.call({ pendingRequests: requests }, {
      requestId: 'test', responseType: 'success', status: 200,
      headers: {}, bodyJsonString: JSON.stringify(result),
    });
    assert.equal(requests.size, 0);
  });
}

(async () => {
  const params = { conversationId: 'synthetic-thread', messageId: 'one', lockId: 'lock', sent: true };
  const before = new Lock();
  assert(before.tryAcquire(params));
  await assert.rejects(roundTrip(oldHandler, before, params), { name: 'SyntaxError' });
  // Baseline already releases the lock; do not falsely claim the patch unsticks it.
  assert.equal(before.activeLocks.size, 0);

  const after = new Lock();
  assert(after.tryAcquire(params));
  assert.equal((await roundTrip(newHandler, after, params)).body.success, true);
  assert.equal(after.activeLocks.size, 0);
  assert.equal(after.tryAcquire(params), false, 'Accepted message must stay deduplicated');
  const next = { ...params, messageId: 'two', lockId: 'next', sent: false };
  assert(after.tryAcquire(next), 'Next message must acquire released lock');
  await roundTrip(newHandler, after, { ...next, lockId: 'foreign' });
  assert.equal(after.tryAcquire({ ...next, lockId: 'other' }), false, 'Foreign release must not unlock');
  await roundTrip(newHandler, after, next);
  assert(after.tryAcquire(next), 'Unsent message must remain retryable');
  console.log(JSON.stringify({ baseline: 'SyntaxError reproduced',
    candidate: 'JSON acknowledgement received', lockSemantics: 'preserved',
    liveEditorDelivery: 'unobserved' }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
