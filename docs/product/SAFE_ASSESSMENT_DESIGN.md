# ShortList safe assessment and private-access design

**Status:** draft for #24 review; no control is configured or implemented  
**Owner:** Chris / SuccessByCS  
**Requirements:** [REQUIREMENTS.md](REQUIREMENTS.md)  
**Contracts:** [CONTRACTS.md](CONTRACTS.md)

## 1. Security outcome

ShortList accepts a visitor-supplied public domain, so safety must be decided
before fetching a site, creating a customer record, calling an AI provider, or
generating a report. A normalised domain identifies one customer record but
never authorises access. A recipient may access only their own delivery path.

The design uses **fail closed**: when a target, evidence, request, limit, or
access check cannot be verified as safe, stop the affected automated path,
record a reason code, and show the approved honest outcome.

## 2. Admission and safe-site acquisition

| Stage | Required control | Safe outcome / evidence |
| --- | --- | --- |
| Syntax admission | Accept a single HTTP(S) public-domain input; canonicalise before lookup. Reject credentials, non-web schemes, IP literals, malformed hosts, and ambiguous encodings. | `invalid_input`; no customer record, fetch, AI call, or report. |
| DNS preflight | Resolve every candidate host; reject loopback, link-local, private, multicast, reserved, and otherwise non-public addresses. | `unsafe_target`; record only safe diagnostic/reason data. |
| Redirect handling | Follow only a bounded number of HTTP(S) redirects. Re-normalise and DNS-check every redirect destination immediately before connection. | `unsafe_redirect` or `redirect_limit`; no use of a prior safe resolution as proof for the next target. |
| Connection/fetch | Re-check the connected peer is public; set connect/read/total timeout, response-byte, page-count, and media-type limits. | `site_unreadable`, `fetch_timeout`, or `fetch_limit`; no unbounded download. |
| Content processing | Treat all page content, metadata, HTML, scripts, and documents as untrusted data. Extract bounded text/metadata only; never execute page scripts or follow page instructions as prompts. | `evidence_insufficient` or safe extraction evidence IDs. |
| Render/report | Escape/sanitise untrusted content before HTML/PDF rendering; prohibit remote active content, local file references, and template execution from captured text. | `render_unsafe_content` or `report_failed`; no unsafe PDF artifact. |

Exact redirect count, DNS resolver approach, timeouts, byte/page limits, and
supported content types are implementation parameters that require an approved
configuration decision before #10 begins. They must be test-covered, not left
as framework defaults.

## 3. Record ownership and access boundary

| Asset | Owner/relationship | Access rule |
| --- | --- | --- |
| Customer and assessment run | Customer is keyed by normalised domain; a run is a dated attempt. | Neither record authenticates a visitor or reveals a recipient. |
| Website/AI-search evidence and claim ledger | Owned by one assessment run. | Available to the server-side assessment/report flow; never exposed as another recipient's report. |
| Recipient, consent, entitlement, attribution | Owned by one normalised recipient relationship. | Require a private, non-guessable server-side delivery/request flow; never return existence, count, consent, or status for another recipient. |
| Report object and delivery attempt | Owned by a report version plus one recipient-specific attempt. | Object reference is never public/guessable; access is server-authorised for the intended recipient action only. |
| Operator/support evidence | Private operational access only. | Use minimised data and reason codes; no credentials, full report content, or unnecessary recipient information in alerts. |

Duplicate logic is privacy preserving: same recipient/domain is idempotent;
different recipient/same public domain is evaluated independently and must not
confirm that another request exists. Resend within the approved period creates
a new recipient-specific delivery attempt, not a new assessment.

## 4. Privacy-minimised attribution and lifecycle

Store only first-landing `utm_source`, `utm_medium`, `utm_campaign`,
`utm_term`, `utm_content`, landing path, and supplied referrer, linked through
a pseudonymous visitor reference. Do not store arbitrary query parameters as
attribution. Abuse events retain a privacy-minimised IP representation, not a
raw IP in normal product records.

Data classifications are:

- **Public evidence:** public URLs/bounded excerpts; still preserve provenance
  and do not treat it as permission for arbitrary reuse.
- **Private personal/operational data:** email, consent, entitlement, referral,
  recipient report/object reference, delivery status, support events, and
  privacy-minimised abuse identifiers.
