
Loading older messages…
ok, does greengecko have json-ld?
Yes. I checked Green Gecko Gardens’ homepage and found three JSON-LD blocks, all readable as valid JSON:

Type	What it contains
WebSite	Business name, website URL and logo. Description is empty.
Organization	Legal name, Auckland location, email, phone and Facebook/Instagram links.
LocalBusiness	Business name, Auckland location, image and opening hours.
It already has basic business structured data. The specific gap versus the Second Nature page we checked is that Green Gecko’s homepage has no Service schema explicitly describing its landscaping services.

Its location is also broad—“Auckland, New Zealand”—without the street address or coordinates present in Second Nature’s markup.

These are differences in the inspected markup, not evidence explaining their positions in my earlier list.

show me their loclbusiness josn-ld
Here is Green Gecko Gardens’ LocalBusiness JSON-LD, exactly as found on its homepage, formatted for readability:

{
  "address": "Auckland \nNew Zealand",
  "image": "https://static1.squarespace.com/static/63eeee59769e985c0ed026a1/t/655e4e0c8f217e32e9f2f858/1779229254243/",
  "name": "Green Gecko Gardens",
  "openingHours": "Mo 07:00-19:00, Tu 07:00-19:00, We 07:00-19:00, Th 07:00-19:00, Fr 07:00-19:00, Sa 09:00-15:00, ",
  "@context": "http://schema.org",
  "@type": "LocalBusiness"
}
compare the gecko and the second nature json-ld is one better than the other?
Second Nature’s JSON-LD is more detailed and service-specific in the pages we checked. Green Gecko has useful basic markup, but it describes less about what the business does.

This compares Green Gecko’s homepage with Second Nature’s residential landscaping page, not every page on either website.

Element	Green Gecko Gardens	Second Nature
Schema types	WebSite, Organization, LocalBusiness	LocalBusiness, Service
Business identity	Name, website and logo distributed across blocks	Name, website and logo included in business markup
Business description	Website description is empty; none in LocalBusiness	Landscaping description included
Location	Plain text: Auckland, New Zealand	Structured postal address: street, Henderson, Auckland, postcode and country
Geographic coordinates	Not present	Latitude and longitude
Contact details	Phone and email in Organization	Phone in LocalBusiness
Opening hours	Text string with a trailing comma	Structured days, opening and closing times
Social profiles	Facebook and Instagram	Facebook, Instagram and ArchiPro
Explicit service	No Service block found on homepage	“Residential Landscaping,” description mentioning Auckland, and identified provider
Explicit links between entities	No @id links between blocks	No @id links; provider information repeated within the service
Why Second Nature is stronger: it gives a machine more explicit information about where the business is located and which service the page offers. Having three blocks versus two does not make Green Gecko’s markup better.

For Green Gecko, the clearest improvements would be:

Add an accurate business description.
Describe services and their service areas explicitly.
Connect the website, business and service entities using consistent @id references.
Use a structured address containing only location details the business intends to publish.
Tidy and standardise opening hours.
That makes Second Nature’s markup more informative—not proof that it ranks better because of it. We have not established any connection between these differences and its position in the earlier answer.

So the Archipro link - does that add more weight?
Not automatically. In Second Nature’s JSON-LD, the ArchiPro link is in sameAs: it identifies another profile for the same business. It isn’t a rating or endorsement field.

Two separate things matter:

The link in the markup: helps establish business identity. We have no evidence that adding ArchiPro there carries extra ranking weight.
The actual ArchiPro profile: could provide additional evidence about projects, services or credentials if a search system retrieves it.
I didn’t inspect its ArchiPro profile when creating the list, so I can’t attribute Second Nature’s first position to it. Simply copying an ArchiPro link into JSON-LD would not establish a ranking advantage.

so lets now do a deep dive between the two websites in terms of website design and searchability create a table that lists the differences in a way that 1. may impact GEO / AEO and 2. may impact SEO
Second Nature has clearer search targeting and broader supporting content. Green Gecko already has substantial service descriptions and local project evidence, but several fixable publishing issues weaken its presentation. JSON-LD is only part of the difference.

I checked both homepages, selected service and project pages, HTML metadata, JSON-LD, robots.txt and sitemaps on 4 October 2026. This reviews content and information design; I haven’t measured mobile rendering, visual polish, load speed or actual search traffic.

The effects below are reasoned possibilities, not measured ranking contributions. Google says its AI search features use the same SEO foundations, with no special AI schema required. 

Content, navigation and customer experience

