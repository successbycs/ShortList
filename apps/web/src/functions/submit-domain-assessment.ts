import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  domain: z.string().max(512),
  turnstileToken: z.string().max(2048),
});

export type DomainAssessmentSubmissionResult =
  | { kind: "verification_failed"; reasonCode: string }
  | { kind: "assessment_unavailable" }
  | { kind: "invalid_input"; reasonCode: string }
  | {
      kind: "admission_rejected";
      reasonCode: "duplicate_active" | "concurrency_limited" | "rate_limited";
    }
  | {
      kind: "cached" | "completed";
      result: import("@/server/ai-evidence-repository").StoredAiEvidence;
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
      { getRequestHeader, getRequestUrl },
      { getShortListWorkerRuntime },
      { verifyTurnstileResponse },
      { runLiveAssessment },
      { createIpDayHmac },
    ] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("@/server/worker-runtime"),
      import("@/server/turnstile"),
      import("@/server/live-assessment"),
      import("@/server/ip-privacy"),
    ]);
    const runtime = getShortListWorkerRuntime();
    const verification = await verifyTurnstileResponse(data.turnstileToken, {
      secret: runtime.TURNSTILE_SECRET,
      expectedHostname: getRequestUrl({ xForwardedHost: true }).hostname,
    });
    if (verification.kind !== "verified") {
      return { kind: "verification_failed" as const, reasonCode: verification.kind };
    }
    if (runtime.SHORTLIST_DB === undefined) return { kind: "assessment_unavailable" as const };
    try {
      const ipDayHmac = await createIpDayHmac(
        getRequestHeader("CF-Connecting-IP") ?? "",
        runtime.ASSESSMENT_IP_HASH_SECRET,
      );
      if (!runtime.OPENAI_API_KEY || !ipDayHmac) return { kind: "assessment_unavailable" as const };
      return (await runLiveAssessment(data.domain, {
        database: runtime.SHORTLIST_DB,
        apiKey: runtime.OPENAI_API_KEY,
        ipDayHmac,
      })) as DomainAssessmentSubmissionResult;
    } catch {
      return { kind: "assessment_unavailable" as const };
    }
  });
