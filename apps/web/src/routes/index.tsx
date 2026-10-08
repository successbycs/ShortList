import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  FileSearch,
  Globe2,
  Leaf,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { admitPublicDomain } from "@/lib/domain-admission";
import {
  submitDomainAssessment,
  type DomainAssessmentSubmissionResult,
} from "@/functions/submit-domain-assessment";
import type { StoredGeoAssessment } from "@/server/geo-assessment-repository";
import type { StoredAssessmentResult } from "@/server/live-assessment";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShortList — Your website assessment" },
      {
        name: "description",
        content:
          "A clear website assessment that turns your public website into buyer profiles, questions, and practical findings.",
      },
      { property: "og:title", content: "ShortList — Your website assessment" },
      {
        property: "og:description",
        content:
          "A clear website assessment that turns your public website into buyer profiles, questions, and practical findings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Screen = "entry" | "refusal" | "progress" | "reveal" | "result" | "failure";

export function Index() {
  const [screen, setScreen] = useState<Screen>("entry");
  const [domain, setDomain] = useState("lawnrite.co.nz");
  const [domainError, setDomainError] = useState("");
  const [submissionResult, setSubmissionResult] = useState<DomainAssessmentSubmissionResult>();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const submitAssessment = useServerFn(submitDomainAssessment);
  const assessmentResult = getAssessmentResult(submissionResult);

  async function submitDomain(event: FormEvent) {
    event.preventDefault();
    const admission = admitPublicDomain(domain);
    if (admission.kind === "rejected") {
      setDomainError(
        admission.reasonCode === "private_or_local_target"
          ? "Enter a public business website, not a local or private address."
          : "Enter a public website address like yourbusiness.co.nz.",
      );
      return;
    }

    if (isSocialProfile(admission.normalisedDomain)) {
      setDomainError("");
      setScreen("refusal");
      return;
    }

    setDomain(admission.normalisedDomain);
    setDomainError("");
    setScreen("progress");
    const result = await submitAssessment({
      data: { domain: admission.normalisedDomain },
    });
    setSubmissionResult(result);
    if (result.kind === "completed" || result.kind === "cached") {
      setScreen("reveal");
      return;
    }
    if (result.kind === "invalid_input") {
      setDomainError("Enter a public website address like yourbusiness.co.nz.");
      setScreen("entry");
      return;
    }
    setScreen("failure");
  }

  function revealReport(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    setScreen("result");
  }

  return (
    <main className="paper-grid min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-paper/95">
        <div className="mx-auto grid min-h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
          <button
            className="flex min-w-0 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setScreen("entry")}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <Search aria-hidden="true" className="size-5" />
            </span>
            <span className="display-face truncate text-2xl font-bold">ShortList</span>
          </button>
          <div className="hidden items-center gap-2 text-sm font-medium text-muted-foreground sm:flex">
            <Globe2 className="size-4 text-coral" aria-hidden="true" /> For small businesses,
            wherever they are
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold sm:hidden">
            <Globe2 className="size-4 text-coral" aria-hidden="true" /> Global
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
        {screen === "entry" && (
          <Entry
            domain={domain}
            setDomain={setDomain}
            error={domainError}
            onSubmit={submitDomain}
          />
        )}
        {screen === "refusal" && <Refusal onBack={() => setScreen("entry")} />}
        {screen === "progress" && <AssessmentProgress domain={domain} result={submissionResult} />}
        {screen === "reveal" && assessmentResult && (
          <ReportReveal
            email={email}
            setEmail={setEmail}
            error={emailError}
            onSubmit={revealReport}
          />
        )}
        {screen === "result" && assessmentResult && (
          <SearchResult result={assessmentResult} onStartOver={() => setScreen("entry")} />
        )}
        {screen === "failure" && submissionResult && (
          <Failure result={submissionResult} onRetry={() => setScreen("entry")} />
        )}
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-border px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Specific evidence, plainly explained. No account required.</p>
        <p>ShortList prototype · global public-web assessment</p>
      </footer>
    </main>
  );
}

function getAssessmentResult(
  result: DomainAssessmentSubmissionResult | undefined,
): StoredAssessmentResult | undefined {
  return result?.kind === "completed" || result?.kind === "cached" ? result.result : undefined;
}

function isSocialProfile(domain: string): boolean {
  return ["facebook.com", "instagram.com"].some(
    (socialDomain) => domain === socialDomain || domain.endsWith(`.${socialDomain}`),
  );
}

function Entry({
  domain,
  setDomain,
  error,
  onSubmit,
}: {
  domain: string;
  setDomain: (value: string) => void;
  error: string;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,.75fr)] lg:gap-16">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-sun-soft px-3 py-1.5 text-xs font-bold uppercase">
          <Leaf className="size-4" aria-hidden="true" /> Checking AI search on your behalf
        </div>
        <h1 className="display-face max-w-3xl text-5xl leading-[1.02] font-bold sm:text-7xl">
          See how your website speaks to the people you want to reach.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          We assess your public website, then turn what it says into buyer profiles, likely
          questions, and practical LLM findings. Your website evidence and the model's
          interpretation stay clearly labelled.
        </p>
        <form className="mt-8 max-w-xl" onSubmit={onSubmit} noValidate>
          <label htmlFor="domain" className="mb-2 block text-sm font-bold">
            Your business website
          </label>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative min-w-0">
              <Globe2
                className="absolute top-3.5 left-3.5 size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="domain"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "domain-error" : "domain-help"}
                className="h-12 border-2 bg-card pl-11 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6 text-base">
              Check my website <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          {error ? (
            <p
              id="domain-error"
              role="alert"
              className="mt-2 flex items-center gap-2 text-sm font-semibold text-destructive"
            >
              <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : (
            <p id="domain-help" className="mt-2 text-sm text-muted-foreground">
              Use your own domain, not a social-media profile.
            </p>
          )}
        </form>
      </div>
      <WebsiteSketch />
    </div>
  );
}

