import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const temporaryPersistence = await mkdtemp(join(tmpdir(), "shortlist-d1-migrations-"));
const expectedTables = [
  "assessment_runs",
  "website_evidence",
  "website_sources",
  "geo_prompt_packages",
  "prompt_execution_records",
  "business_profiles",
  "icp_hypotheses",
  "buyer_questions",
  "model_evaluations",
  "model_question_findings",
];

try {
  await runWrangler([
    "d1",
    "migrations",
    "apply",
    "shortlist-mvp1",
    "--local",
    "--persist-to",
    temporaryPersistence,
    "--config",
    "wrangler.jsonc",
  ]);
  const schema = await runWrangler([
    "d1",
    "execute",
    "shortlist-mvp1",
    "--local",
    "--persist-to",
    temporaryPersistence,
    "--command",
    "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;",
    "--config",
    "wrangler.jsonc",
  ]);
  const missing = expectedTables.filter((table) => !schema.includes(table));
  if (missing.length > 0)
    throw new Error(`Local migration replay is missing tables: ${missing.join(", ")}`);
  console.log(
    `Local D1 migration replay passed: 0001–0008; ${expectedTables.length} required tables found.`,
  );
} finally {
  await rm(temporaryPersistence, { recursive: true, force: true });
}

function runWrangler(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["wrangler", ...args], {
      cwd: process.cwd(),
      env: { ...process.env, CI: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(`Local Wrangler migration proof failed (exit ${code}): ${output}`));
    });
  });
}
