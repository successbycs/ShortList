import { admitPublicDomain } from "@/lib/domain-admission";

import {
  completeAssessmentRun,
  createAssessmentAdmission,
  recordWebsiteEvidence,
  type AssessmentAdmissionRecord,
  type D1DatabaseLike,
} from "./assessment-repository";
import { recordWebsiteSource } from "./geo-assessment-repository";
import {
  fetchPublicHtml,
  MVP1_SAFE_FETCH_POLICY,
  type FetchImplementation,
  type SafeFetchPolicy,
} from "./safe-website-fetch";
import { extractBoundedWebsiteEvidence } from "./website-evidence";
import type { JsonValue } from "./website-evidence";
import type { AssessmentDiagnosticPhase } from "./assessment-diagnostics";

export type WebsiteAssessmentResult =
  | { kind: "invalid_input"; reasonCode: string }
  | {
      kind: "preview_ready";
      assessment: AssessmentAdmissionRecord;
      evidence: {
        evidenceId: string;
        websiteSourceId: string;
        excerpt: string;
        sourceUrl: string;
        title: string | null;
        description: string | null;
        jsonLd: readonly JsonValue[];
      };
    }
  | { kind: "limited"; assessment: AssessmentAdmissionRecord; reasonCode: string };

export type WebsiteAssessmentDependencies = {
  database: D1DatabaseLike;
  fetchImplementation: FetchImplementation;
  now?: () => Date;
  createId?: () => string;
  safeFetchPolicy?: SafeFetchPolicy;
  contractVersion?: string;
  onPhase?: (phase: AssessmentDiagnosticPhase) => void;
};

/**
 * Runs the non-AI first slice of a ShortList assessment. The caller injects
 * its D1 binding and transport so this boundary can be proven without a live
 * website, provider request, or credential. A future route must still apply
 * domain validation, rate and concurrency controls before invoking it.
 */
export async function runWebsiteAssessment(
  originalSubmission: string,
  dependencies: WebsiteAssessmentDependencies,
): Promise<WebsiteAssessmentResult> {
  const admission = admitPublicDomain(originalSubmission);
  if (admission.kind === "rejected") {
    return { kind: "invalid_input", reasonCode: admission.reasonCode };
  }

  const now = dependencies.now ?? (() => new Date());
  // Cloudflare's Web Crypto methods require the `crypto` receiver. Do not pass
  // `crypto.randomUUID` directly as a callback.
  const createId = dependencies.createId ?? (() => crypto.randomUUID());
  const safeFetchPolicy = dependencies.safeFetchPolicy ?? MVP1_SAFE_FETCH_POLICY;
  const contractVersion = dependencies.contractVersion ?? "mvp1-v1";
  const triggeredAtUtc = now().toISOString();
  const inputUrl = `https://${admission.normalisedDomain}/`;
  dependencies.onPhase?.("d1_write");
  const assessment = await createAssessmentAdmission(dependencies.database, {
    normalisedDomain: admission.normalisedDomain,
    originalSubmission,
    inputUrl,
    triggeredAtUtc,
    contractVersion,
    createId,
  });

  dependencies.onPhase?.("website_fetch");
  const fetched = await fetchPublicHtml(
    inputUrl,
    safeFetchPolicy,
    dependencies.fetchImplementation,
  );
  const observedAtUtc = now().toISOString();
  const evidenceId = createId();

  if (fetched.kind === "limited") {
    dependencies.onPhase?.("d1_write");
    await recordWebsiteEvidence(dependencies.database, {
      evidenceId,
      assessmentId: assessment.assessmentId,
      sourceUrl: inputUrl,
      observedAtUtc,
      contentType: null,
      boundedExcerpt: null,
      fetchOutcome: fetched.reasonCode,
      extractionOutcome: "not_run",
      contractVersion,
    });
    dependencies.onPhase?.("result_persist");
    await completeAssessmentRun(dependencies.database, {
      assessmentId: assessment.assessmentId,
      status: "limited",
      reasonCode: fetched.reasonCode,
    });
    return { kind: "limited", assessment, reasonCode: fetched.reasonCode };
  }

  const extracted = extractBoundedWebsiteEvidence(
    {
      sourceUrl: fetched.finalUrl,
      observedAtUtc,
      status: 200,
      contentType: fetched.contentType,
      html: fetched.html,
    },
    {
      allowedContentTypes: safeFetchPolicy.allowedContentTypes,
      maxHtmlBytes: safeFetchPolicy.maxHtmlBytesPerPage,
      maxExcerptCharacters: 1_500,
      maxJsonLdBlocks: 10,
      maxJsonLdCharacters: 20_000,
    },
  );

  if (extracted.kind === "limited") {
    dependencies.onPhase?.("d1_write");
    await recordWebsiteEvidence(dependencies.database, {
      evidenceId,
      assessmentId: assessment.assessmentId,
      sourceUrl: fetched.finalUrl,
      observedAtUtc,
      contentType: fetched.contentType,
      boundedExcerpt: null,
      fetchOutcome: "captured",
      extractionOutcome: extracted.reasonCode,
      contractVersion,
    });
    dependencies.onPhase?.("result_persist");
    await completeAssessmentRun(dependencies.database, {
      assessmentId: assessment.assessmentId,
      status: "limited",
      reasonCode: extracted.reasonCode,
    });
    return { kind: "limited", assessment, reasonCode: extracted.reasonCode };
  }

  dependencies.onPhase?.("d1_write");
  await recordWebsiteEvidence(dependencies.database, {
    evidenceId,
    assessmentId: assessment.assessmentId,
    sourceUrl: extracted.sourceUrl,
    observedAtUtc,
    contentType: extracted.contentType,
    boundedExcerpt: extracted.excerpt,
    fetchOutcome: "captured",
    extractionOutcome: "captured",
    contractVersion,
  });
  const websiteSourceId = createId();
  await recordWebsiteSource(dependencies.database, {
    websiteSourceId,
    assessmentId: assessment.assessmentId,
    websiteEvidenceId: evidenceId,
    sourceUrl: extracted.sourceUrl,
    observedAtUtc,
    contentType: extracted.contentType,
    title: extracted.title ?? null,
    description: extracted.description ?? null,
    visibleText: extracted.excerpt,
    jsonLd: extracted.jsonLd,
    extractionVersion: "website-evidence-v2",
  });
  dependencies.onPhase?.("result_persist");
  await completeAssessmentRun(dependencies.database, {
    assessmentId: assessment.assessmentId,
    status: "preview_ready",
    reasonCode: null,
  });

  return {
    kind: "preview_ready",
    assessment,
    evidence: {
      evidenceId,
      websiteSourceId,
      excerpt: extracted.excerpt,
      sourceUrl: extracted.sourceUrl,
      title: extracted.title ?? null,
      description: extracted.description ?? null,
      jsonLd: extracted.jsonLd,
    },
  };
}