function WebsiteSketch() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -top-5 -right-2 rotate-3 rounded-sm border border-ink bg-sun px-3 py-2 text-xs font-bold shadow-[3px_3px_0_var(--ink)]">
        AI SEARCH CHECK
      </div>
      <div className="overflow-hidden rounded-lg border-2 border-ink bg-card shadow-[8px_8px_0_var(--ink)]">
        <div className="flex items-center gap-2 border-b-2 border-ink bg-secondary px-4 py-3">
          <span className="size-2.5 rounded-full bg-coral" />
          <span className="size-2.5 rounded-full bg-sun" />
          <span className="size-2.5 rounded-full bg-leaf" />
          <span className="ml-2 h-6 flex-1 rounded-sm border border-border bg-paper" />
        </div>
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="display-face text-xl font-bold">Harbour Handywork</div>
            <Wrench className="size-6 text-leaf" />
          </div>
          <div className="h-24 rounded-md bg-leaf-soft p-4">
            <div className="h-3 w-2/3 rounded-full bg-leaf" />
            <div className="mt-3 h-2 w-full rounded-full bg-paper" />
            <div className="mt-2 h-2 w-4/5 rounded-full bg-paper" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {["Repair", "Maintain", "Tidy"].map((word, index) => (
              <div
                key={word}
                className={cn(
                  "rounded-md border border-border p-3 text-center text-xs font-bold",
                  index === 1 ? "bg-sun-soft" : "bg-paper",
                )}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-8 -left-5 grid size-20 -rotate-6 place-items-center rounded-full border-2 border-ink bg-coral-soft shadow-[4px_4px_0_var(--ink)]">
        <Search className="size-9 text-coral" />
      </div>
    </div>
  );
}

function Refusal({ onBack }: { onBack: () => void }) {
  return (
    <StateShell
      icon={<ShieldCheck />}
      kicker="Safe stop"
      title="That isn’t a business website."
      body="We can only assess a public website you own or manage. Social profiles, private pages, files and local network addresses aren’t accepted."
    >
      <div className="rounded-md border border-border bg-coral-soft p-4">
        <p className="font-bold">Try the address from your browser bar</p>
        <p className="mt-1 text-sm text-muted-foreground">For example: yourbusiness.co.nz</p>
      </div>
      <Button className="mt-6 h-11" onClick={onBack}>
        <ArrowLeft aria-hidden="true" /> Enter another website
      </Button>
    </StateShell>
  );
}

function AssessmentProgress({
  domain,
  result,
}: {
  domain: string;
  result: DomainAssessmentSubmissionResult | undefined;
}) {
  const assessmentStages = [
    ["Website opened", "Checking that public pages are reachable."],
    ["Business details checked", "Reading services, proof, and service-area information."],
    ["Buyer profile identified", "Creating three evidence-led buyer profiles."],
    ["Questions buyers ask AI", "Identifying the questions those buyers are likely to ask."],
    [
      "Local context checked",
      "Using service-area evidence from the website to set the local context.",
    ],
    ["Compiling results for you", "Organising the website assessment into your report."],
  ] as const;
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStage((current) => Math.min(current + 1, assessmentStages.length - 1));
    }, 1_150);
    return () => window.clearInterval(timer);
  }, [assessmentStages.length]);

  return (
    <StateShell
      icon={<FileSearch />}
      kicker="Assessment in progress"
      title="Following the public trail."
      body="Your submitted domain stays visible while secure server-side checks assemble dated public website evidence and LLM findings."
    >
      <div className="mt-5 flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-bold">
        <Globe2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate">{domain}</span>
      </div>
      <div className="mt-7 overflow-hidden rounded-md border border-border bg-card">
        <div className="h-2 overflow-hidden bg-sun-soft" aria-hidden="true">
          <div
            className="h-full bg-leaf transition-[width] duration-700 ease-out"
            style={{ width: `${((activeStage + 1) / assessmentStages.length) * 100}%` }}
          />
        </div>
        <ul className="divide-y divide-border" aria-live="polite">
          {assessmentStages.map(([title, note], index) => {
            const isComplete = index < activeStage;
            const isActive = index === activeStage;
            return (
              <li
                key={title}
                data-state={isComplete ? "complete" : isActive ? "active" : "pending"}
                data-testid={`assessment-stage-${index}`}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4"
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 place-items-center rounded-full",
                    isComplete
                      ? "bg-leaf text-primary-foreground"
                      : isActive
                        ? "bg-sun text-ink ring-2 ring-sun/40 ring-offset-2"
                        : "bg-sun-soft text-ink",
                  )}
                >
                  {isComplete ? <Check className="size-4" /> : <Clock3 className="size-4" />}
                </span>
                <div>
                  <p className="font-bold">{title}</p>
                  <p className="text-sm text-muted-foreground">{note}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Showing the assessment sequence while your result is prepared.
      </p>
      {result ? (
        <p className="mt-6 text-sm text-muted-foreground" role="status">
          {result.kind === "limited"
            ? "We could not gather enough safe public evidence for a fair assessment."
            : "We could not complete that assessment just now. Please try again."}
        </p>
      ) : null}
    </StateShell>
  );
}

function ReportReveal({
  email,
  setEmail,
  error,
  onSubmit,
}: {
  email: string;
  setEmail: (value: string) => void;
  error: string;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <StateShell
      icon={<Mail />}
      kicker="Your assessment is ready"
      title="See your free website report."
      body="Enter an email address to reveal this report on this device. We do not send email or create a delivery record at this stage."
    >
      <form className="mt-7 max-w-xl" onSubmit={onSubmit} noValidate>
        <label htmlFor="email" className="mb-2 block text-sm font-bold">
          Email address
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@yourbusiness.co.nz"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "email-error" : "email-help"}
          className="h-12 border-2 bg-card text-base"
        />
        <p id="email-help" className="mt-2 text-sm text-muted-foreground">
          This is a local reveal step. PDF and email delivery will be offered separately in a later
          release.
        </p>
        {error ? (
          <p id="email-error" className="mt-3 text-sm font-semibold text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="lg" className="mt-6 h-12">
          See free report now <ArrowRight />
        </Button>
      </form>
    </StateShell>
  );
}

function SearchResult({
  result,
  onStartOver,
}: {
  result: StoredAssessmentResult;
  onStartOver: () => void;
}) {
  if (isStoredGeoAssessment(result)) {
    return <GeoSearchResult result={result} onStartOver={onStartOver} />;
  }
  return (
    <div className="mx-auto max-w-3xl">
      <section className="rounded-lg border-2 border-ink bg-card p-6 shadow-[6px_6px_0_var(--ink)]">
        <p className="text-xs font-bold uppercase text-muted-foreground">Saved assessment</p>
        <h1 className="display-face mt-2 text-3xl font-bold">
          This earlier assessment needs a refresh.
        </h1>
        <p className="mt-3 text-muted-foreground">
          {result.normalisedDomain} was assessed with an older result format. ShortList now uses a
          website-led report with buyer profiles and stored LLM findings, so it will not show an old
          external-search view in its place.
        </p>
      </section>
      <div className="mt-7 flex justify-end">
        <Button variant="outline" className="h-12 bg-card" onClick={onStartOver}>
          <ArrowLeft /> Check another website
        </Button>
      </div>
    </div>
  );
}

function GeoSearchResult({
  result,
  onStartOver,
}: {
  result: StoredGeoAssessment;
  onStartOver: () => void;
}) {
  const businessName = result.profile.businessName?.value ?? result.normalisedDomain;
  const modelFindings = result.findings.model_knowledge;
  const serviceAreas = result.profile.serviceAreas.map((area) => area.value);
  const overview = [
    result.profile.valuePropositions.map((item) => item.value).join(" "),
    result.profile.services.length > 0
      ? `Services identified: ${result.profile.services.map((service) => service.value).join(", ")}.`
      : "The website did not make its services clear enough to identify.",
    serviceAreas.length > 0 ? `Service areas: ${serviceAreas.join(", ")}.` : null,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 border-b-2 border-ink pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Your website assessment</p>
          <h1 className="display-face mt-2 text-4xl font-bold sm:text-5xl">
            A practical first look at {businessName}.
          </h1>
        </div>
        <div className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-primary-foreground">
          <Clock3 className="mr-2 inline size-4" aria-hidden="true" />
          {formatUtcTime(result.triggeredAtUtc)}
          <br />
          <span className="font-normal opacity-80">UTC observation time</span>
        </div>
      </div>

      <section className="mt-6 rounded-lg border-2 border-ink bg-card p-5 shadow-[6px_6px_0_var(--ink)] sm:p-7">
        <p className="text-xs font-bold uppercase text-muted-foreground">Website assessed</p>
        <h2 className="display-face mt-1 text-2xl font-bold">{result.normalisedDomain}</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          We read the public website and asked the model to organise what it found. This report does
          not show an external web-search ranking.
        </p>
      </section>

      <section className="mt-7 rounded-lg border-2 border-ink bg-leaf-soft p-5 shadow-[6px_6px_0_var(--ink)] sm:p-7">
        <p className="text-xs font-bold uppercase text-muted-foreground">Business overview</p>
        <h2 className="display-face mt-1 text-2xl font-bold">What the website says about you</h2>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {overview || result.excerpt}
        </p>
        {result.profile.limitations.length > 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            <strong>Evidence limits:</strong> {result.profile.limitations.join(" ")}
          </p>
        ) : null}
      </section>

      <section className="mt-7" aria-labelledby="buyer-profiles-title">
        <p className="text-xs font-bold uppercase text-muted-foreground">Buyer profiles</p>
        <h2 id="buyer-profiles-title" className="display-face mt-1 text-3xl font-bold">
          Three people your website appears to be trying to reach.
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Each profile and question is an LLM interpretation of the assessed website copy. Treat it
          as a starting point for improving your message.
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {result.icps.map((icp) => {
            const questions = modelFindings.filter((finding) => finding.icpId === icp.id);
            return (
              <article
                key={icp.id}
                data-testid={`icp-${icp.id}`}
                className="rounded-lg border-2 border-ink bg-secondary p-5 shadow-[5px_5px_0_var(--ink)]"
              >
                <h3 className="display-face text-2xl font-bold">{icp.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{icp.audienceDescription}</p>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  Questions they may ask
                </p>
                <ol className="mt-3 space-y-3">
                  {questions.map((finding, index) => (
                    <li
                      key={finding.questionId}
                      data-testid="icp-question"
                      className="border-t border-border pt-3 text-sm"
                    >
                      <p className="font-bold">
                        {index + 1}. {finding.questionText}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {finding.answerSummary ?? "The model did not retain a usable answer."}
                      </p>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-muted-foreground">{icp.uncertainty}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-7 rounded-lg border-2 border-ink bg-sun-soft p-5 shadow-[6px_6px_0_var(--ink)] sm:p-7">
        <p className="text-xs font-bold uppercase text-muted-foreground">Top findings</p>
        <h2 className="display-face mt-1 text-2xl font-bold">What the model returned</h2>
        <ul className="mt-4 space-y-3">
          {modelFindings.slice(0, 3).map((finding) => (
            <li key={finding.questionId} className="border-t border-border pt-3 text-sm">
              <strong>{finding.questionText}</strong>
              <span className="text-muted-foreground"> — {finding.answerSummary}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          These are stored LLM findings from this assessment. They are not a live-web result or a
          permanent ranking.
        </p>
      </section>
      <div className="mt-7 flex justify-end">
        <Button variant="outline" className="h-12 bg-card" onClick={onStartOver}>
          <ArrowLeft /> Check another website
        </Button>
      </div>
    </div>
  );
}

function isStoredGeoAssessment(result: StoredAssessmentResult): result is StoredGeoAssessment {
  return "profile" in result && "findings" in result;
}

function formatUtcTime(value: string): string {
  return new Intl.DateTimeFormat("en-NZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

function Failure({
  result,
  onRetry,
}: {
  result: DomainAssessmentSubmissionResult;
  onRetry: () => void;
}) {
  const content = failureContent(result);

  return (
    <StateShell
      icon={content.kind === "limited" ? <XCircle /> : <AlertTriangle />}
      kicker={content.kicker}
      title={content.title}
      body={content.body}
    >
      <div className="mt-6 space-y-3 rounded-md border border-border bg-card p-5">
        <h2 className="font-bold">{content.nextStepsTitle}</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {content.nextSteps.map((step, index) => (
            <li key={step} className="flex gap-2">
              {index === content.nextSteps.length - 1 && content.kind === "limited" ? (
                <Wrench className="size-4 shrink-0 text-primary" />
              ) : (
                <Check className="size-4 shrink-0 text-primary" />
              )}
              {step}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onRetry} className="h-11">
          <RefreshCw /> {content.retryLabel}
        </Button>
        {content.kind === "limited" ? (
          <Button variant="outline" className="h-11 bg-card">
            <Mail /> Contact support
          </Button>
        ) : null}
      </div>
      {content.kind === "limited" ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Support can investigate technical access issues, but cannot manually create or promise an
          assessment.
        </p>
      ) : null}
      {content.supportRef ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Support reference: {content.supportRef}
        </p>
      ) : null}
    </StateShell>
  );
}

function failureContent(result: DomainAssessmentSubmissionResult) {
  switch (result.kind) {
    case "assessment_unavailable":
      return {
        kind: result.kind,
        kicker: "Assessment unavailable",
        title: "The assessment service is temporarily unavailable.",
        body: "Your assessment could not be completed. Please try again shortly.",
        nextStepsTitle: "What you can do",
        nextSteps: ["Try again shortly."],
        retryLabel: "Try again",
        supportRef: result.supportRef,
      };
    case "admission_rejected":
      return {
        kind: result.kind,
        kicker: "Request temporarily limited",
        title: "Please try again later.",
        body: "This request is temporarily limited. No assessment was made for this website.",
        nextStepsTitle: "What you can do",
        nextSteps: ["Try again later."],
        retryLabel: "Try another website",
      };
    case "limited":
      return {
        kind: result.kind,
        kicker: "Not enough evidence",
        title: "We couldn’t make a fair assessment.",
        body: "The automated check didn’t find enough public website evidence to produce a useful result. That can happen when a site blocks access, is very new, or has little indexable text.",
        nextStepsTitle: "What you can do",
        nextSteps: [
          "Confirm the website address is correct.",
          "Try again after your public pages are available.",
          "Contact support if the same public site keeps failing.",
        ],
        retryLabel: "Try another website",
      };
    case "invalid_input":
      return {
        kind: result.kind,
        kicker: "Website address needed",
        title: "Enter a public website address.",
        body: "Use an address like yourbusiness.co.nz and try again.",
        nextStepsTitle: "What you can do",
        nextSteps: ["Enter a public website address."],
        retryLabel: "Try again",
      };
    case "completed":
    case "cached":
      return {
        kind: result.kind,
        kicker: "Assessment ready",
        title: "Your assessment is ready.",
        body: "Return to the website entry to start another assessment.",
        nextStepsTitle: "What you can do",
        nextSteps: ["Enter another website."],
        retryLabel: "Try another website",
      };
  }
}

function StateShell({
  icon,
  kicker,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  kicker: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 grid size-14 place-items-center rounded-lg border-2 border-ink bg-sun shadow-[4px_4px_0_var(--ink)] [&_svg]:size-7">
        {icon}
      </div>
      <p className="text-sm font-bold uppercase text-primary">{kicker}</p>
      <h1 className="display-face mt-2 text-4xl font-bold sm:text-6xl">{title}</h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">{body}</p>
      {children}
    </div>
  );
}
