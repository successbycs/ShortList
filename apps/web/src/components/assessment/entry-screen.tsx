import type { FormEvent } from "react";
import { AlertTriangle, ArrowRight, Globe2, Leaf, Search, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function EntryScreen({
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
