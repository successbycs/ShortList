import { admitPublicDomain } from "@/lib/domain-admission";

import { completeAssessmentRun, type D1DatabaseLike } from "./assessment-repository";
import { executeAndPersistGeoAssessment } from "./geo-assessment-execution";
import {
  findStoredGeoAssessment,
  loadApprovedGeoRuntimeConfiguration,
  type StoredGeoAssessment,
} from "./geo-assessment-repository";
import { createOpenAiGeoResponsesProvider } from "./geo-openai-responses";
import { runWebsiteAssessment } from "./website-assessment";
import { admitAssessmentStart } from "./assessment-admission";
import type { AssessmentDiagnosticPhase } from "./assessment-diagnostics";
import {
  findLegacyComparableBusinessAssessment,
  type LegacyComparableBusinessAssessment,
} from "./legacy-ai-search";

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_OUTPUT_TOKENS = 600;
const MAX_INPUT_TOKENS = 16_000;
const GEO_RUN_TOKEN_LIMITS = {
  // Five bounded stages: profile, ICP, questions and two evaluations.
  maxInputTokens: MAX_INPUT_TOKENS * 5,
  maxOutputTokens: MAX_OUTPUT_TOKENS * 5,
} as const;

export type StoredAssessmentResult = LegacyComparableBusinessAssessment | StoredGeoAssessment;

export type LiveAssessmentResult =
  | { kind: "cached"; result: StoredAssessmentResult }
  | { kind: "completed"; result: StoredAssessmentResult }
  | { kind: "invalid_input"; reasonCode: string }
  | {
      kind: "admission_rejected";
      reasonCode: "duplicate_active" | "concurrency_limited" | "rate_limited";
    }
  | {
      kind: "limited";
      assessment: { assessmentId: string; normalisedDomain: string; triggeredAtUtc: string };
      reasonCode: string;
    };

export type LiveAssessmentDependencies = {
  database: D1DatabaseLike;
  apiKey: string;
  ipDayHmac: string;
  fetchImplementation?: typeof fetch;
  now?: () => Date;
  createId?: () => string;
  onPhase?: (phase: AssessmentDiagnosticPhase) => void;
};

/**
 * Creates a single saved assessment for a domain. A complete stored result is
 * returned before website fetching or OpenAI calls, so ordinary revisits do not
 * create further provider requests.
 */
export async function runLiveAssessment(
  originalSubmission: string,
  dependencies: LiveAssessmentDependencies,
): Promise<LiveAssessmentResult> {
  const admission = admitPublicDomain(originalSubmission);
  if (admission.kind === "rejected") {
    return { kind: "invalid_input", reasonCode: admission.reasonCode };
  }

  dependencies.onPhase?.("d1_cache");
  const existing =
    (await findStoredGeoAssessment(dependencies.database, admission.normalisedDomain)) ??
    (await findLegacyComparableBusinessAssessment(
      dependencies.database,
      admission.normalisedDomain,
    ));
  if (existing) return { kind: "cached", result: existing };

  dependencies.onPhase?.("admission");
  const start = await admitAssessmentStart({
    database: dependencies.database,
    normalisedDomain: admission.normalisedDomain,
    ipDayHmac: dependencies.ipDayHmac,
    ...(dependencies.now ? { now: dependencies.now } : {}),
  });
  if (start.kind === "rejected")
    return { kind: "admission_rejected", reasonCode: start.reasonCode };

  let geoReadyAssessmentId: string | undefined;
  try {
    const now = dependencies.now ?? (() => new Date());
    // Cloudflare's Web Crypto methods require the `crypto` receiver. Do not
    // detach `crypto.randomUUID` from it.
    const createId = dependencies.createId ?? (() => crypto.randomUUID());
    dependencies.onPhase?.("website_fetch");
    const website = await runWebsiteAssessment(originalSubmission, {
      database: dependencies.database,
      fetchImplementation: dependencies.fetchImplementation ?? fetch,
      now,
      createId,
      ...(dependencies.onPhase ? { onPhase: dependencies.onPhase } : {}),
    });
    if (website.kind !== "preview_ready") return website;
    geoReadyAssessmentId = website.assessment.assessmentId;

    const configuration = await loadApprovedGeoRuntimeConfiguration(dependencies.database, {
      packageKey: "geo-assessment-v1",
      packageVersionLabel: "1.0.0",
      modelProfileKey: "openai-gpt-6-luna",
      modelProfileVersionLabel: "1.0.0",
      marketKey: "global",
      marketVersionLabel: "1.0.0",
    });
    const provider = createOpenAiGeoResponsesProvider({
      apiKey: dependencies.apiKey,
      modelId: configuration.modelId,
      timeoutMs: REQUEST_TIMEOUT_MS,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      storeResponses: false,
      ...(dependencies.fetchImplementation
        ? { fetchImplementation: dependencies.fetchImplementation }
        : {}),
    });
    dependencies.onPhase?.("ai_call");
    const geoAssessment = await executeAndPersistGeoAssessment(
      dependencies.database,
      {
        assessment: {
          assessmentId: website.assessment.assessmentId,
          executedAtUtc: website.assessment.triggeredAtUtc,
          normalisedDomain: website.assessment.normalisedDomain,
          marketContext: configuration.marketContext,
          websiteSources: [
            {
              sourceId: website.evidence.websiteSourceId,
              sourceUrl: website.evidence.sourceUrl,
              observedAtUtc: website.assessment.triggeredAtUtc,
              title: website.evidence.title,
              description: website.evidence.description,
              visibleText: website.evidence.excerpt,
              jsonLd: [...website.evidence.jsonLd],
            },
          ],
        },
        configuration,
        createId,
        evidencePolicyVersion: "safe-fetch-v1",
        reportTemplateVersion: "geo-web-v1",
        tokenLimits: GEO_RUN_TOKEN_LIMITS,
      },
      provider,
    );
    dependencies.onPhase?.("d1_write");
    if (geoAssessment.outcome.kind === "insufficient_evidence") {
      dependencies.onPhase?.("result_persist");
      await completeAssessmentRun(dependencies.database, {
        assessmentId: website.assessment.assessmentId,
        status: "limited",
        reasonCode: "evidence_insufficient",
      });
      return {
        kind: "limited",
        assessment: website.assessment,
        reasonCode: "evidence_insufficient",
      };
    }
    const result = await findStoredGeoAssessment(
      dependencies.database,
      website.assessment.normalisedDomain,
    );
    if (result === undefined)
      throw new Error("The completed GEO assessment could not be reconstructed.");
    return {
      kind: "completed",
      result,
    };
  } catch (error) {
    if (geoReadyAssessmentId !== undefined) {
      try {
        await completeAssessmentRun(dependencies.database, {
          assessmentId: geoReadyAssessmentId,
          status: "failed",
          reasonCode: "geo_processing_failed",
        });
      } catch {
        // Preserve the original failure for the submission diagnostics boundary.
      }
    }
    throw error;
  } finally {
    await start.release();
  }
}
