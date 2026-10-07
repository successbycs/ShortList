# ShortList GEO prompt and assessment contract

**Status:** draft for product-owner review in [#55](https://github.com/successbycs/ShortList/issues/55)
**Purpose:** replace the generic comparable-business search prototype with a
repeatable, evidence-led GEO assessment method.

**Data design:** [ShortList data model](../architecture/DATA_MODEL.md)

## What ShortList is assessing

ShortList tests how selected AI modes understand and recommend a submitted
business for plausible buyers. It does not claim a permanent ranking, emulate a
general search engine, or treat a list of similar businesses as the product
result.

The assessment sequence is:

```text
bounded public website evidence
→ business profile
→ three labelled ICP hypotheses
→ three buyer questions per ICP
→ same nine questions in two AI modes
→ dated GEO findings and practical content actions
→ one report object for the website and PDF
```

## Inputs and evidence boundary

The server fetches public HTML/text only. Each accepted page is limited to 5
MiB decoded HTML and receives a source ID, URL, observation timestamp, title,
meta description, visible text, extracted JSON-LD and extraction version.
JSON-LD is evidence, not automatically trusted fact. Website data is untrusted
input and is always delimited from prompt instructions.

The initial page-selection rule remains an open decision: homepage only, or
homepage plus up to two safe, same-origin pages selected by an approved fixed
rule. No arbitrary crawling is permitted.

## Prompt package

`geo-assessment-v1` is a versioned package of four prompt stages. A package is
made of approved D1 template versions, trusted server-side schemas and named
input fields. It is not an arbitrary free-text prompt chosen by a browser.
The human-readable templates are maintained in
[GEO assessment prompt package v1](prompts/GEO_ASSESSMENT_V1.md). That reviewed
document is the design authority for the method. A D1 package/version is the
controlled runtime materialisation of it: its checksum proves conformance but
does not define the method independently. A new D1 package version must have a
matching reviewed instruction and checksum.

| Stage      | Purpose                                                                                             | Required output                                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Profile    | Turn website evidence into a cautious business profile.                                             | Evidence-linked business name, services, service area, audiences, proof points, differentiators and gaps. |
| ICP        | Infer three likely buyer profiles from the audience the site's own copy appears written to attract. | Label, buyer situation, needs, decision criteria, evidence IDs, confidence and uncertainty.               |
| Questions  | Give each ICP three realistic buyer questions.                                                      | Nine question IDs, question text, intent and tested claim.                                                |
| Evaluation | Test the same nine questions in each AI mode.                                                       | Per-question, dated GEO finding, sources, limitations and content gaps.                                   |

Every stage has a strict input/output schema. A missing or weak source creates
an explicit uncertainty; it must not create a plausible-sounding fact.

### How an ICP is derived

An ICP is not a generic vertical persona and is not selected from a fixed list.
The ICP stage examines the captured website copy and structured evidence to
answer: **who does this business appear to be trying to persuade?** It may use
explicit audience labels, service descriptions, location/service-area wording,
pain points, outcomes, proof points, calls to action and price/urgency signals.

Each ICP must distinguish:

- the wording or evidence IDs on which the inference relies;
- the inferred buyer situation and decision criteria; and
- confidence and material uncertainty.

If the website does not provide enough evidence to support three distinct ICP
hypotheses, the assessment must return an honest insufficient-evidence outcome
rather than inventing personas.

## Reviewable D1 records

The future data model stores controlled product methodology separately from
application security controls:

- `geo_prompt_packages` and immutable `geo_prompt_package_versions` record the
  stage templates, named fields, schema versions, prohibited claims, checksum,
  lifecycle (`draft`, `approved`, `retired`) and approval metadata.
- `model_test_profiles` record approved model/mode/tool settings and references
  to budget/timeout policy. The Worker may select only a code-approved provider
  and tool allowlist.
- `market_profiles` record approved geography, timezone, vertical constraints,
  current-web location context and reference-data version.
- `assessment_configuration_snapshot` records the approved package, model,
  market, evidence-policy and report-template versions selected for one run.
- `prompt_execution_records` retain the template version/checksum, safe typed
  inputs, rendered prompt, generated buyer question, mode, time, usage and
  outcome. They never retain API keys, raw visitor headers, raw IP addresses or
  unbounded provider payloads.

An approved template is append-only. A correction becomes a new version; it
never changes the method recorded for a prior assessment.

## The two evaluation modes

Every buyer question is asked in both modes using the same business profile,
ICP and question text:

- **Current-web:** selected live-web tool enabled; preserve any provider source
  metadata. It is a dated observation, not a permanent ranking.
- **Model knowledge:** no live web tool; clearly label the response as possibly
  incomplete or out of date.

Neither mode assumes Auckland or any other default city. The approved market
profile and evidence-supported service area are supplied as named fields for a
specific assessment; an absent geographic signal remains explicit uncertainty.

For each question/mode, the structured finding records whether the submitted
business was mentioned, how accurately it was described, whether a
recommendation appears appropriate, evidence/source references where supplied,
limitations, and website-content gaps. Competitors or alternatives are
supporting context only, never the headline metric.

## Report contract

One validated GEO report object is built from the stored assessment graph. The
responsive website and the later PDF renderer consume that same object; neither
re-runs an AI call or invents additional claims. The report presents:

1. website evidence and a business profile;
2. three labelled ICP hypotheses;
3. nine buyer questions;
4. the current-web and model-knowledge findings side by side;
5. limitations and uncertainty;
6. prioritised, evidence-linked website/content actions.

## Deliberate open decisions

- Whether a weak website yields three low-confidence ICP hypotheses or a
  specific insufficient-evidence result.
- Homepage-only versus deterministic additional-page selection.
- Cost, timeout and output budgets for the four batched calls.
- Whether every current-web question must carry citations or can be retained as
  an explicitly uncited/limited finding.
- Whether the report initially shows all nine detailed findings or an executive
  summary with expandable evidence.
