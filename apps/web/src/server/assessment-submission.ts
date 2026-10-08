import type { D1DatabaseLike } from "./assessment-repository";
import {
  createAssessmentSupportRef,
  createUnavailableDiagnostic,
  emitAssessmentDiagnostic,
  type AssessmentDiagnosticLogger,
  type AssessmentDiagnosticPhase,
} from "./assessment-diagnostics";
import type { LiveAssessmentResult } from "./live-assessment";

export type AssessmentUnavailableResult = {
  kind: "assessment_unavailable";
  supportRef: string;
  /**
   * Fixed diagnostic fields only. The public page intentionally displays the
   * support reference, not this implementation detail.
   */
  diagnostic: {
    phase: AssessmentDiagnosticPhase;
    category: "missing_runtime_binding" | "missing_runtime_configuration" | "unexpected_failure";
  };
};

type Runtime = {
  SHORTLIST_DB?: D1DatabaseLike;
  OPENAI_API_KEY?: string;
  ASSESSMENT_IP_HASH_SECRET?: string;
};

type RunLiveAssessment = (
  domain: string,
  dependencies: {
    database: D1DatabaseLike;
    apiKey: string;
    ipDayHmac: string;
    onPhase: (phase: AssessmentDiagnosticPhase) => void;
  },
) => Promise<LiveAssessmentResult>;

export type AssessmentSubmissionDependencies = {
  runtime: Runtime;
  ipAddress: string;
  createIpDayHmac: (ipAddress: string, secret: string | undefined) => Promise<string | undefined>;
  runLiveAssessment: RunLiveAssessment;
  emitDiagnostic?: AssessmentDiagnosticLogger;
  createSupportRef?: () => string;
  now?: () => Date;
};

/**
 * Keeps the browser boundary safe while emitting one correlated, redacted
 * diagnostic record whenever an internal unavailable result is produced.
 */
export async function runAssessmentSubmission(
  domain: string,
  dependencies: AssessmentSubmissionDependencies,
): Promise<LiveAssessmentResult | AssessmentUnavailableResult> {
  const now = dependencies.now ?? (() => new Date());
  const startedAtMs = now().getTime();
  const supportRef = (dependencies.createSupportRef ?? createAssessmentSupportRef)();
  const emit = dependencies.emitDiagnostic ?? emitAssessmentDiagnostic;
  let phase: AssessmentDiagnosticPhase = "runtime";

  const unavailable = (
    category: "missing_runtime_binding" | "missing_runtime_configuration" | "unexpected_failure",
  ): AssessmentUnavailableResult => {
    const at = now();
    emit(
      createUnavailableDiagnostic({
        supportRef,
        timestampUtc: at.toISOString(),
        phase,
        category,
        startedAtMs,
        nowMs: at.getTime(),
      }),
    );
    return { kind: "assessment_unavailable", supportRef, diagnostic: { phase, category } };
  };

  if (dependencies.runtime.SHORTLIST_DB === undefined)
    return unavailable("missing_runtime_binding");

  try {
    const ipDayHmac = await dependencies.createIpDayHmac(
      dependencies.ipAddress,
      dependencies.runtime.ASSESSMENT_IP_HASH_SECRET,
    );
    if (!dependencies.runtime.OPENAI_API_KEY || !ipDayHmac) {
      return unavailable("missing_runtime_configuration");
    }
    return await dependencies.runLiveAssessment(domain, {
      database: dependencies.runtime.SHORTLIST_DB,
      apiKey: dependencies.runtime.OPENAI_API_KEY,
      ipDayHmac,
      onPhase(nextPhase) {
        phase = nextPhase;
      },
    });
  } catch {
    return unavailable("unexpected_failure");
  }
}
