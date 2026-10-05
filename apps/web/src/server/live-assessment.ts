import { admitPublicDomain } from "@/lib/domain-admission";

import {
  collectAiSearchEvidence,
  createOpenAiResponsesProvider,
  type AiSearchEvidence,
  type AiSearchRunRequest,
} from "./ai-search";
import {
  findStoredAssessment,
  recordAiEvidence,
  type StoredAiEvidence,
} from "./ai-evidence-repository";
import { completeAssessmentRun, type D1DatabaseLike } from "./assessment-repository";
import { runWebsiteAssessment } from "./website-assessment";

const MODEL_ID = "gpt-6-luna";
const REQUEST_TIMEOUT_MS = 45_000;
const MAX_OUTPUT_TOKENS = 600;
const MAX_ESTIMATED_SPEND_USD_PER_VIEW = 0.015;

export type LiveAssessmentResult =
  | { kind: "cached"; result: StoredAiEvidence }
  | { kind: "completed"; result: StoredAiEvidence }
  | { kind: "invalid_input"; reasonCode: string }
  | {
      kind: "limited";
      assessment: { assessmentId: string; normalisedDomain: string; triggeredAtUtc: string };
      reasonCode: string;
    };

type LiveAssessmentDependencies = {
  database: D1DatabaseLike;
  apiKey: string;
  fetchImplementation?: typeof fetch;
  now?: () => Date;
  createId?: () => string;
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

  const existing = await findStoredAssessment(dependencies.database, admission.normalisedDomain);
  if (existing) return { kind: "cached", result: existing };

  const now = dependencies.now ?? (() => new Date());
  const createId = dependencies.createId ?? crypto.randomUUID;
  const website = await runWebsiteAssessment(originalSubmission, {
    database: dependencies.database,
    fetchImplementation: dependencies.fetchImplementation ?? fetch,
    now,
    createId,
  });
  if (website.kind !== "preview_ready") return website;

  const requests = createAiRequests(website.assessment, website.evidence.excerpt, now());
  const provider = createOpenAiResponsesProvider({
    apiKey: dependencies.apiKey,
    modelId: MODEL_ID,
    timeoutMs: REQUEST_TIMEOUT_MS,
    storeResponses: false,
    webSearch: { toolChoice: "required", searchContextSize: "low", externalWebAccess: true },
    currentWebInstructions:
      "Return only the required JSON. Give up to three businesses matching the requested service in the observed order. Do not call the result an objective ranking.",
    modelKnowledgeInstructions:
      "Return only the required JSON. Give up to three businesses from learned knowledge only. Do not imply that the result is current or verified.",
    ...(dependencies.fetchImplementation
      ? { fetchImplementation: dependencies.fetchImplementation }
      : {}),
  });
  const [currentWeb, modelKnowledge] = await Promise.all([
    collectAiSearchEvidence(requests[0], provider),
    collectAiSearchEvidence(requests[1], provider),
  ]);
  await Promise.all([
    recordAiEvidence(dependencies.database, createId(), currentWeb),
    recordAiEvidence(dependencies.database, createId(), modelKnowledge),
  ]);

  if (currentWeb.outcome !== "completed" || modelKnowledge.outcome !== "completed") {
    const reasonCode =
      currentWeb.reasonCode !== "completed" ? currentWeb.reasonCode : modelKnowledge.reasonCode;
    await completeAssessmentRun(dependencies.database, {
      assessmentId: website.assessment.assessmentId,
      status: "failed",
      reasonCode,
    });
    return { kind: "limited", assessment: website.assessment, reasonCode };
  }

  return {
    kind: "completed",
    result: {
      assessmentId: website.assessment.assessmentId,
      normalisedDomain: website.assessment.normalisedDomain,
      triggeredAtUtc: website.assessment.triggeredAtUtc,
      excerpt: website.evidence.excerpt,
      currentWeb,
      modelKnowledge,
    },
  };
}

export function createAiRequests(
  assessment: { assessmentId: string; normalisedDomain: string },
  websiteExcerpt: string,
  executedAt: Date,
): [AiSearchRunRequest, AiSearchRunRequest] {
  const executedAtUtc = executedAt.toISOString();
  const description = normaliseExcerpt(websiteExcerpt);
  const serviceDescription = `the services described by ${assessment.normalisedDomain}: ${description}`;
  const base = {
    assessmentId: assessment.assessmentId,
    normalisedDomain: assessment.normalisedDomain,
    businessType: serviceDescription,
    executedAtUtc,
    limits: {
      maxInputTokens: 12_000,
      maxOutputTokens: 2_000,
      maxEstimatedSpendUsd: MAX_ESTIMATED_SPEND_USD_PER_VIEW,
    },
    requestedInputTokens: Math.max(1, Math.ceil(description.length / 4) + 100),
    maximumOutputTokens: MAX_OUTPUT_TOKENS,
    estimatedSpendUsd: MAX_ESTIMATED_SPEND_USD_PER_VIEW,
  } as const;
  return [
    {
      ...base,
      mode: "web_grounded",
      question: `For ${serviceDescription}, list up to three Auckland businesses offering the same kind of service today. Return their names and a concise description of the service each appears to offer.`,
      configuration: {
        modelId: MODEL_ID,
        searchConfigurationRef: "mvp1-web-low-auckland-v1",
        locationContext: {
          kind: "web_search_location",
          city: "Auckland",
          region: "Auckland",
          country: "NZ",
          timezone: "Pacific/Auckland",
        },
      },
    },
    {
      ...base,
      mode: "model_knowledge",
      question: `Without a live web search, for ${serviceDescription}, list up to three Auckland businesses that may offer the same kind of service. Return their names and a concise description, or return fewer when uncertain.`,
      configuration: {
        modelId: MODEL_ID,
        searchConfigurationRef: "mvp1-model-knowledge-no-web-v1",
        locationContext: { kind: "no_web_search" },
      },
    },
  ];
}

function normaliseExcerpt(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 1_500);
}
