# MVP 1 private records and delivery architecture

**Status:** approved architecture decision from GitHub Issue #35; no Cloudflare
resource, credential, migration, deployment, email provider, or PDF renderer is
configured by this document
**Owner:** Chris / SuccessByCS
**Requirements:** [REQUIREMENTS.md](REQUIREMENTS.md)
**Data/report contracts:** [CONTRACTS.md](CONTRACTS.md)
**Logical schema design:** [DATA_MODEL.md](../architecture/DATA_MODEL.md)
**Safety and access design:** [SAFE_ASSESSMENT_DESIGN.md](SAFE_ASSESSMENT_DESIGN.md)

## Decision in plain language

ShortList will keep its structured product records in **Cloudflare D1**, store
generated PDF report files privately in **Cloudflare R2**, and use
**Cloudflare Workflows** only to manage the delayed report-delivery process.

This keeps each responsibility simple:

- The approved [logical data model](../architecture/DATA_MODEL.md) defines what
  records and relationships ShortList requires. D1 is the intended runtime
  system of record for the subset implemented in a real environment.
- R2 stores the PDF bytes; it is not a public report website or an access
  mechanism.
- A Workflow performs durable waits and bounded retry/escalation steps only
  after a report-delivery attempt has been created. It is not the assessment
  orchestrator or the source of customer state.

Workers + Static Assets remains the selected public application boundary. The
synchronous domain-to-assessment journey is a bounded Worker request. The
Worker reaches D1, R2, and Workflows through Cloudflare bindings only when a
later, separately authorised implementation packet creates and verifies those
resources.

## Private access boundary

The normalised domain identifies a customer record but never grants access.
There is no account, permanent report URL, shared link, or public R2 bucket in
MVP 1.

After the visitor confirms the masked email address, the application may reveal
the full result only in that browser's active journey. The server will issue a
random opaque journey reference, retain only its protected server-side form,
and bind it to the specific assessment and recipient. A later implementation
must use an `HttpOnly`, `Secure`, `SameSite` cookie (or a functionally
equivalent protected server session); browser JavaScript must not receive a
reusable report-access secret.

Every result read checks that protected journey reference, its expiry, the
recipient relationship, confirmation state, and assessment relationship. The
exact session lifetime is a configuration value to be reviewed with the
implementation packet; it must be short-lived and test-covered. Closing the
browser, expiry, or a different browser does not create a report portal or
permit another recipient's access.

## Data, object, and workflow boundaries

| Concern                    | Selected boundary                                                                                                                                            | Non-negotiable rule                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product records            | D1 relational tables conforming to the approved logical data model.                                                                                          | D1 runtime records, not a domain or a workflow instance, decide what exists and who may see it.                                                  |
| Report file                | Private R2 object referenced by report metadata in D1.                                                                                                       | Do not make the bucket public or use a predictable/public customer URL. The Worker reads the object only to render/deliver an authorised report. |
| Delivery attempt           | A D1 `delivery_attempt` is reserved before work begins, then records lifecycle timestamps, retry count, provider-acceptance reference, and terminal outcome. | The stable attempt ID makes retries and reconciliation idempotent.                                                                               |
| Delayed recovery           | One Workflow instance is linked to one D1 delivery attempt.                                                                                                  | The Workflow reads/writes the attempt through application logic; it never becomes the authoritative delivery record.                             |
| Email/PDF/Discord adapters | Future server-side bounded adapters.                                                                                                                         | Provider credentials remain Worker secrets; no provider is selected or configured by this decision.                                              |

The minimum logical records and their relationships are defined in
[DATA_MODEL.md](../architecture/DATA_MODEL.md). Contracts define the required
behaviour over those records. A migration may normalise implementation detail,
but cannot weaken the approved isolation or provenance rules.

## Delivery state and recovery

1. The confirmed active journey creates or reuses the recipient-specific D1
   delivery attempt using a stable idempotency key.
2. The application records the attempt as `triggered`; generation, private R2
   storage, and provider hand-off each record their own state transition.
3. A linked Workflow performs only the approved temporary retry delays:
   approximately 5, 20, then 60 minutes. Each retry re-reads the D1 attempt so
   a completed, cancelled, or permanently failed attempt cannot be sent again.
4. A permanent failure stops retries. At two hours without provider acceptance,
   the attempt becomes `escalated`, makes one approved update attempt, emits the
   privacy-minimised operator alert, and stops automatic recovery.
5. `provider_accepted` is the only state that can support customer-facing
   wording that the report was sent. It is not proof that the recipient read it.

If starting a Workflow fails after the D1 attempt is reserved, the attempt
remains visibly pending rather than being silently lost. Later implementation
must supply a tested reconciliation path that can safely start the missing
workflow once, without duplicating a provider send.

## Implementation and test boundary

The decision authorises later implementation packets to add versioned D1
migrations, private R2 binding tests, and Workflow state-machine tests. It does
not authorise Cloudflare account changes, credentials, production deployment,
email sending, PDF rendering, Discord configuration, a data-retention period,
or a privacy notice.

Before a real boundary can be claimed, implementation must prove:

- a recipient cannot read another recipient's result, report metadata, object,
  consent, attribution, or delivery state;
- an expired or missing journey reference cannot reveal a result;
- a repeated trigger/retry produces at most one recipient-specific provider
  hand-off for an idempotency key;
- R2 objects are private and object references are not exposed to the browser;
- a temporary, permanent, and two-hour delivery outcome follow the approved
  state machine; and
- D1 migrations and Worker/Workflow tests pass locally before any separately
  authorised remote test.

## Still requiring Chris's decision

- Retention/deletion/backup policy and privacy wording.
- Exact journey-session expiry and secure-cookie configuration.
- Email provider, sender/support domain, and authorised real-provider test.
- PDF rendering library and approved operational report template.
- Exact bot, rate, concurrency, fetch, token, timeout, and spend parameters.
- Cloudflare account/project, regions/data-location requirements, bindings,
  deployment, and production observability configuration.

## Why this is a standard Cloudflare fit

D1 provides managed serverless SQL records available to Workers; R2 is Cloudflare
object storage; and Workflows provide durable multi-step waits, retries, and
state across longer-running work. This uses each product for its documented
purpose rather than rebuilding a scheduler or inventing a custom file service.
See the official [D1 overview](https://developers.cloudflare.com/d1/),
[R2 overview](https://developers.cloudflare.com/r2/), and
[Workflows overview](https://developers.cloudflare.com/workflows/).
