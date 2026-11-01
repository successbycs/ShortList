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
    await screen.findByRole("heading", { name: /needs a refresh|A practical first look/i });
  }

  /** Fills the email gate on a GEO report; the email request resolves as given. */
  async function unlockReport(outcome: { kind: string } = { kind: "sent" }) {
    await startAssessment();
    serverFunction.invoke.mockResolvedValueOnce(outcome);
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "mara@example.co.nz" },
    });
    fireEvent.click(screen.getByLabelText(/Email me this report/i));
    fireEvent.click(screen.getByRole("button", { name: /Show my full report/i }));
    await screen.findByRole("status");
  }

  it("shows a saved result straight away, with no email step first", async () => {
    render(<Index />);
    await startAssessment();
    expect(
      screen.getByRole("heading", { name: /This earlier assessment needs a refresh/i }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
    expect(serverFunction.invoke).toHaveBeenCalledTimes(1);
  });

  it("shows the top of the report and keeps the rest behind the email gate", async () => {
    serverFunction.invoke.mockResolvedValueOnce(savedGeoResult);
    render(<Index />);
    await startAssessment();

    expect(screen.getByText(/A practical first look at Example Gardens/i)).toBeInTheDocument();
    expect(screen.getByTestId("icp-busy-homeowners")).toBeVisible();
    const locked = screen.getByTestId("report-locked");
    expect(locked.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: /See the rest, and get it by email/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/keep it until you ask us to delete it/i)).toBeInTheDocument();
  });

  it("asks for a valid email and the delivery tick before sending anything", async () => {
    serverFunction.invoke.mockResolvedValueOnce(savedGeoResult);
    render(<Index />);
    await startAssessment();

    fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByRole("button", { name: /Show my full report/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email address.");

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "mara@example.co.nz" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Show my full report/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Tick the box/i);
    expect(serverFunction.invoke).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("report-locked")).toBeInTheDocument();
  });

  it("sends the request, then unlocks the report and confirms the masked address", async () => {
    serverFunction.invoke.mockResolvedValueOnce(savedGeoResult);
    render(<Index />);
    await unlockReport({ kind: "sent" });

    expect(serverFunction.invoke).toHaveBeenLastCalledWith({
      data: {
        assessmentId: "geo-assessment-1",
        email: "mara@example.co.nz",
        deliveryConsent: true,
        marketingConsent: false,
      },
    });
    expect(screen.getByRole("status")).toHaveTextContent("m•••@example.co.nz");
    expect(screen.queryByTestId("report-locked")).not.toBeInTheDocument();
    expect(screen.getByTestId("icp-garden-renovators")).toBeVisible();
  });

  it("still unlocks the report when the email could not be sent, and says so", async () => {
    serverFunction.invoke.mockResolvedValueOnce(savedGeoResult);
    render(<Index />);
    await unlockReport({ kind: "send_failed" });

    expect(screen.getByRole("status")).toHaveTextContent(/couldn't send the email/i);
    expect(screen.queryByTestId("report-locked")).not.toBeInTheDocument();
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

  it("ignores a late assessment result after the visitor starts over", async () => {
    render(<Index />);
    let completeAssessment: ((result: typeof savedResult) => void) | undefined;
    serverFunction.invoke.mockImplementationOnce(
      () =>
        new Promise<typeof savedResult>((resolve) => {
          completeAssessment = resolve;
        }),
    );

    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));
    await screen.findByText("Following the public trail.");
    fireEvent.click(screen.getByRole("button", { name: /ShortList/i }));
    expect(screen.getByLabelText("Your business website")).toBeInTheDocument();

    await act(async () => completeAssessment?.(savedResult));
    expect(screen.queryByRole("heading", { name: /needs a refresh/i })).toBeNull();
  });

  it("keeps a newer assessment in progress when an earlier request finishes late", async () => {
    render(<Index />);
    let completeFirst: ((result: typeof savedResult) => void) | undefined;
    let completeSecond: ((result: typeof savedResult) => void) | undefined;
    serverFunction.invoke
      .mockImplementationOnce(
        () => new Promise<typeof savedResult>((resolve) => (completeFirst = resolve)),
      )
      .mockImplementationOnce(
        () => new Promise<typeof savedResult>((resolve) => (completeSecond = resolve)),
      );

    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));
    await screen.findByText("Following the public trail.");
    fireEvent.click(screen.getByRole("button", { name: /ShortList/i }));
    fireEvent.change(screen.getByLabelText("Your business website"), {
      target: { value: "second.example" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

    await act(async () => completeFirst?.(savedResult));
    expect(screen.getByText("second.example")).toBeInTheDocument();
    await act(async () => completeSecond?.(savedResult));
    expect(await screen.findByRole("heading", { name: /needs a refresh/i })).toBeInTheDocument();
  });

  it("shows the safe unavailable outcome when the server function rejects", async () => {
    serverFunction.invoke.mockRejectedValueOnce(new Error("network failure"));
    render(<Index />);

    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

    expect(
      await screen.findByRole("heading", {
        name: /assessment service is temporarily unavailable/i,
      }),
    ).toBeInTheDocument();
  });

  it("keeps the submitted domain when a visitor retries an unavailable assessment", async () => {
    serverFunction.invoke.mockResolvedValueOnce({ kind: "assessment_unavailable" });
    render(<Index />);

    fireEvent.change(screen.getByLabelText("Your business website"), {
      target: { value: "Mara-Gardens.CO.NZ/path" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));
    await screen.findByRole("heading", {
      name: /assessment service is temporarily unavailable/i,
    });
    fireEvent.click(screen.getByRole("button", { name: /^Try again$/i }));

    expect(screen.getByLabelText("Your business website")).toHaveValue("mara-gardens.co.nz");
  });

  it("paces nine estimated steps, explains the last one, and never fills the bar early", () => {
    vi.useFakeTimers();
    try {
      serverFunction.invoke.mockImplementationOnce(() => new Promise(() => undefined));
      const view = render(<Index />);
      fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

      const stage = (index: number) => screen.getByTestId(`assessment-stage-${index}`);
      const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
      const barWidth = () =>
        Number.parseFloat(screen.getByTestId("assessment-progress").style.width);

      expect(screen.getByText("Finding your key pages")).toBeInTheDocument();
      expect(screen.queryByText("Local context checked")).not.toBeInTheDocument();
      expect(stage(0)).toHaveAttribute("data-state", "active");
      expect(screen.getByTestId("assessment-elapsed")).toHaveTextContent(
        "0:00 elapsed · Estimated steps",
      );
      expect(screen.getByRole("status")).toHaveTextContent("It usually takes about a minute.");

      // Each step starts at its estimated second, and the bar keeps growing.
      let elapsed = 0;
      let lastWidth = barWidth();
      for (const [index, startsAt] of [3, 7, 16, 28, 38, 48, 58, 66].entries()) {
        advance((startsAt - elapsed) * 1_000);
        elapsed = startsAt;
        expect(stage(index)).toHaveAttribute("data-state", "complete");
        expect(stage(index + 1)).toHaveAttribute("data-state", "active");
        expect(barWidth()).toBeGreaterThan(lastWidth);
        lastWidth = barWidth();
      }

      const explanations = [
        "compares what AI says",
        "mentioned, described accurately and recommended",
        "where your website could say more",
        "puts your report together",
        "compares what AI says",
      ];
      for (const explanation of explanations) {
        expect(screen.getByTestId("assessment-final-update")).toHaveTextContent(explanation);
        expect(screen.getByRole("status")).toHaveTextContent(explanation);
        advance(6_000);
      }

      // 96 s: still waiting, so the last step is active and the bar is not full.
      expect(stage(8)).toHaveAttribute("data-state", "active");
      expect(screen.getByRole("status")).not.toHaveTextContent("longer than usual");
      advance(9_000); // 105 s
      expect(barWidth()).toBeLessThan(100);
      expect(barWidth()).toBeLessThanOrEqual(95);
      expect(screen.getByRole("status")).toHaveTextContent(
        "This is taking longer than usual. We are still waiting for your report.",
      );

      // A paused tab catches up from the clock.
      vi.setSystemTime(Date.now() + 60_000);
      advance(1_000);
      expect(screen.getByTestId("assessment-elapsed")).toHaveTextContent("2:46 elapsed");
      expect(barWidth()).toBeLessThanOrEqual(95);

      view.unmount();
      expect(vi.getTimerCount()).toBe(0);
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

    expect(await screen.findByRole("heading", { name: /needs a refresh/i })).toBeInTheDocument();
    expect(serverFunction.invoke).toHaveBeenCalledTimes(1);
  });

  it("renders the persisted GEO graph instead of a generic comparable-business list", async () => {
    serverFunction.invoke.mockResolvedValueOnce(savedGeoResult);
    render(<Index />);

    await unlockReport();

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
