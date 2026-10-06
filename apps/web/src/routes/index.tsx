import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSearch,
  Globe2,
  Leaf,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { admitPublicDomain } from "@/lib/domain-admission";
import { TurnstileWidget } from "@/components/turnstile-widget";
import {
  submitDomainAssessment,
  type DomainAssessmentSubmissionResult,
} from "@/functions/submit-domain-assessment";
import type { StoredAiEvidence } from "@/server/ai-evidence-repository";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ShortList — See the web result and model view" },
      {
        name: "description",
        content:
          "A dated, evidence-based look at how your Auckland business appears online, plus a clearly separate model-knowledge view.",
      },
      { property: "og:title", content: "ShortList — See the web result and model view" },
      {
        property: "og:description",
        content:
          "A dated, evidence-based look at how your Auckland business appears online, plus a clearly separate model-knowledge view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Screen =
  | "entry"
  | "refusal"
  | "progress"
  | "teaser"
  | "confirmation"
  | "result"
  | "consent"
  | "entitlement"
  | "rateLimit"
  | "exhausted"
  | "failure";

export function Index() {
  const [screen, setScreen] = useState<Screen>("entry");
  const [domain, setDomain] = useState("harbourhandyman.co.nz");
  const [domainError, setDomainError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<DomainAssessmentSubmissionResult>();
  const [email, setEmail] = useState("");
  const [deliveryConsent, setDeliveryConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
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

    if (!turnstileToken) {
      setDomainError("Complete the security check before we assess your website.");
      return;
    }

    setDomain(admission.normalisedDomain);
    setDomainError("");
    setScreen("progress");
    const result = await submitAssessment({
      data: { domain: admission.normalisedDomain, turnstileToken },
    });
    setSubmissionResult(result);
    setTurnstileToken(null);
    if (result.kind === "completed" || result.kind === "cached") {
      setScreen("teaser");
      return;
    }
    if (result.kind === "invalid_input") {
      setDomainError("Enter a public website address like yourbusiness.co.nz.");
      setScreen("entry");
      return;
    }
    setScreen("failure");
  }

  function submitEmail(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (!deliveryConsent) {
      setEmailError("Please agree to receive this report by email.");
      return;
    }
    setEmailError("");
    setScreen("confirmation");
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
            <MapPin className="size-4 text-coral" aria-hidden="true" /> Made for Auckland small
            businesses
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold sm:hidden">
            <MapPin className="size-4 text-coral" aria-hidden="true" /> Auckland
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
        {screen === "entry" && (
          <Entry
            domain={domain}
            setDomain={setDomain}
            error={domainError}
            onTurnstileTokenChange={setTurnstileToken}
            onSubmit={submitDomain}
          />
        )}
        {screen === "refusal" && <Refusal onBack={() => setScreen("entry")} />}
        {screen === "progress" && <AssessmentProgress domain={domain} result={submissionResult} />}
        {screen === "teaser" && assessmentResult && (
          <Teaser result={assessmentResult} onRequest={() => setScreen("consent")} />
        )}
        {screen === "confirmation" && (
          <Confirmation
            email={email}
            onConfirm={() => setScreen("result")}
            onChange={() => setScreen("consent")}
          />
        )}
        {screen === "result" && assessmentResult && (
          <SearchResult result={assessmentResult} onStartOver={() => setScreen("entry")} />
        )}
        {screen === "consent" && (
          <Consent
            email={email}
            setEmail={setEmail}
            deliveryConsent={deliveryConsent}
            setDeliveryConsent={setDeliveryConsent}
            marketingConsent={marketingConsent}
            setMarketingConsent={setMarketingConsent}
            error={emailError}
            onSubmit={submitEmail}
          />
        )}
        {screen === "entitlement" && <Entitlement onStartOver={() => setScreen("entry")} />}
        {screen === "rateLimit" && <RateLimit onStartOver={() => setScreen("entry")} />}
        {screen === "exhausted" && <ExhaustedEntitlement onStartOver={() => setScreen("entry")} />}
        {screen === "failure" && submissionResult && (
          <Failure result={submissionResult} onRetry={() => setScreen("entry")} />
        )}
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-border px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Specific evidence, plainly explained. No account required.</p>
        <p>ShortList prototype · Auckland, Aotearoa</p>
      </footer>
    </main>
  );
}

function getAssessmentResult(
  result: DomainAssessmentSubmissionResult | undefined,
): StoredAiEvidence | undefined {
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
  onTurnstileTokenChange,
  onSubmit,
}: {
  domain: string;
  setDomain: (value: string) => void;
  error: string;
  onTurnstileTokenChange: (token: string | null) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,.75fr)] lg:gap-16">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-sun-soft px-3 py-1.5 text-xs font-bold uppercase">
          <Leaf className="size-4" aria-hidden="true" /> A quick public-web check
        </div>
        <h1 className="display-face max-w-3xl text-5xl leading-[1.02] font-bold sm:text-7xl">
          See what customers, the web, and AI knowledge can tell you.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          We’ll look at your public website, then show two clearly labelled AI views: one
          current-web result and one no-web model-knowledge result. Evidence first. Grand claims
          firmly left at the gate.
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
          <TurnstileWidget onTokenChange={onTurnstileTokenChange} />
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
        PUBLIC WEB ONLY
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
  return (
    <StateShell
      icon={<FileSearch />}
      kicker="Assessment in progress"
      title="Following the public trail."
      body="Your submitted domain stays visible while secure server-side checks assemble dated public evidence."
    >
      <div className="mt-5 flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-bold">
        <Globe2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate">{domain}</span>
      </div>
      <div className="mt-7 overflow-hidden rounded-md border border-border bg-card">
        <div className="relative h-2 overflow-hidden bg-leaf-soft">
          <div className="scan-line absolute inset-y-0 w-1/3 bg-leaf" />
        </div>
        <ul className="divide-y divide-border">
          {[
            ["Website opened", "Public pages are reachable", true],
            ["Business details checked", "Services and Auckland signals found", true],
            ["Current-web result", "One specific question, stamped in time", false],
            ["Model-knowledge result", "A separate answer with no live web search", false],
          ].map(([title, note, done]) => (
            <li key={String(title)} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 p-4">
              <span
                className={cn(
                  "mt-0.5 grid size-6 place-items-center rounded-full",
                  done ? "bg-leaf text-primary-foreground" : "bg-sun-soft text-ink",
                )}
              >
                {done ? <Check className="size-4" /> : <Clock3 className="size-4" />}
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm text-muted-foreground">{note}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
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

function Teaser({ result, onRequest }: { result: StoredAiEvidence; onRequest: () => void }) {
  return (
    <div>
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-sm font-bold uppercase text-primary">
          {result.normalisedDomain} · first look
        </p>
        <h1 className="display-face text-4xl font-bold sm:text-6xl">
          A public website can give us something solid to work with.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Here is the bounded evidence captured for this website. The dated AI views remain separate
          and are shown after you confirm the delivery address.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <EvidenceBlock
          tone="leaf"
          title="What we observed"
          icon={<CheckCircle2 />}
          items={[
            result.excerpt,
            `Assessment recorded at ${formatAucklandTime(result.triggeredAtUtc)}.`,
            "The fuller result keeps current-web evidence separate from model knowledge.",
          ]}
        />
        <EvidenceBlock
          tone="sun"
          title="What this may suggest"
          icon={<Sparkles />}
          items={[
            "The current-web view is a dated observation, not a permanent ranking.",
            "The model-knowledge view does not use a live web search.",
            "The next screen shows only the stored result for this assessment.",
          ]}
        />
      </div>
      <section
        aria-label="Locked fuller result preview"
        className="relative mt-8 overflow-hidden rounded-lg border-2 border-ink bg-card p-5 shadow-[5px_5px_0_var(--ink)]"
      >
        <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
          <p className="text-xs font-bold uppercase text-muted-foreground">Fuller result preview</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="h-20 rounded bg-leaf-soft" />
            <div className="h-20 rounded bg-sun-soft" />
          </div>
        </div>
        <div className="absolute inset-0 grid place-items-center bg-card/65 px-5 text-center">
          <div>
            <p className="font-bold">The fuller on-page result is ready to unlock.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter an email and confirm it in this local demo. No email is sent.
            </p>
          </div>
        </div>
      </section>
      <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-lg text-sm text-muted-foreground">
          The full result keeps the dated current-web and no-web model-knowledge views separate.
        </p>
        <Button onClick={onRequest} size="lg" className="h-12">
          Send my free assessment <ArrowRight />
        </Button>
      </div>
    </div>
  );
}

function EvidenceBlock({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone: "leaf" | "sun";
}) {
  return (
    <section
      className={cn(
        "rounded-lg border-2 border-ink p-5 shadow-[5px_5px_0_var(--ink)] sm:p-6",
        tone === "leaf" ? "bg-leaf-soft" : "bg-sun-soft",
      )}
    >
      <h2 className="display-face flex items-center gap-3 text-2xl font-bold">
        {icon}
        {title}
      </h2>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <span className="mt-2 size-2 rounded-full bg-ink" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SearchResult({
  result,
  onStartOver,
}: {
  result: StoredAiEvidence;
  onStartOver: () => void;
}) {
  const currentWeb = result.currentWeb;
  const modelKnowledge = result.modelKnowledge;
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col gap-4 border-b-2 border-ink pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Two distinct AI views</p>
          <h1 className="display-face mt-2 text-4xl font-bold sm:text-5xl">
            Keep current-web evidence and model knowledge separate.
          </h1>
        </div>
        <div className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-primary-foreground">
          <Clock3 className="mr-2 inline size-4" aria-hidden="true" />
          {formatAucklandTime(result.triggeredAtUtc)}
          <br />
          <span className="font-normal opacity-80">Auckland, New Zealand</span>
        </div>
      </div>
      <section
        aria-labelledby="current-web-title"
        className="mt-6 rounded-lg border-2 border-ink bg-card p-5 shadow-[6px_6px_0_var(--ink)] sm:p-7"
      >
        <div className="flex items-start gap-3">
          <Search className="mt-1 size-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Current-web result</p>
            <h2 id="current-web-title" className="display-face mt-1 text-2xl font-bold sm:text-3xl">
              {currentWeb.question}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This result uses a live web-search tool. Sources are shown where available.
            </p>
          </div>
        </div>
        <ol className="mt-7 divide-y divide-border border-y border-border">
          {currentWeb.observedResults.map(({ position, name, summary }) => (
            <li
              key={`${position}-${name}`}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-5"
            >
              <span className="display-face grid size-10 place-items-center rounded-full bg-sun text-xl font-bold text-ink">
                {position}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-bold">{name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0" aria-hidden="true" />
                  {summary}
                </p>
              </div>
            </li>
          ))}
        </ol>
        {currentWeb.citations.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Current-web sources">
            {currentWeb.citations.map((citation) => (
              <a
                key={citation.url}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-semibold hover:bg-sun-soft"
                href={citation.url}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink className="size-3" aria-hidden="true" />
                {citation.title}
              </a>
            ))}
          </div>
        )}
        <div className="mt-5 flex items-start gap-3 rounded-md bg-sun-soft p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            <strong>
              This is the order returned in this specific dated current-web test. Results may vary.
            </strong>
          </p>
        </div>
      </section>
      <section
        aria-labelledby="model-knowledge-title"
        className="mt-7 rounded-lg border-2 border-ink bg-secondary p-5 shadow-[6px_6px_0_var(--ink)] sm:p-7"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 size-6 shrink-0 text-coral" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Model-knowledge result · no live web search
            </p>
            <h2
              id="model-knowledge-title"
              className="display-face mt-1 text-2xl font-bold sm:text-3xl"
            >
              {modelKnowledge.question}
            </h2>
          </div>
        </div>
        <ol className="mt-6 divide-y divide-border border-y border-border">
          {modelKnowledge.observedResults.map(({ position, name, summary }) => (
            <li
              key={`${position}-${name}`}
              className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-5"
            >
              <span className="display-face grid size-10 place-items-center rounded-full bg-coral-soft text-xl font-bold text-ink">
                {position}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-bold">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex items-start gap-3 rounded-md bg-coral-soft p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden="true" />
          <p>
            <strong>
              This response did not use a live web search. It may be incomplete or out of date and
              is not a verified current result.
            </strong>
          </p>
        </div>
      </section>
      <section className="mt-8 rounded-lg border-2 border-dashed border-border bg-paper p-5">
        <p className="text-xs font-bold uppercase text-muted-foreground">Future MVP 2</p>
        <h2 className="display-face mt-1 text-2xl font-bold">
          A deeper paid assessment belongs here later.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pricing, payment and the paid scope are not decided or active in this prototype.
        </p>
        <Button disabled className="mt-4">
          Future full assessment
        </Button>
      </section>
      <div className="mt-7 flex justify-end">
        <Button variant="outline" className="h-12 bg-card" onClick={onStartOver}>
          <ArrowLeft /> Check another website
        </Button>
      </div>
    </div>
  );
}

function formatAucklandTime(value: string): string {
  return new Intl.DateTimeFormat("en-NZ", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Pacific/Auckland",
  }).format(new Date(value));
}

function maskEmail(email: string) {
  const [local, domain] = email.trim().split("@");
  return `${local?.slice(0, 1) ?? ""}•••@${domain ?? ""}`;
}

function Confirmation({
  email,
  onConfirm,
  onChange,
}: {
  email: string;
  onConfirm: () => void;
  onChange: () => void;
}) {
  return (
    <StateShell
      icon={<Mail />}
      kicker="One last check"
      title="Is this the right email?"
      body="This prototype only confirms your intended delivery address. It does not send mail or prove mailbox ownership."
    >
      <div className="mt-6 rounded-md border-2 border-ink bg-leaf-soft p-5">
        <p className="text-sm font-bold uppercase">Assessment for</p>
        <p className="mt-1 text-xl font-bold" data-testid="masked-email">
          {maskEmail(email)}
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button className="h-12" onClick={onConfirm}>
          Confirm and reveal result <ArrowRight />
        </Button>
        <Button variant="outline" className="h-12 bg-card" onClick={onChange}>
          Change email
        </Button>
      </div>
    </StateShell>
  );
}

function Consent({
  email,
  setEmail,
  deliveryConsent,
  setDeliveryConsent,
  marketingConsent,
  setMarketingConsent,
  error,
  onSubmit,
}: {
  email: string;
  setEmail: (value: string) => void;
  deliveryConsent: boolean;
  setDeliveryConsent: (value: boolean) => void;
  marketingConsent: boolean;
  setMarketingConsent: (value: boolean) => void;
  error: string;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <StateShell
      icon={<Mail />}
      kicker="Report delivery"
      title="Where should we send it?"
      body="No account is required. We only need permission to deliver this assessment."
    >
      <form className="mt-7" onSubmit={onSubmit} noValidate>
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
          When delivery is connected, the service will send a private PDF attachment here after the
          provider accepts it.
        </p>
        <div className="mt-6 space-y-4 border-t border-border pt-5">
          <label className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-3">
            <Checkbox
              className="mt-0.5 size-5"
              checked={deliveryConsent}
              onCheckedChange={(value) => setDeliveryConsent(value === true)}
            />
            <span>
              <strong className="block">
                Email me this assessment <span className="text-destructive">(required)</span>
              </strong>
              <span className="text-sm text-muted-foreground">
                I agree to ShortList sending this report and essential delivery updates.
              </span>
            </span>
          </label>
          <label className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-3">
            <Checkbox
              className="mt-0.5 size-5"
              checked={marketingConsent}
              onCheckedChange={(value) => setMarketingConsent(value === true)}
            />
            <span>
              <strong className="block">
                Send occasional practical tips{" "}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </strong>
              <span className="text-sm text-muted-foreground">
                News and useful ideas for improving public visibility. Unsubscribe anytime.
              </span>
            </span>
          </label>
        </div>
        {error && (
          <p
            id="email-error"
            role="alert"
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-destructive"
          >
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-6 h-12 w-full sm:w-auto">
          Send my assessment <ArrowRight />
        </Button>
      </form>
    </StateShell>
  );
}

function Entitlement({ onStartOver }: { onStartOver: () => void }) {
  return (
    <StateShell
      icon={<CheckCircle2 />}
      kicker="Future delivery state"
      title="A report would be on its way."
      body="This local frontend demo does not send email. When delivery is implemented, provider acceptance will mean a private PDF attachment has been handed to the email provider — not that it has reached an inbox."
    >
      <div className="mt-6 rounded-md border-2 border-ink bg-leaf-soft p-5">
        <p className="font-bold">Future resend path</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The later delivery service will handle bounded retries and a recipient-safe resend path.
          This button is visual only.
        </p>
        <Button variant="outline" className="mt-4 h-11 bg-card">
          <RefreshCw /> Preview resend state
        </Button>
      </div>
      <Button variant="ghost" className="mt-5 h-11" onClick={onStartOver}>
        <ArrowLeft /> Check another website
      </Button>
    </StateShell>
  );
}

function RateLimit({ onStartOver }: { onStartOver: () => void }) {
  return (
    <StateShell
      icon={<Clock3 />}
      kicker="Please pause"
      title="Too many requests from this browser."
      body="To keep the future service fair and affordable, it will limit repeated requests. This is a visual prototype state only; no browser or IP address is stored here."
    >
      <div className="mt-6 rounded-md border-2 border-ink bg-sun-soft p-5">
        <p className="font-bold">Try again later</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The final waiting period and privacy-minimised abuse controls will be defined in the
          safety implementation packet.
        </p>
      </div>
      <Button className="mt-6 h-11" onClick={onStartOver}>
        <ArrowLeft /> Back to website entry
      </Button>
    </StateShell>
  );
}

function ExhaustedEntitlement({ onStartOver }: { onStartOver: () => void }) {
  return (
    <StateShell
      icon={<AlertTriangle />}
      kicker="Free limit reached"
      title="This email has used its free requests."
      body="The future service will enforce the approved free-request entitlement privately. This demonstration does not collect an email or keep a customer record."
    >
      <div className="mt-6 rounded-md border-2 border-ink bg-coral-soft p-5">
        <p className="font-bold">No account has been created</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The final customer-record, duplicate-domain, and recipient-access rules belong to the
          later email and entitlement packet.
        </p>
      </div>
      <Button className="mt-6 h-11" onClick={onStartOver}>
        <ArrowLeft /> Back to website entry
      </Button>
    </StateShell>
  );
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
    </StateShell>
  );
}

function failureContent(result: DomainAssessmentSubmissionResult) {
  switch (result.kind) {
    case "verification_failed":
      return {
        kind: result.kind,
        kicker: "Security check needed",
        title: "We couldn’t verify the security check.",
        body: "Refresh the page and try the security check again before submitting your website.",
        nextStepsTitle: "What you can do",
        nextSteps: ["Refresh this page.", "Complete the security check and try again."],
        retryLabel: "Try again",
      };
    case "assessment_unavailable":
      return {
        kind: result.kind,
        kicker: "Assessment unavailable",
        title: "The assessment service is temporarily unavailable.",
        body: "No assessment was made for this website. Please try again shortly.",
        nextStepsTitle: "What you can do",
        nextSteps: ["Try again shortly."],
        retryLabel: "Try again",
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
