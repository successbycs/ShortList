import { z } from "zod";

export const geoEvidenceSourceSchema = z.object({
  sourceId: z.string().min(1),
  sourceUrl: z.string().url(),
  observedAtUtc: z.string().datetime(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  visibleText: z.string().min(1),
  jsonLd: z.array(z.unknown()),
});

export const evidenceLinkedValueSchema = z.object({
  value: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)),
  confidence: z.enum(["high", "medium", "low"]),
});

export const businessProfileSchema = z.object({
  businessName: evidenceLinkedValueSchema.nullable(),
  websiteDomain: z.string().min(1),
  services: z.array(evidenceLinkedValueSchema),
  serviceAreas: z.array(evidenceLinkedValueSchema),
  audienceSignals: z.array(evidenceLinkedValueSchema),
  valuePropositions: z.array(evidenceLinkedValueSchema),
  proofPoints: z.array(evidenceLinkedValueSchema),
  differentiators: z.array(evidenceLinkedValueSchema),
  contentGaps: z.array(z.string()),
  limitations: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
});

export const icpHypothesisSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  audienceDescription: z.string().min(1),
  buyerSituation: z.string().min(1),
  needs: z.array(z.string().min(1)),
  decisionCriteria: z.array(z.string().min(1)),
  evidenceIds: z.array(z.string().min(1)).min(1),
  confidence: z.enum(["high", "medium", "low"]),
  uncertainty: z.string().min(1),
});

export const icpStageOutputSchema = z.discriminatedUnion("outcome", [
  z.object({ outcome: z.literal("complete"), icps: z.array(icpHypothesisSchema).length(3) }),
  z.object({
    outcome: z.literal("insufficient_evidence"),
    reason: z.string().min(1),
    evidenceIds: z.array(z.string().min(1)),
  }),
]);

export const buyerQuestionSchema = z.object({
  id: z.string().min(1),
  icpId: z.string().min(1),
  questionText: z.string().min(1),
  buyerIntent: z.string().min(1),
  testedClaim: z.string().min(1),
});

export const buyerQuestionStageOutputSchema = z.object({
  questions: z.array(buyerQuestionSchema).length(9),
});

export const modelQuestionFindingSchema = z.object({
  questionId: z.string().min(1),
  answerSummary: z.string().min(1),
  submittedBusinessMention: z.enum(["mentioned", "absent", "uncertain", "contradicted"]),
  descriptionAccuracy: z.enum(["accurate", "partial", "inaccurate", "not_applicable"]),
  recommendationFit: z.enum(["appropriate", "not_appropriate", "uncertain", "not_mentioned"]),
  sources: z.array(z.object({ title: z.string().min(1), url: z.string().url() })),
  websiteContentGaps: z.array(z.string()),
  limitations: z.array(z.string()),
  confidence: z.enum(["high", "medium", "low"]),
});

export const evaluationStageOutputSchema = z.object({
  findings: z.array(modelQuestionFindingSchema).length(9),
});

export type GeoEvidenceSource = z.infer<typeof geoEvidenceSourceSchema>;
export type BusinessProfile = z.infer<typeof businessProfileSchema>;
export type IcpStageOutput = z.infer<typeof icpStageOutputSchema>;
export type IcpHypothesis = z.infer<typeof icpHypothesisSchema>;
export type BuyerQuestion = z.infer<typeof buyerQuestionSchema>;
export type EvaluationStageOutput = z.infer<typeof evaluationStageOutputSchema>;
