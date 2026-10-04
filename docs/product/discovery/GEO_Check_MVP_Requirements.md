# GEO Check — MVP Requirements

## 1. Product purpose

GEO Check helps a small Auckland service business understand whether its public website makes it clear to AI-powered web search what it sells, who it serves, and where it operates.

The system infers likely buyer situations from public website content, creates realistic local questions those buyers may ask, and tests those questions with OpenAI web search using an Auckland location setting.

GEO Check does not provide an official OpenAI ranking and does not guarantee that a business will be recommended in ChatGPT or any other AI product.

## 2. Primary buyer

The first target buyer is an owner of a small Auckland residential landscaping or garden-maintenance business.

They are not SEO, GEO or AI experts. They want clear, practical evidence of whether their online presence is helping or costing them enquiries.

Future categories may include builders, plumbers, electricians and roofers. They are out of scope for the first MVP.

## 3. Core customer journey

### Step 1: Domain entry

The first page asks only for:

- Website/domain name

Primary button: `Check my website`

Do not request an email address before showing useful value. Validate URLs, block private/internal network addresses, and rate-limit submissions.

### Step 2: Website analysis

The system reads publicly accessible content from the submitted website and creates a structured assessment.

Extract or infer:

- business name
- business type and services
- apparent service area
- short website summary
- three likely buyer situations / ICP hypotheses
- supporting website excerpts for every ICP hypothesis
- evidence available on the website:
  - reviews/testimonials
  - project/case-study detail
  - team/owner identity
  - service locations
  - clear contact details
  - FAQs
  - pricing/quote guidance
  - credentials or memberships

If the website cannot be read, explain that the scan could not be completed. Create an admin alert. Invite the visitor to enter an email address if they would like a response from SuccessByCS.

### Step 3: Immediate free preview

Show useful results immediately:

- “Here is how your website currently appears to describe your business”
- short business summary
- three likely buyer situations
- one example customer question
- three top visibility/trust gaps

Example buyer situations:

1. Henderson homeowner planning a garden renovation
2. New-build owner needing a complete landscape
3. Property owner needing retaining-wall work

Example customer question:

> Find me a Henderson-based lawn-mowing company with good reviews.

Example gap:

> There is limited detailed local project evidence that a customer—or AI-powered web search—can use to verify your experience.

### Step 4: Email capture

After the preview, ask for:

- Email address — required to send the free report
- Optional, unchecked consent checkbox: “I’d also like occasional practical guidance from SuccessByCS.”

Button: `Send my free report`

Do not request passwords, email inbox access, Google Business Profile access or other private business data.

### Step 5: Free email report

Send a concise SuccessByCS-branded email containing:

- website URL
- Auckland date and time
- website/business summary
- three likely buyer situations
- three example AI-search questions customers may ask
- three top opportunities
- a short description of the paid report

Primary CTA:

`See how AI search currently describes your business to your key buyers`

## 4. Paid product: AI Search Recommendation Check

Price for MVP: **NZ$47 including GST**.

The paid report includes:

- ten predefined customer questions
- three questions for each identified buyer situation
- one comparison/recommendation question
- actual dated OpenAI web-search responses
- whether the business was:
  - recommended
  - mentioned
  - absent
  - described incorrectly
- competitors mentioned
- cited sources and complete source list where available
- prioritised actions across:
  - website clarity
  - website design, build and function
  - Google Business Profile
  - reviews
  - local project proof
  - FAQs
  - service-area pages
  - third-party trust signals

The report must state:

> This report is an automated, dated sample of OpenAI web-search responses to defined customer questions using an Auckland location setting. It is not an official OpenAI ranking, and future results may vary.

## 5. Paid report workflow

1. Customer receives the free Minimum Report by email.
2. Customer buys the Full AI Search Recommendation Check through Stripe.
3. A successful Stripe webhook creates a paid report job with status `Paid`.
4. The job runs the ten approved questions using OpenAI web search with:
   - an Auckland location setting
   - required web search
   - saved prompt text
   - saved model/version
   - saved run date and time
5. The system stores the answer, citations, full source list, competitor mentions and run time.
6. The system generates a SuccessByCS-branded PDF from the paid report template.
7. The customer receives an email with a secure report link and PDF attachment.
8. A failed job is marked for human review and the customer is notified.

Service promise:

> Usually delivered within 10 minutes; within 24 hours if a review is required.

## 6. Report templates

The system uses versioned templates to create consistent reports:

- Free AI Visibility Snapshot
- Paid AI Search Recommendation Check

AI populates only defined fields in a structured report object. Ordinary application code inserts those fields into the templates and generates HTML/PDF.

Every claim about AI-search results must be supported by the stored prompt, response or cited source. Each report records:

- report-template version
- model used
- Auckland location setting
- run date and time
- source URLs and citations

The paid template contains:

1. Business and run details
2. What the website currently communicates
3. Likely buyer situations and supporting website evidence
4. Customer questions tested
5. AI-search results and competitor mentions
6. What the findings mean
7. Three prioritised actions, each linked to evidence
8. Results disclaimer
9. SuccessByCS next-step offer and contact method

## 7. Admin requirements

Provide a basic private admin webpage that reads live data from the database and shows:

- submitted domains
- business name
- email address
- free-report status
- payment status
- paid-report status
- generated ICP hypotheses
- generated question set
- notes
- report delivery date
- failed scan/job reason where applicable

Statuses:

- New
- Free report sent
- Payment started
- Paid
- Research in progress
- Report sent
- Human review required
- Closed

## 8. Data, privacy and support requirements

Store:

- domain URL
- email address
- business name
- service area
- generated website assessment
- ICP hypotheses and evidence excerpts
- generated question set
- consent timestamp, if marketing consent is given
- payment status
- report status
- paid-report findings
- Auckland date and time
- report-template version
- model/version and location setting
- citations and source URLs

Provide:

- a privacy page
- terms page
- a support contact email and contact form
- a way for a person to request deletion of their details

## 9. Out of scope for MVP

Do not build:

- a claim that the business has a fixed ChatGPT/OpenAI rank
- automated Google Business Profile changes
- automated website changes
- ongoing monthly monitoring
- client logins
- complicated dashboards
- multiple AI platforms
- a generic SEO platform
- additional industry verticals beyond Auckland landscapers/garden-maintenance businesses

## 10. Success measures

The first commercial success metrics are:

- 20 domain checks completed
- 10 email addresses captured
- 5 people click through to the paid offer
- 5 customers pay NZ$47
- automated reports delivered within 10 minutes except for failures requiring review
- one customer agrees to an implementation conversation

## 11. MVP acceptance criteria

The MVP is ready when:

- A visitor can submit a valid public domain and see a meaningful preview.
- The preview includes a business summary, three buyer-situation hypotheses, one example question and three priority gaps.
- Each buyer-situation hypothesis shows supporting website evidence.
- A visitor can enter an email address and receive a free report.
- Marketing consent is optional and is recorded separately from report delivery.
- The email clearly offers the NZ$47 full report.
- A successful payment creates a visible admin job.
- Each paid job stores the exact questions, responses, citations, model/version, location setting and run timestamp.
- The system generates the paid PDF from a versioned template.
- Failed scans and report jobs create an admin alert and a recoverable status.
- The webpage provides a way to contact the human admin.
- The experience works properly on mobile.
