import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const serverFunction = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock("@tanstack/react-start", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-start")>()),
  useServerFn: () => serverFunction.invoke,
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

const geoFindings = Array.from({ length: 9 }, (_, index) => ({
  icpId: ["busy-homeowners", "property-managers", "garden-renovators"][Math.floor(index / 3)]!,
  questionId: `question-${index + 1}`,
  questionText: `How can a buyer solve need ${index + 1}?`,
  buyerIntent: "Find a provider",
  testedClaim: "The submitted business is relevant.",
  answerSummary: `Assessment finding ${index + 1}.`,
  submittedBusinessMention: "uncertain" as const,
  descriptionAccuracy: "not_applicable" as const,
  recommendationFit: "uncertain" as const,
  sources: [],
  websiteContentGaps: [],
  limitations: ["Evidence is limited."],
  confidence: "low" as const,
}));

const savedGeoResult = {
  kind: "completed" as const,
  result: {
    assessmentId: "geo-assessment-1",
    normalisedDomain: "example-gardens.test",
    triggeredAtUtc: "2026-10-06T10:00:00.000Z",
    excerpt: "Example Gardens provides garden care for busy homeowners.",
    profile: {
      businessName: { value: "Example Gardens", evidenceIds: ["source-1"], confidence: "high" },
      websiteDomain: "example-gardens.test",
      services: [{ value: "Garden care", evidenceIds: ["source-1"], confidence: "high" }],
      serviceAreas: [],
      audienceSignals: [],
      valuePropositions: [],
      proofPoints: [],
      differentiators: [],
      contentGaps: [],
      limitations: ["The evidence is brief."],
      confidence: "medium" as const,
    },
    icps: [
      {
        id: "busy-homeowners",
        label: "Busy homeowners",
        audienceDescription: "Homeowners seeking regular care.",
        buyerSituation: "Needs a reliable provider.",
        needs: ["Garden care"],
        decisionCriteria: ["Reliability"],
        evidenceIds: ["source-1"],
        confidence: "medium" as const,
        uncertainty: "The site is brief.",
      },
      {
        id: "property-managers",
        label: "Property managers",
        audienceDescription: "Managers seeking maintenance.",
        buyerSituation: "Needs a dependable provider.",
        needs: ["Maintenance"],
        decisionCriteria: ["Communication"],
        evidenceIds: ["source-1"],
        confidence: "medium" as const,
        uncertainty: "The site is brief.",
      },
      {
        id: "garden-renovators",
        label: "Garden renovators",
        audienceDescription: "Owners planning a change.",
        buyerSituation: "Needs project help.",
        needs: ["Advice"],
        decisionCriteria: ["Relevant experience"],
        evidenceIds: ["source-1"],
        confidence: "medium" as const,
        uncertainty: "The site is brief.",
      },
    ],
    findings: { current_web: geoFindings, model_knowledge: geoFindings },
  },
};

describe("protected prototype reveal journey", () => {
  beforeEach(() => {
    serverFunction.invoke.mockReset();
    serverFunction.invoke.mockResolvedValue(savedResult);
  });

  async function startAssessment() {
    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));
    await screen.findByRole("heading", { name: /See your free website report/i });
  }

  async function revealReport() {
    await startAssessment();
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "mara@example.co.nz" },
    });
    fireEvent.click(screen.getByRole("button", { name: /See free report now/i }));
  }

  it("reveals the stored report after a local email entry without claiming delivery", async () => {
    render(<Index />);

    await startAssessment();
    expect(screen.getByText(/do not send email or create a delivery record/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "mara@example.co.nz" },
    });
    fireEvent.click(screen.getByRole("button", { name: /See free report now/i }));
    expect(
      screen.getByRole("heading", { name: /This earlier assessment needs a refresh/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/will not show an old external-search view/i)).toBeInTheDocument();
    expect(serverFunction.invoke).toHaveBeenCalledTimes(1);
  });

  it("keeps the report hidden until a valid email is entered", async () => {
    render(<Index />);
    await startAssessment();
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /See free report now/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email address.");
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
    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

    expect(await screen.findByText("harbour-handyman.co.nz")).toBeInTheDocument();
    completeAssessment?.(savedResult);
  });

  it("animates the assessment sequence from yellow clocks to completed checks", () => {
    vi.useFakeTimers();
    try {
      serverFunction.invoke.mockImplementationOnce(() => new Promise(() => undefined));
      render(<Index />);

      fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

      expect(screen.getByText("Buyer profile identified")).toBeInTheDocument();
      expect(screen.getByText("Questions buyers ask AI")).toBeInTheDocument();
      expect(screen.getByText("Local context checked")).toBeInTheDocument();
      expect(screen.getByTestId("assessment-stage-0")).toHaveAttribute("data-state", "active");
      expect(screen.getByTestId("assessment-stage-1")).toHaveAttribute("data-state", "pending");

      act(() => vi.advanceTimersByTime(1_150));

      expect(screen.getByTestId("assessment-stage-0")).toHaveAttribute("data-state", "complete");
      expect(screen.getByTestId("assessment-stage-1")).toHaveAttribute("data-state", "active");
      act(() => vi.advanceTimersByTime(4_600));
      expect(screen.getByText("Compiling results for you")).toBeInTheDocument();
      expect(screen.getByTestId("assessment-stage-5")).toHaveAttribute("data-state", "active");
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    [
      "assessment_unavailable",
      { kind: "assessment_unavailable" },
      "The assessment service is temporarily unavailable.",
      "Your assessment could not be completed. Please try again shortly.",
    ],
    [
      "admission_rejected",
      { kind: "admission_rejected", reasonCode: "rate_limited" },
      "Please try again later.",
      "This request is temporarily limited. No assessment was made for this website.",
    ],
    [
      "limited",
      {
        kind: "limited",
        assessment: {
          assessmentId: "assessment-1",
          normalisedDomain: "greengeckogardens.co.nz",
          triggeredAtUtc: "2026-10-05T10:00:00.000Z",
        },
        reasonCode: "evidence_insufficient",
      },
      "We couldn’t make a fair assessment.",
      "The automated check didn’t find enough public website evidence to produce a useful result. That can happen when a site blocks access, is very new, or has little indexable text.",
    ],
  ] as const)(
    "shows the public-safe %s outcome without collapsing it into limited evidence",
    async (_kind, result, title, body) => {
      serverFunction.invoke.mockResolvedValueOnce(result);
      render(<Index />);

      fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

      expect(await screen.findByRole("heading", { name: title })).toBeInTheDocument();
      expect(screen.getByText(body)).toBeInTheDocument();
      if (result.kind !== "limited") {
        expect(
          screen.queryByText(
            /didn’t find enough public website evidence to produce a useful result/i,
          ),
        ).not.toBeInTheDocument();
      }
    },
  );

  it("shows a cached assessment exactly like a completed assessment without another submission", async () => {
    serverFunction.invoke.mockResolvedValueOnce({ ...savedResult, kind: "cached" });
    render(<Index />);

    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

    expect(
      await screen.findByRole("heading", { name: /See your free website report/i }),
    ).toBeInTheDocument();
    expect(serverFunction.invoke).toHaveBeenCalledTimes(1);
  });

  it("renders the persisted GEO graph instead of a generic comparable-business list", async () => {
    serverFunction.invoke.mockResolvedValueOnce(savedGeoResult);
    render(<Index />);

    await revealReport();

    expect(screen.getByText(/A practical first look at Example Gardens/i)).toBeInTheDocument();
    expect(screen.getByText("Busy homeowners")).toBeInTheDocument();
    expect(screen.getByText("What the model returned")).toBeInTheDocument();
    expect(screen.getAllByText(/How can a buyer solve need 1/i)).toHaveLength(2);
    for (const id of ["busy-homeowners", "property-managers", "garden-renovators"]) {
      expect(within(screen.getByTestId(`icp-${id}`)).getAllByTestId("icp-question")).toHaveLength(
        3,
      );
    }
    expect(screen.getByText(/We read the public website/i)).toBeInTheDocument();
    expect(screen.getByText(/LLM interpretation/i)).toBeInTheDocument();
    expect(screen.getAllByText("The site is brief.")).toHaveLength(3);
    expect(screen.queryByText(/Which Auckland garden businesses/i)).not.toBeInTheDocument();
  });
});
