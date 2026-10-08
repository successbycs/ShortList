import { findStoredAssessment, type StoredAiEvidence } from "./ai-evidence-repository";
import type { D1DatabaseLike } from "./assessment-repository";

/**
 * Read-only compatibility shape for comparable-business assessments created
 * before the current GEO report contract. New assessments must not create or
 * render this shape as their result.
 */
export type LegacyComparableBusinessAssessment = StoredAiEvidence;

/**
 * Finds a completed historic comparable-business record for a cached domain.
 * This preserves an honest refresh state for old records while keeping the
 * current GEO assessment path independent of the retired report model.
 */
export async function findLegacyComparableBusinessAssessment(
  database: D1DatabaseLike,
  normalisedDomain: string,
): Promise<LegacyComparableBusinessAssessment | undefined> {
  return findStoredAssessment(database, normalisedDomain);
}
