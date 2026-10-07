# MVP 1 safe website-fetch policy

**Status:** approved product decision
**Decision owner:** Chris
**Recorded:** 5 October 2026
**Implementation Issue:** [#10](https://github.com/successbycs/ShortList/issues/10)

This policy governs the server-side public-website acquisition used to produce
an MVP 1 ShortList teaser. It does not authorise a production deployment,
customer-data processing, a Cloudflare account change, or a live assessment.

## Approved limits

| Control | Decision |
| --- | --- |
| Scope | The submitted entry page plus at most two same-origin HTML pages. |
| Content | Only `text/html` and `application/xhtml+xml`. |
| Response size | At most 5 MiB of decoded HTML per page. |
| Time | At most 8 seconds per page and 20 seconds for the complete assessment. |
| Redirects | At most three redirects; validate every destination before requesting it. |
| Destination | Reject local, private, link-local, multicast, loopback and reserved address forms before a request. A Worker also uses Cloudflare's public-service outbound HTTP boundary; it does not use a custom private-network/VPC binding. |
| Concurrency | At most two assessments globally and one active assessment per normalised domain. |
| IP admission | Temporary testing setting: at most 100 assessment starts per privacy-minimised IP per UTC calendar day. |
| Bot gate | Deferred until MVP 3+. MVP 1 retains server-side domain validation, one-active-domain control, global concurrency limits, and a privacy-minimised IP/day limit. |
| Market context | Use an approved global market profile and evidence-supported service-area fields. When geography cannot be supported, record and display `context_unavailable`. |

## Public limited states

| Reason | Customer wording |
| --- | --- |
| `unsafe_target` | We can’t safely check that address. |
| `site_unreadable` | We couldn’t read enough of that public website to complete this check. |
| `evidence_insufficient` | We couldn’t find enough public evidence for a useful ShortList assessment. |
| `rate_limited` | Please try again later. |

## Implementation boundary

The application must use a manual redirect policy, an abort signal for each
page timeout, byte-bounded streamed reads, and no forwarded visitor
credentials. It uses a fixed, transparent `ShortList/1.0` user-agent so a
public site can identify the service, rather than forwarding the visitor's
browser identity. It must re-run public-domain validation on every redirect. A
Cloudflare Worker cannot use an application-controlled resolver to inspect a
resolved target address; the design therefore combines syntactic host refusal,
manual redirect validation, and the Workers public-outbound-service boundary.

The policy is implemented by server-only code and tested using injected fetch
fixtures. A later, separately authorised local/remote Worker test is required
before claiming that the platform boundary has been observed.

## References

- [Cloudflare Workers Request API](https://developers.cloudflare.com/workers/runtime-apis/request/)
- [Cloudflare Workers security model](https://developers.cloudflare.com/workers/reference/security-model/)
- [Cloudflare Workers known fetch limitations](https://developers.cloudflare.com/workers/platform/known-issues/)
