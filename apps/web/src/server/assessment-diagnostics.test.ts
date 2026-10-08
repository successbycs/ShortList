import { describe, expect, it, vi } from "vitest";

import {
  createAssessmentSupportRef,
  createUnavailableDiagnostic,
  type AssessmentDiagnosticEvent,
} from "./assessment-diagnostics";
import { runAssessmentSubmission } from "./assessment-submission";

const fixedNow = () => new Date("2026-10-06T05:00:01.000Z");

function dependencies(overrides: Partial<Parameters<typeof runAssessmentSubmission>[1]> = {}) {
  return {
    runtime: {
      SHORTLIST_DB: {} as D1Database,
      OPENAI_API_KEY: "test-key",
      ASSESSMENT_IP_HASH_SECRET: "hash-key",
    },
    ipAddress: "203.0.113.19",
    createIpDayHmac: vi.fn().mockResolvedValue("daily-hmac"),
    runLiveAssessment: vi.fn().mockRejectedValue(new Error("provider response: private body")),
    createSupportRef: () => "sl-test-reference",
    now: fixedNow,
    ...overrides,
  };
}

describe("assessment diagnostics", () => {
  it("creates an opaque support reference", () => {
    expect(createAssessmentSupportRef(() => "123e4567-e89b-12d3-a456-426614174000")).toBe(
      "sl-123e4567-e89b-12d3-a456-426614174000",
    );
  });

  it("creates a support reference through the Worker crypto receiver", () => {
    expect(createAssessmentSupportRef()).toMatch(/^sl-[0-9a-f-]{36}$/);
  });

  it("has a fixed redacted event shape", () => {
    expect(
      createUnavailableDiagnostic({
        supportRef: "sl-test-reference",
        timestampUtc: "2026-10-06T05:00:01.000Z",
        phase: "ai_call",
        category: "unexpected_failure",
        startedAtMs: 100,
        nowMs: 133,
      }),
    ).toEqual({
      event: "shortlist.assessment_failure",
      supportRef: "sl-test-reference",
      timestampUtc: "2026-10-06T05:00:01.000Z",
      phase: "ai_call",
      outcome: "unavailable",
      category: "unexpected_failure",
      elapsedMs: 33,
    });
  });

  it("emits exactly one redacted event for a caught boundary failure", async () => {
    const events: AssessmentDiagnosticEvent[] = [];
    const runLiveAssessment = vi.fn().mockImplementation(async (_domain, input) => {
      input.onPhase("ai_call");
      throw new Error("secret provider body for private.example.nz");
    });
    const result = await runAssessmentSubmission(
      "private.example.nz",
      dependencies({ runLiveAssessment, emitDiagnostic: (event) => events.push(event) }),
    );

    expect(result).toEqual({
      kind: "assessment_unavailable",
      supportRef: "sl-test-reference",
      diagnostic: { phase: "ai_call", category: "unexpected_failure" },
    });
    expect(events).toEqual([
      expect.objectContaining({
        event: "shortlist.assessment_failure",
        supportRef: "sl-test-reference",
        phase: "ai_call",
        category: "unexpected_failure",
      }),
    ]);
    expect(JSON.stringify(events)).not.toContain("private.example.nz");
    expect(JSON.stringify(events)).not.toContain("secret provider body");
    expect(events).toHaveLength(1);
  });

  it("emits one runtime event when a required binding is absent and never starts work", async () => {
    const events: AssessmentDiagnosticEvent[] = [];
    const runLiveAssessment = vi.fn();
    const result = await runAssessmentSubmission(
      "example.co.nz",
      dependencies({
        runtime: { OPENAI_API_KEY: "test-key" },
        runLiveAssessment,
        emitDiagnostic: (event) => events.push(event),
      }),
    );

    expect(result).toEqual({
      kind: "assessment_unavailable",
      supportRef: "sl-test-reference",
      diagnostic: { phase: "runtime", category: "missing_runtime_binding" },
    });
    expect(events).toEqual([
      expect.objectContaining({ phase: "runtime", category: "missing_runtime_binding" }),
    ]);
    expect(runLiveAssessment).not.toHaveBeenCalled();
  });
});
