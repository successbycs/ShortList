# ShortList MVP 1 Minimum Assessment PDF visual acceptance

**Status:** draft for #25 review; illustrative samples exist, but no production renderer or delivery service is configured
**Requirements:** [../REQUIREMENTS.md](../REQUIREMENTS.md)
**Evidence and report contract:** [../CONTRACTS.md](../CONTRACTS.md)
**Website experience:** [WEBSITE_EXPERIENCE.md](WEBSITE_EXPERIENCE.md)

## Purpose

The free Minimum Assessment is a private email attachment that should feel considered, useful, and honest—not like an exported AI transcript or a generic sales brochure. This document is the visual acceptance standard for a future PDF renderer and the human review of its output. It does not select a renderer or claim that a working PDF, email delivery, or production accessibility audit exists.

## Non-negotiable content and truthfulness

The PDF must preserve the `Minimum Assessment report v1` contract. It contains:

1. a business summary based on the reviewed public website;
2. source-linked website evidence;
3. clearly labelled buyer hypotheses (inferences, not facts);
4. one dated AI-search test and its observed returned order/count;
5. evidence-backed strengths and opportunities;
6. limitations and insufficient-evidence outcomes where applicable; and
7. a support path that makes no manual-fulfilment promise.

Every material statement must visibly be one of these three types, in both text and visual treatment:

| Type | Reader-facing treatment | Rule |
| --- | --- | --- |
| **Observed** | `Observed on your website` label and evidence/source marker | Link or cite the applicable source without overstating it. |
| **Inference** | `Working hypothesis` label with a short explanation | State what evidence supports it; never present it as customer, market, or revenue fact. |
| **Limitation** | `What we could not confirm` label and plain reason | Do not fill the gap with generic or invented recommendations. |

The dated AI-search result must name the question, show Auckland date/time, the returned order and actual count, citations when available, and explain it is one observed test whose results can vary. It must not describe the result as official, objective, permanent, or universal.

## Page flow and visual hierarchy

Use a calm editorial reading experience. The suggested sequence is:

| Section | Reader question | Required visual outcome |
| --- | --- | --- |
| Cover and report facts | What is this, for whom, and when? | Business/domain, report date in Pacific/Auckland, report/template version, and a clear `Minimum Assessment` title. No recipient email in a filename, URL, or visible header/footer. |
| Snapshot | What did ShortList learn first? | A short, scannable summary with confidence/type labels; avoid a dashboard of unsupported scores. |
| Website evidence | What was actually found? | Source-aware evidence cards or annotated excerpts with readable URLs/titles and observation context. |
| Buyer hypotheses | What might matter next? | Separate panels for hypotheses, each labelled as an inference and paired with support. |
| Dated AI-search test | What did the single test return? | Question, timestamp, model/configuration disclosure suitable for customers, observed result order/count and available citations. |
| Strengths and opportunities | What could improve? | Evidence-led, specific, limited findings; no unexplained grades or blanket promises. |
| Limitations and next step | What was not assessed, and what now? | Honest limitations, privacy-safe support route, and no coercive sales copy. |

Important metadata may appear in a quiet cover/footer treatment, but the reader must be able to find it without relying on colour, hover, or a QR code. Page numbers are required once a report exceeds one page. Each section begins with a clear heading and must avoid stranded headings, clipped evidence, or a page that begins with only a table continuation.

## Visual voice

The report should share the website's warm, clever small-business voice while being calmer and more legible: purposeful web/search/map/tool motifs are fine as restrained accents. Do not use generic robot art, fake-terminal decoration, excessive badges, or “AI magic” claims. Decorative imagery cannot carry meaning, replace evidence, or make the document materially harder to print.

Use a limited, intentional palette and generous whitespace. Body content, evidence excerpts, URLs, timestamps, and limitations must remain more visually prominent than decorative elements. The report must remain intelligible when printed in greyscale.

## Typography, readability, and accessible structure

A selected renderer must demonstrate all of the following in exported samples:

- semantic title and heading hierarchy, meaningful document language, and selectable/searchable text—not image-only pages;
- body text that is comfortably readable at ordinary desktop and print scale; a recommended minimum is 10 pt body type and 12 pt for dense tables or legal/limitation text only where still readable;
- sufficient contrast for normal and muted text; colour never acts as the only evidence/inference/limitation signal;
- descriptive link text, readable link destinations where a customer needs them, and no raw private identifiers in links or metadata;
- meaningful reading order, tagged headings/lists/tables, and useful alternative text for informative visuals where the chosen renderer supports PDF tagging; and
- no horizontal scrolling requirement, clipped text, unreadable tiny charts, unexplained icons, or information conveyed only by animation/colour.

An untagged renderer is not automatically accepted because it “looks good”. If tagging is technically unavailable in the selected tool, record the gap and owner decision before implementation approval; do not claim full PDF accessibility.

## Privacy, provenance, and attachment hygiene

The attachment is recipient-private but not a customer account. It must not include recipient email addresses, internal IDs, provider/API secrets, raw IP, or other recipients' information in visible content, filenames, links, document properties, or embedded source metadata. Use opaque report identifiers only where an identifier is needed.

Each generated report records the report/template version and its required claim/evidence references as defined in [CONTRACTS.md](../CONTRACTS.md). A future implementation must verify that embedded links, footnotes, and document metadata cannot bypass recipient isolation or expose storage paths.

## Human review rubric and sample set

Chris reviews representative generated PDFs before accepting the visual design as implementation input. A review is a pass only when every applicable item is met; a failure records the page/section and corrective action.

| Review question | Pass condition |
| --- | --- |
| Is it recognisably a professional ShortList assessment? | The hierarchy, whitespace, typography, and restrained visual language feel intentional and useful rather than generic or auto-generated. |
| Can a reader separate fact, hypothesis, and uncertainty? | Observed, inference, and limitation labels are visible in text and do not rely on colour alone. |
| Is the AI-search presentation truthful? | The dated, single-test qualification, question, returned order/count, and available evidence are clear; no objective-rank claim appears. |
| Is the report readable and navigable? | Headings, body text, tables, links, page flow, and printed greyscale output are usable; exported text can be selected/searched. |
| Is it safe to attach? | No recipient data, secret, internal storage path, or cross-recipient information appears in content, filename, links, or document properties. |
| Does it handle an incomplete result honestly? | The limitation/failure version tells the reader what could not be confirmed and does not manufacture a conclusion. |

The minimum sample set is:

1. a normal successful report with website evidence, an inference, and a dated AI-search result;
2. an insufficient-evidence/limited-search report; and
3. the same normal report viewed in print/greyscale and checked for selectable text, link destinations, document properties, and reading order.

Samples must be registered in [README.md](README.md) with report/template version, generation date, source state, reviewer, and pass/fail result. They may use synthetic business data; they must never include real unapproved customer or recipient data.

## Decisions still needed before renderer implementation

- approved brand/logo/type assets and one or more visual examples;
- PDF renderer and its demonstrated tagging/metadata capabilities;
- final public/customer wording for model/configuration disclosure and support;
- final report filename convention and storage/delivery integration; and
- the exact human reviewer and approval record for generated samples.

These are implementation inputs, not defaults silently selected by this standard.