Element	Green Gecko Gardens	Second Nature	Possible GEO / AEO effect	Possible SEO effect
Homepage search title	Simply “Green Gecko Gardens.”	“Landscaping Auckland | Professional Landscape Company.”	Second Nature’s title immediately identifies the service and location during retrieval.	More descriptive targeting of non-branded searches. Green Gecko could add service and location naturally.
Homepage heading structure	No <h1> found in retrieved HTML; introductory statements use lower-level headings.	One <h1>, followed by service and location headings.	Clear hierarchy can make sections easier to interpret. Green Gecko’s content is still readable.	Improve semantic organisation and accessibility; a missing H1 does not itself establish a ranking penalty.
Positioning and customer fit	Practical residential construction, preparation, durability and garden transformations.	High-end landscaping, design expertise and ambitious projects.	Each could suit different recommendation questions. “Premium garden design” and “practical backyard improvements” need not produce the same shortlist.	Different commercial search opportunities; luxury positioning is not inherently superior.
Service navigation	Specific work categories: planting, lawns, retaining, fencing, paving and maintenance.	Includes dedicated residential landscaping and landscape design pages, alongside construction and planting.	Second Nature has a more direct landing page for your exact broad query. Green Gecko matches specific job enquiries well.	Green Gecko could strengthen broad residential/design targeting without replacing its useful specialist pages.
Service detail	Planting page explains site conditions, plant selection, preparation and a five-stage installation process.	Residential page explains design, construction, planting and maintenance divisions.	Both provide useful answer material. Green Gecko already explains how work is delivered.	Both have relevant text supporting service searches; Green Gecko is not simply an image-only website.
Homepage content accuracy	Planting card describes maintenance; maintenance card describes new garden creation. Descriptions appear swapped.	Reviewed service summaries align with their headings.	Green Gecko risks incorrect extraction of which service includes what.	Weakens topical clarity and user confidence. A straightforward, high-priority correction.
Internal link accuracy	Service navigation provides descriptive destinations; not every link was tested.	Homepage links labelled “Hard Landscaping” and “Coastal Landscaping” both point to the commercial landscaping page.	Second Nature can send readers or retrieval systems to a less relevant page.	Correcting destinations improves navigation and internal linking. Second Nature has defects too.
Local project evidence	Dedicated projects in Henderson, Ponsonby, Mt Albert, Huapai and other suburbs.	Dedicated projects in Point Chevalier, Ponsonby, Mt Eden, Remuera and elsewhere.	Both can support location-specific recommendations.	Both have useful foundations for searches combining project type and suburb.
Case-study substance	Henderson example includes starting conditions, scope, work completed and year.	Point Chevalier example includes designer, implementation credit, year, design rationale and an award claim.	Both provide quotable specifics; Second Nature adds named attribution and recognition on this example.	Original project detail strengthens useful local content. No basis to say Green Gecko lacks case studies.
Question-answer content	No dedicated FAQ page found in the sitemap inspected; some answers appear in service copy.	Dedicated FAQ covers process, maintenance, quotes, payments and timing.	Second Nature supplies more explicit passages answering buyer questions.	Creates opportunities for relevant question searches; FAQ formatting does not guarantee enhanced results.
Educational content	No blog identified in the inspected sitemap.	Ten blog posts listed, covering garden layouts, native planting, entertainment areas and related topics.	More potential source pages for informational questions.	Broader coverage beyond “hire a landscaper” searches; usefulness matters more than article count.
Calls to action	“Get a quote,” plus named contacts and phone/email details.	“Enquire Now,” consultation and project-viewing links.	Limited direct effect on citation selection.	Primarily affects enquiries after visitors arrive, rather than search ranking.
Content evidence: the homepages, service pages and sampled projects support these comparisons. 

Technical searchability and structured data

These findings come from direct HTML and sitemap inspection, including Green Gecko’s sitemap and Second Nature’s sitemap index.

Element	Green Gecko Gardens	Second Nature	Possible GEO / AEO effect	Possible SEO effect
Published draft pages	Sitemap includes /projects-draft and 11 child pages. Two sampled draft URLs return HTTP 200 and use self-referencing canonicals.	No similarly named draft section found in its page sitemap.	Older or alternative project pages could be retrieved instead of the intended version.	Review for overlapping content and unnecessary indexed pages. “Draft” in the URL is not itself a penalty.
Project URL clarity	Several project URLs retain long template-style slugs; another spells Ponsonby as ponsoby.	Reviewed project URLs use descriptive project names.	Readable URLs give clearer context, although page content matters more.	Better usability and maintenance. Existing URLs should only change with appropriate redirects.
Homepage canonical consistency	Sitemap lists /home, which returns 200 but declares the root URL canonical.	Page sitemap lists the root homepage, matching its canonical destination.	Probably a minor difference if canonicalisation works correctly.	Green Gecko could align sitemap and canonical URLs; not proof of duplicate-indexing problems.
Business schema completeness	Basic LocalBusiness; contacts and social links are in a separate Organization block.	LocalBusiness includes description, phone, structured address, coordinates and hours.	Second Nature supplies more explicit business facts where structured data is consumed.	Better structured business description; no automatic ranking bonus established.
Service schema	Sampled planting page repeats general business schema, with no Service block found.	Residential page includes a specific Service block and provider.	More explicit service-provider relationship. Actual use by an answer system is unknown.	Can clarify meaning; generic Service markup does not guarantee a Google rich result.
Schema housekeeping	Empty WebSite description; entities lack explicit @id connections.	Homepage has two WebSite blocks; sampled business/service entities also lack @id connections.	Both could describe entity relationships more consistently.	Cleanup opportunity for both, rather than an established major ranking issue.
Meta descriptions	Homepage has a substantive landscaping description, despite the empty JSON-LD description.	Homepage also has a service/location description.	Both supply concise summaries. Green Gecko does not lack a meta description.	Both provide potential search-snippet text; engines may choose other text.
Crawler access	Robots.txt names numerous AI bots, but applies path exclusions—not a blanket site block.	Broad crawl permission, with particular exclusions and a PetalBot block.	No blanket AI-crawler exclusion found for Green Gecko’s public service pages.	Both permit ordinary public-page crawling under the inspected rules; hosting restrictions were not tested.
Sitemap availability	Accessible sitemap includes services, projects, draft projects and a thanks page.	Accessible sitemap index includes pages, blog posts and categories; also a thank-you page.	Both expose URLs for discovery; Green Gecko needs more publishing cleanup.	Sitemaps aid discovery but do not prove indexing. Both should review utility-page inclusion.
Text accessibility	Important service and project copy is available in retrieved HTML.	Likewise.	Both provide material a text-based retrieval system can read.	No evidence in this sample that essential copy requires client-side rendering to become available.
Images and descriptions	Many descriptive image alternatives; some sampled project images have filename-like labels.	Descriptive alternatives also present, alongside some filename-like labels.	Descriptive text helps give images context; neither site is uniformly better.	Review meaningful images individually for accessibility and image-search context.
Structured data can help describe page meaning and support eligible search features, but its presence does not guarantee a particular search presentation. 