- **Secret:** provider credentials, internal allowlist, service tokens, and
  signing/access credentials. Secrets never enter browser payloads, report
  content, logs, issue comments, or alert content.

Retention duration, deletion request verification, deletion scope (including
backups), and legal/privacy wording remain product-owner decisions before
launch. Until approved, implementation must make retention configurable and
must not claim a deletion SLA.

## 5. Bounded abuse, concurrency, and spend design

Controls are layered; no email entitlement substitutes for pre-email cost
protection.

1. Edge/form admission performs bot validation and request shaping.
2. Server admission enforces a privacy-minimised IP limit and normalised-domain
   limit before fetch or record creation.
3. An assessment reservation prevents concurrent costly runs for the same
   normalised domain and bounds global in-flight work.
4. Fetch, extraction, AI input/output, timeout, tool/search count, and
   per-assessment spend have independent hard limits.
5. A limit breach records the stage/limit reason and stops; it never silently
   retries an unknown charged provider operation.

Exact thresholds, window, token caps, timeout, search count, and spend ceiling
are owner decisions. #9 must store them server-side configuration with safe
defaults/rejection, and #10/#5 must prove each limit before costly work.

## 6. Failure and recovery matrix

| Event | Internal reason category | Customer path | Retry / recovery |
| --- | --- | --- | --- |
| Malformed input | `invalid_input` | Explain required public-domain format. | Visitor corrects input; no stored customer. |
| Private/DNS/redirect target | `unsafe_target` / `unsafe_redirect` | Safe unable-to-check message. | No automatic retry of the target. |
| Bot/rate/concurrency/spend block | `rate_limited` / `limit_exceeded` | Honest try-later/limit outcome without internal values. | Bounded future request only; no background queue. |
| Unreadable/sparse site | `site_unreadable` / `evidence_insufficient` | Explain assessment limitation and support route. | No invented evidence; retry only from new safe admission. A final `evidence_insufficient` event records one privacy-minimised Discord alert to Chris; it does not create a manual-fulfilment promise. |
| AI malformed/timeout/limit | `search_failed` / `search_limited` | State that the dated test could not be completed. | Do not claim result; only approved idempotent reconciliation. |
| Report render/store failure | `report_failed` | Honest delivery-status path. | Follow recipient-specific delivery policy. |
| Email temporary/permanent failure | `delivery_failed` | Never claim inbox receipt; use approved update/escalation wording. | Bounded 5/20/60-minute temporary retries; no permanent retry. |
| Two-hour no acceptance | `delivery_escalated` | One approved update attempt. | Private minimised alert; stop automatic retries. |

## 7. Implementation verification matrix

| Requirement | Required later test evidence |
| --- | --- |
| Safe public target | Valid public URL passes only after normalisation/resolution; private, redirect-to-private, DNS-change, malformed, and oversize/timeout cases refuse before external analysis. |
| Untrusted content | Captured hostile text cannot alter instructions, execute active content, access local resources, or produce unsafe PDF markup. |
| Recipient isolation | Same-domain/different-recipient and guessed-object-reference tests reveal no recipient/report/consent/attribution/delivery data. |
| Duplicate/resend | Same recipient/domain makes no new run/allowance; allowed resend is a new private delivery attempt. |
| Limits | Repeated IP/domain, concurrent domain, token/timeout/search/spend cases stop at their named stage with a safe reason. |
| Attribution/privacy | Recognised UTM/referrer persist; unknown parameters and raw IP do not become product attribution. |
| Failure honesty | Each matrix event maps to a reason code, no unsupported claim, and permitted retry/escalation state. A final `evidence_insufficient` event emits at most one private, minimised operator alert. |

## 8. Decisions required before implementation

1. Exact safe-fetch configuration: redirect/page/byte/content limits, resolver
   and re-resolution behaviour, and any permitted exceptions.
2. Exact bot/IP/domain/concurrency windows, global capacity, token/search/
   timeout/spend caps, and customer wording for each limit state.
3. Data retention, deletion/backup treatment, privacy copy, support route, and
   who can access private operational records.
4. Deterministic Auckland suburb source, aliases, update owner, and boundary
   change policy.
5. Chosen edge, record, object-storage, email, and alert implementations after
   technology recommendation; no candidate is selected by this document.
