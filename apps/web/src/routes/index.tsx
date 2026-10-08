import { createFileRoute } from "@tanstack/react-router";
import { Globe2, Search } from "lucide-react";

import { EntryScreen } from "@/components/assessment/entry-screen";
import {
  AssessmentProgressScreen,
  AssessmentResultScreen,
  FailureScreen,
  RefusalScreen,
  ReportRevealScreen,
} from "@/components/assessment/journey-screens";
import { useAssessmentJourney } from "@/hooks/use-assessment-journey";

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

export function Index() {
  const journey = useAssessmentJourney();
  const screen = (() => {
    switch (journey.state.screen) {
      case "entry":
        return (
          <EntryScreen
            domain={journey.state.domain}
            setDomain={journey.setDomain}
            error={journey.state.domainError}
            onSubmit={journey.submitDomain}
          />
        );
      case "refusal":
        return <RefusalScreen onBack={journey.reset} />;
      case "progress":
        return <AssessmentProgressScreen domain={journey.state.domain} />;
      case "reveal":
        return (
          <ReportRevealScreen
            email={journey.state.email}
            setEmail={journey.setEmail}
            error={journey.state.emailError}
            onSubmit={journey.revealReport}
          />
        );
      case "result":
        return <AssessmentResultScreen result={journey.state.result} onStartOver={journey.reset} />;
      case "failure":
        return <FailureScreen result={journey.state.result} onRetry={journey.reset} />;
    }
  })();
  return (
    <main className="paper-grid min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-paper/95">
        <div className="mx-auto grid min-h-16 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
          <button
            className="flex min-w-0 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={journey.reset}
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
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">{screen}</section>
      <footer className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-border px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>Specific evidence, plainly explained. No account required.</p>
        <p>ShortList prototype · global public-web assessment</p>
      </footer>
    </main>
  );
}
