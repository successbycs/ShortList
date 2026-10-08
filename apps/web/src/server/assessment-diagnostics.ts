/**
 * A deliberately small, server-only event for diagnosing unavailable
 * assessments. Its type excludes request and provider data by design.
 */
export type AssessmentDiagnosticPhase =
  | "runtime"
  | "d1_cache"
  | "admission"
  | "website_fetch"
  | "d1_write"
  | "ai_call"
  | "result_persist";

export type AssessmentDiagnosticCategory =
  "missing_runtime_binding" | "missing_runtime_configuration" | "unexpected_failure";

export type AssessmentDiagnosticEvent = {
  event: "shortlist.assessment_failure";
  supportRef: string;
  timestampUtc: string;
  phase: AssessmentDiagnosticPhase;
  outcome: "unavailable";
  category: AssessmentDiagnosticCategory;
  elapsedMs: number;
};

export type AssessmentDiagnosticLogger = (event: AssessmentDiagnosticEvent) => void;

export function createAssessmentSupportRef(
  createUuid: () => string = () => crypto.randomUUID(),
): string {
  return `sl-${createUuid()}`;
}

/** Emits only a fixed, searchable event shape. Never pass an Error or request value here. */
export function emitAssessmentDiagnostic(event: AssessmentDiagnosticEvent): void {
  console.error(JSON.stringify(event));
}

export function createUnavailableDiagnostic(
  input: Omit<AssessmentDiagnosticEvent, "event" | "outcome" | "elapsedMs"> & {
    startedAtMs: number;
    nowMs: number;
  },
): AssessmentDiagnosticEvent {
  return {
    event: "shortlist.assessment_failure",
    supportRef: input.supportRef,
    timestampUtc: input.timestampUtc,
    phase: input.phase,
    outcome: "unavailable",
    category: input.category,
    elapsedMs: Math.max(0, Math.round(input.nowMs - input.startedAtMs)),
  };
}
