import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const serverFunction = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-start")>()),
  useServerFn: () => serverFunction.invoke,
}));

vi.mock("@/components/turnstile-widget", () => ({
  TurnstileWidget: ({ onTokenChange }: { onTokenChange: (token: string | null) => void }) => (
    <button type="button" onClick={() => onTokenChange("test-turnstile-token")}>
      Complete security check
    </button>
  ),
}));

import { Index } from "@/routes/index";

const savedResult = {
  kind: "completed",
  result: {
    assessmentId: "assessment-1",
    normalisedDomain: "greengeckogardens.co.nz",
    triggeredAtUtc: "2026-10-05T10:00:00.000Z",
    excerpt: "Green Gecko Gardens provides garden design and maintenance in Auckland.",
    currentWeb: {
      contractVersion: "v1",
      assessmentId: "assessment-1",
      mode: "web_grounded",
      question: "Which Auckland garden businesses appear today?",
      executedAtUtc: "2026-10-05T10:00:00.000Z",
      modelId: "gpt-6-luna",
      searchConfigurationRef: "test-web",
      locationContext: {
        kind: "web_search_location",
        city: "Auckland",
        region: "Auckland",
        country: "NZ",
        timezone: "Pacific/Auckland",
      },
      observedResults: [{ position: 1, name: "Example Gardens", summary: "Garden care" }],
      citations: [{ title: "Example source", url: "https://example.co.nz" }],
      outcome: "completed",
      reasonCode: "completed",
    },
    modelKnowledge: {
      contractVersion: "v1",
      assessmentId: "assessment-1",
      mode: "model_knowledge",
      question: "Which Auckland garden businesses may be known?",
      executedAtUtc: "2026-10-05T10:00:00.000Z",
      modelId: "gpt-6-luna",
      searchConfigurationRef: "test-no-web",
      locationContext: { kind: "no_web_search" },
      observedResults: [{ position: 1, name: "Example Gardens", summary: "Garden care" }],
      citations: [],
      freshnessNotice:
        "This response did not use a live web search. It may be incomplete or out of date and is not a verified current result.",
      outcome: "completed",
      reasonCode: "completed",
    },
  },
} as const;

describe("protected prototype reveal journey", () => {
  beforeEach(() => {
    serverFunction.invoke.mockReset();
    serverFunction.invoke.mockResolvedValue(savedResult);
  });

  async function startProtectedAssessment() {
    fireEvent.click(screen.getByRole("button", { name: /Complete security check/i }));
    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));
    await screen.findByLabelText("Locked fuller result preview");
  }

  async function moveToEmailStep() {
    await startProtectedAssessment();
    fireEvent.click(screen.getByRole("button", { name: /Send my free assessment/i }));
  }

  it("keeps the fuller result locked until separate delivery consent and confirmation", async () => {
    render(<Index />);

    await startProtectedAssessment();
    expect(screen.getByLabelText("Locked fuller result preview")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Send my free assessment/i }));

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "mara@example.co.nz" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /Email me this assessment/i }));
    fireEvent.click(screen.getByRole("button", { name: /Send my assessment/i }));

    expect(screen.getByTestId("masked-email")).toHaveTextContent("m•••@example.co.nz");
    fireEvent.click(screen.getByRole("button", { name: /Confirm and reveal result/i }));
    expect(screen.getByRole("heading", { name: /Keep current-web evidence/i })).toBeInTheDocument();
    expect(screen.getByText(/not a verified current result/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Future full assessment/i })).toBeDisabled();
  });

  it("lets a reviewer return to the editable email step", async () => {
    render(<Index />);
    await moveToEmailStep();
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "mara@example.co.nz" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /Email me this assessment/i }));
    fireEvent.click(screen.getByRole("button", { name: /Send my assessment/i }));
    fireEvent.click(screen.getByRole("button", { name: /Change email/i }));
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("uses the shared admission gate before entering the checking view", () => {
    render(<Index />);

    fireEvent.change(screen.getByLabelText("Your business website"), {
      target: { value: "127.0.0.1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/public business website/i);
    expect(screen.queryByText("Following the public trail.")).not.toBeInTheDocument();
  });

  it("normalises the submitted domain and keeps it visible during checking", async () => {
    render(<Index />);
    let completeAssessment: ((result: typeof savedResult) => void) | undefined;
    serverFunction.invoke.mockImplementationOnce(
      () =>
        new Promise<typeof savedResult>((resolve) => {
          completeAssessment = resolve;
        }),
    );

    fireEvent.change(screen.getByLabelText("Your business website"), {
      target: { value: "HTTPS://Harbour-Handyman.CO.NZ/path" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Complete security check/i }));
    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

    expect(await screen.findByText("harbour-handyman.co.nz")).toBeInTheDocument();
    completeAssessment?.(savedResult);
  });
});
