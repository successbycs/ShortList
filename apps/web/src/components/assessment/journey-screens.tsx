import { useEffect, useState, type FormEvent, type ReactNode } from "react";
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
import type { DomainAssessmentSubmissionResult } from "@/functions/submit-domain-assessment";
import { cn } from "@/lib/utils";
import type { StoredGeoAssessment } from "@/server/geo-assessment-repository";
import type { StoredAssessmentResult } from "@/server/live-assessment";

export function RefusalScreen({ onBack }: { onBack: () => void }) {
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

const stages = [
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
export function AssessmentProgressScreen({ domain }: { domain: string }) {
  const [activeStage, setActiveStage] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveStage((current) => Math.min(current + 1, stages.length - 1)),
      1_150,
    );
    return () => window.clearInterval(timer);
  }, []);
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
            style={{ width: `${((activeStage + 1) / stages.length) * 100}%` }}
          />
        </div>
        <ul className="divide-y divide-border" aria-live="polite">
          {stages.map(([title, note], index) => {
            const complete = index < activeStage;
            const active = index === activeStage;
            return (
              <li
                key={title}
                data-state={complete ? "complete" : active ? "active" : "pending"}
                data-testid={`assessment-stage-${index}`}
                className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4"
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-6 place-items-center rounded-full",
                    complete
                      ? "bg-leaf text-primary-foreground"
                      : active
                        ? "bg-sun text-ink ring-2 ring-sun/40 ring-offset-2"
                        : "bg-sun-soft text-ink",
                  )}
                >
                  {complete ? <Check className="size-4" /> : <Clock3 className="size-4" />}
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
    </StateShell>
  );
}

export function ReportRevealScreen({
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

export function AssessmentResultScreen({
  result,
  onStartOver,
}: {
  result: StoredAssessmentResult;
  onStartOver: () => void;
}) {
  if (!isGeo(result))
    return (
      <div className="mx-auto max-w-3xl">
        <section className="rounded-lg border-2 border-ink bg-card p-6 shadow-[6px_6px_0_var(--ink)]">
          <p className="text-xs font-bold uppercase text-muted-foreground">Saved assessment</p>
          <h1 className="display-face mt-2 text-3xl font-bold">
            This earlier assessment needs a refresh.
          </h1>
          <p className="mt-3 text-muted-foreground">
            {result.normalisedDomain} was assessed with an older result format. ShortList now uses a
            website-led report with buyer profiles and stored LLM findings, so it will not show an
            old external-search view in its place.
          </p>
        </section>
        <StartOver onStartOver={onStartOver} />
      </div>
    );
  const businessName = result.profile.businessName?.value ?? result.normalisedDomain;
  const findings = result.findings.model_knowledge;
  const overview = [
    result.profile.valuePropositions.map((item) => item.value).join(" "),
    result.profile.services.length
      ? `Services identified: ${result.profile.services.map((service) => service.value).join(", ")}.`
      : "The website did not make its services clear enough to identify.",
    result.profile.serviceAreas.length
      ? `Service areas: ${result.profile.serviceAreas.map((area) => area.value).join(", ")}.`
      : null,
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
        {result.profile.limitations.length ? (
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
            const questions = findings.filter((finding) => finding.icpId === icp.id);
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
          {findings.slice(0, 3).map((finding) => (
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
      <StartOver onStartOver={onStartOver} />
    </div>
  );
}

export function FailureScreen({
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
      {content.supportRef ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Support reference: {content.supportRef}
        </p>
      ) : null}
      {content.kind === "limited" ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Support can investigate technical access issues, but cannot manually create or promise an
          assessment.
        </p>
      ) : null}
    </StateShell>
  );
}

function StartOver({ onStartOver }: { onStartOver: () => void }) {
  return (
    <div className="mt-7 flex justify-end">
      <Button variant="outline" className="h-12 bg-card" onClick={onStartOver}>
        <ArrowLeft /> Check another website
      </Button>
    </div>
  );
}
function isGeo(result: StoredAssessmentResult): result is StoredGeoAssessment {
  return "profile" in result && "findings" in result;
}
function formatUtcTime(value: string) {
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
    default:
      return {
        kind: result.kind,
        kicker: "Assessment unavailable",
        title: "The assessment service is temporarily unavailable.",
        body: "Your assessment could not be completed. Please try again shortly.",
        nextStepsTitle: "What you can do",
        nextSteps: ["Try again shortly."],
        retryLabel: "Try again",
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
  icon: ReactNode;
  kicker: string;
  title: string;
  body: string;
  children: ReactNode;
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
