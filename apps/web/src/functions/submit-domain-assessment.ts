import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  domain: z.string().max(512),
});

export type DomainAssessmentSubmissionResult =
  | {
      kind: "assessment_unavailable";
      supportRef: string;
      diagnostic: {
        phase: import("@/server/assessment-diagnostics").AssessmentDiagnosticPhase;
        category:
          "missing_runtime_binding" | "missing_runtime_configuration" | "unexpected_failure";
      };
    }
  | { kind: "invalid_input"; reasonCode: string }
  | {
      kind: "admission_rejected";
      reasonCode: "duplicate_active" | "concurrency_limited" | "rate_limited";
    }
  | {
      kind: "cached" | "completed";
      result: import("@/server/live-assessment").StoredAssessmentResult;
    }
  | {
      kind: "limited";
      assessment: { assessmentId: string; normalisedDomain: string; triggeredAtUtc: string };
      reasonCode: string;
    };

/**
 * Browser-callable boundary. The handler alone imports Worker bindings and
 * server modules, so neither secrets nor D1 reach browser code.
 */
export const submitDomainAssessment = createServerFn({ method: "POST" })
  .validator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const [
      { getRequestHeader, getRequestIP },
      { getShortListWorkerRuntime },
      { runLiveAssessment },
      { createIpDayHmac },
      { runAssessmentSubmission },
    ] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("@/server/worker-runtime"),
      import("@/server/live-assessment"),
      import("@/server/ip-privacy"),
      import("@/server/assessment-submission"),
    ]);
    const runtime = getShortListWorkerRuntime();
    return (await runAssessmentSubmission(data.domain, {
      runtime,
      // Cloudflare overwrites this header at the deployed Worker boundary.
      // TanStack/H3's forwarded-address helper is only a local development
      // fallback because a caller can otherwise supply X-Forwarded-For.
      ipAddress:
        getRequestHeader("CF-Connecting-IP") ?? getRequestIP({ xForwardedFor: true }) ?? "",
      createIpDayHmac,
      runLiveAssessment,
    })) as DomainAssessmentSubmissionResult;
  });
