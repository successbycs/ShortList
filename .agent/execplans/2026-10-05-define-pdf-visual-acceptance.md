# Define ShortList MVP 1 PDF visual acceptance

This ExecPlan is a living document and must be maintained under `.agent/PLANS.md`.

## Purpose / Big Picture

Define the reviewable visual and accessibility bar for the Minimum Assessment PDF before a renderer, email service, or customer-facing report exists. After this work, a future implementation can produce a report that is judged against an explicit section contract and human review rubric, rather than an implied idea of “professional”.

## Progress

- [x] (2026-10-05 00:00Z) Inspected the approved report/data contract and the in-review website experience brief.
- [x] (2026-10-05 00:00Z) Added the PDF visual-acceptance standard and registered it as a review input.
- [x] (2026-10-05 00:00Z) Created and locally rendered fictional successful and limited-evidence PDF review examples, with editable HTML sources.
- [x] (2026-10-05 00:00Z) Validated whitespace, rendered and visually inspected both PDFs, committed/pushed the documentation, and recorded the review handoff on Issue #25.

## Surprises & Discoveries

- Observation: The report section contract and provenance rules already exist in `docs/product/CONTRACTS.md`; this task should define visual acceptance, not duplicate or alter those data contracts.
  Evidence: `CONTRACTS.md`, sections 3–5, inspected 2026-10-05.
- Observation: Chromium successfully rendered both local examples to PDF. The host printed harmless D-Bus availability warnings while writing the files.
  Evidence: 2026-10-05 local Chromium output: `83323 bytes written` for the successful example and `59205 bytes written` for the limited-evidence example; `file` identified valid PDF 1.4 documents.
- Observation: The repository-wide Markdown checker still reports pre-existing placeholder and non-file reference links under `docs/product/discovery/Workflow.md`.
  Evidence: `python3 scripts/check_markdown_links.py` on 2026-10-05 reported `URL`, `IMAGE_PATH_OR_URL`, `{{ thread_url }}`, and non-file scheme targets in that existing discovery document; none are from the #25 files.

## Decision Log

- Decision: Use local, explicitly fictional rendered PDFs to make the visual standard reviewable before a production renderer or assessment service exists.
  Rationale: They let Chris assess layout, tone, and honest outcomes without falsely claiming a review of a real business or a live AI-search result.
  Date/Author: 2026-10-05 / Codex, at Chris's direction.

## Outcomes & Retrospective

The standard and two rendered illustrative samples were committed as `6db5f25` and handed to Chris in [Issue #25](https://github.com/successbycs/ShortList/issues/25#issuecomment-5986033853). Chris's visual acceptance remains pending. A production renderer, live evidence, email attachment delivery, accessibility tagging audit, and customer-facing report remain unbuilt and unproven.

## Context and Orientation

`docs/product/REQUIREMENTS.md` is the canonical MVP 1 requirement baseline. `docs/product/CONTRACTS.md` defines the report's required content, provenance, identity and delivery boundaries. `docs/product/design/WEBSITE_EXPERIENCE.md` defines the public-site visual principles. This plan adds `docs/product/design/PDF_VISUAL_ACCEPTANCE.md`, which translates those constraints into visual and human-review criteria for the attached Minimum Assessment PDF.

The product must distinguish observed evidence, qualified inference, and insufficient evidence. The PDF is an attachment, not an authenticated portal. It must not expose private recipient information, provider credentials, unsupported rankings, or a promise of manual fulfilment. “Accessible PDF” in this plan means the acceptance requirements a chosen renderer must demonstrate; it does not claim that a renderer is selected or that a sample has been audited.

## Plan of Work

First, add a focused PDF visual-acceptance document. It will define the section flow, visual hierarchy, evidence/inference/limitation treatment, typography and layout guardrails, metadata, and an owner-facing review rubric. It will distinguish requirements that a future renderer must meet from visual preferences that need Chris’s approval.

Second, extend the design index with two explicitly fictional local report examples: a successful assessment layout and an honest limited-evidence layout. Each has editable HTML source and rendered PDF output. They are not evidence of a live assessment or delivery capability.

Finally, run repository-local Markdown and whitespace checks, review the diff, create an additive documentation commit, push only after the user-authorised GitHub update, and post an evidence/handoff comment to Issue #25. Leave the Issue open and its Project status In Progress for Chris’s review.

## Concrete Steps

From `/home/chris/ShortList`:

1. Inspect `docs/product/CONTRACTS.md`, `docs/product/REQUIREMENTS.md`, and `docs/product/design/WEBSITE_EXPERIENCE.md` to preserve their truthfulness and privacy boundaries.
2. Add `docs/product/design/PDF_VISUAL_ACCEPTANCE.md`, two local HTML mockups, rendered PDFs, and update `docs/product/design/README.md`.
3. Run:

   ```bash
   git diff --check
   rg -n '\[[^]]+\]\([^)]+' docs/product/design
   git diff -- docs/product/design .agent/execplans/2026-10-05-define-pdf-visual-acceptance.md
   ```

   Expected result: no whitespace errors; Markdown links point to repository-relative documents; the diff changes only the visual-acceptance standard, its register entry, and this plan.
4. Commit and push the reviewed files. Re-read Issue #25, then post concise evidence and the owner review required.

Actual result: `git diff --check` passed before commit; local Chromium rendered and visually inspected the two examples; `6db5f25` was pushed to `origin/main`; and the Issue handoff was posted on 2026-10-05.

## Validation and Acceptance

Acceptance is met for this documentation task when:

- the standard names each required report section without contradicting `CONTRACTS.md`;
- it specifies a text-visible distinction among observed evidence, inference, and limitations;
- it includes layout, typography, contrast, page-flow, metadata, and attachment privacy criteria;
- it has a concrete human review rubric and includes one successful plus one limited-evidence representative sample;
- it makes no claim that a service, PDF renderer, email delivery, or production accessibility audit exists; and
- Markdown/whitespace validation passes and the GitHub Issue has a review handoff.

The operational boundary is deliberately local design rendering only. The local PDFs are rendered and visually inspected, but actual PDF tagging, customer downloading, email attachment delivery, and live assessment evidence remain unobserved and belong to later implementation and verification work.

## Idempotence and Recovery

The documentation edits and validation commands are repeatable. If the visual direction is not accepted, retain the draft and update it with Chris’s recorded feedback; do not delete review history. If an external design link becomes unavailable, repository-hosted sample PDFs and the written rubric remain the review basis.

## Artifacts and Notes

- Planned canonical visual standard: `docs/product/design/PDF_VISUAL_ACCEPTANCE.md`.
- Design register: `docs/product/design/README.md`.
- Successful illustrative report: `docs/product/design/mockups/2026-10-05-minimum-assessment-success-v1.pdf`.
- Limited-evidence illustrative report: `docs/product/design/mockups/2026-10-05-minimum-assessment-limited-v1.pdf`.
- Governing report/data contract: `docs/product/CONTRACTS.md`.
- Issue: `https://github.com/successbycs/ShortList/issues/25`.

## Interfaces and Dependencies

No code, services, schemas, libraries, credentials, or public API are added. A future report renderer must consume the claim/report fields defined by `docs/product/CONTRACTS.md`, assign a template version, and produce an attachment that can be reviewed against `PDF_VISUAL_ACCEPTANCE.md`.