What I would prioritise for Green Gecko

Priority	Action	Why
1	Correct the swapped homepage service descriptions.	Removes an actual content error.
2	Review the published draft project section; consolidate or redirect superseded pages where appropriate.	Gives visitors and search systems a clearer preferred version.
3	Improve the homepage title and main heading.	Makes the service and Auckland location immediately explicit.
4	Make its residential landscaping and garden-design offer easier to find, accurately reflecting what it delivers.	Better matches the broad query we started with.
5	Build on existing project pages with consistent location, scope, date, captions and related-service links.	Strengthens evidence already present.
6	Add concise answers to real customer questions, then improve schema to match the visible content.	Adds useful decision-making information before technical embellishment.
My assessment: Second Nature’s clearest advantage is its organisation of service, project and question-answer content. Green Gecko’s biggest immediate opportunity is correcting and consolidating existing material—not starting again or treating schema as the main solution.

Neither site’s actual SEO performance, backlink strength, Google Business Profile performance or repeatable AI visibility was measured here, so this comparison cannot explain or validate their earlier numbered positions.

are you able to measure those things?SEO performance, backlink strength, Google Business Profile performance
Yes—but accurate performance measurement needs access to the relevant data. Public website inspection alone cannot establish those three things.

Area	What I can assess publicly	What’s needed for actual performance
SEO performance	Technical issues, content, search visibility samples and competitor comparisons.	Google Search Console for clicks, impressions, click-through rate, search queries and average positions. GA4 for organic visits and enquiries, if conversion tracking is configured.
Backlink strength	Discover some external mentions and links; assess the relevance of the pages linking to you.	An Ahrefs, Semrush or Majestic export for broader referring-domain coverage, link attributes and gained/lost links. Their authority scores are third-party estimates—not Google scores.
Google Business Profile performance	Public profile completeness, categories, reviews, photos and sampled local-search visibility.	Owner-access performance data for profile views, searches and interactions such as website clicks, call-button clicks and direction requests, where available.
For Green Gecko: with those exports, I can produce a measured baseline, trends, weaknesses and prioritised actions. Direct account access is unnecessary if you supply the files.

For Second Nature: we can compare public signals and third-party estimates. Its actual search traffic, enquiries and Business Profile performance would require its permission and data.

For your GEO service, label findings as observed facts, third-party estimates, or owner-verified performance. That would make the report much more credible.

if I had an ahrefs accoutn could you conect vic mcp / api to analyse the data aroud these websites?
Yes. Ahrefs offers both an official MCP connection and API v3, available on Lite plans and above. Once connected and authorised, I could use the available data to compare Green Gecko and Second Nature. Neither is connected in this session yet. 

Analysis	What we could compare
Backlinks	Referring domains, linking pages, anchor text, broken backlinks and Ahrefs’ Domain Rating.
Organic search visibility	Ranking keywords, positions, estimated traffic and strongest pages, focusing on New Zealand.
Competitor gaps	Keywords and referring websites Second Nature has that Green Gecko lacks.
Trends	Changes in estimated visibility, referring domains and domain metrics.
Technical issues	Site Audit findings where projects and crawl data are available.
Ahrefs documents API endpoints covering these datasets. Access and result limits depend on your subscription. 

Which connection suits your goal?

MCP: interactive analysis together—ask questions and retrieve Ahrefs data through a supported AI client.
API: your GEO reporting product—automatically collect comparable metrics and generate reports. Ahrefs specifically directs programmatic applications to its public API. Both consume your plan’s API allowance. 
Ahrefs would give us competitive search estimates and backlink evidence. It would not, by itself, give us either company’s actual Google Business Profile interactions or verified organic enquiries.

For this two-website comparison, MCP is the simplest starting point. Official Ahrefs MCP connection guide.




