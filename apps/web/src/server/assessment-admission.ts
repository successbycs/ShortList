import type { D1DatabaseLike } from "./assessment-repository";

const MAX_STARTS_PER_AUCKLAND_DAY = 5;
const ADMISSION_LEASE_MS = 30_000;

export type AssessmentAdmissionRejection =
  "duplicate_active" | "concurrency_limited" | "rate_limited";

export type AssessmentAdmission =
  | { kind: "rejected"; reasonCode: AssessmentAdmissionRejection }
  | { kind: "admitted"; release: () => Promise<void> };

export type AssessmentAdmissionDependencies = {
  database: D1DatabaseLike;
  normalisedDomain: string;
  ipDayHmac: string;
  now?: () => Date;
};

/**
 * Reserves the approved V1 capacity before an assessment row, website fetch or
 * AI request exists. The caller must invoke `release` in a finally block.
 */
export async function admitAssessmentStart(
  dependencies: AssessmentAdmissionDependencies,
): Promise<AssessmentAdmission> {
  const now = (dependencies.now ?? (() => new Date()))();
  const nowUtc = now.toISOString();
  const expiryUtc = new Date(now.getTime() - ADMISSION_LEASE_MS).toISOString();
  const aucklandDay = getAucklandDay(now);

  await releaseExpiredLeases(dependencies.database, expiryUtc);

  const domainLease = await dependencies.database
    .prepare(
      "INSERT OR IGNORE INTO assessment_admission_leases (normalised_domain, acquired_at_utc) VALUES (?, ?)",
    )
    .bind(dependencies.normalisedDomain, nowUtc)
    .run();
  if (changes(domainLease) !== 1) return { kind: "rejected", reasonCode: "duplicate_active" };

  const slotLease = await dependencies.database
    .prepare(
      `UPDATE assessment_concurrency_slots
       SET normalised_domain = ?, acquired_at_utc = ?
       WHERE slot_id = (
         SELECT slot_id FROM assessment_concurrency_slots
         WHERE normalised_domain IS NULL ORDER BY slot_id LIMIT 1
       ) AND normalised_domain IS NULL`,
    )
    .bind(dependencies.normalisedDomain, nowUtc)
    .run();
  if (changes(slotLease) !== 1) {
    await releaseDomainLease(dependencies.database, dependencies.normalisedDomain);
    return { kind: "rejected", reasonCode: "concurrency_limited" };
  }

  const rate = await dependencies.database
    .prepare(
      `INSERT INTO assessment_ip_day_limits (
        ip_day_hmac, auckland_day, start_count, first_started_at_utc, last_started_at_utc
      ) VALUES (?, ?, 1, ?, ?)
      ON CONFLICT(ip_day_hmac, auckland_day) DO UPDATE SET
        start_count = assessment_ip_day_limits.start_count + 1,
        last_started_at_utc = excluded.last_started_at_utc
      WHERE assessment_ip_day_limits.start_count < ?`,
    )
    .bind(dependencies.ipDayHmac, aucklandDay, nowUtc, nowUtc, MAX_STARTS_PER_AUCKLAND_DAY)
    .run();
  if (changes(rate) !== 1) {
    await releaseLeases(dependencies.database, dependencies.normalisedDomain);
    return { kind: "rejected", reasonCode: "rate_limited" };
  }

  return {
    kind: "admitted",
    release: () => releaseLeases(dependencies.database, dependencies.normalisedDomain),
  };
}

/** Calendar key only; persisted timestamps remain UTC. */
export function getAucklandDay(value: Date): string {
  const fields = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Pacific/Auckland",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: string) => fields.find((field) => field.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function changes(result: { success: boolean; meta?: { changes?: number } }): number {
  return result.success ? (result.meta?.changes ?? 0) : 0;
}

async function releaseExpiredLeases(database: D1DatabaseLike, expiryUtc: string): Promise<void> {
  await database
    .prepare("DELETE FROM assessment_admission_leases WHERE acquired_at_utc < ?")
    .bind(expiryUtc)
    .run();
  await database
    .prepare(
      "UPDATE assessment_concurrency_slots SET normalised_domain = NULL, acquired_at_utc = NULL WHERE acquired_at_utc < ?",
    )
    .bind(expiryUtc)
    .run();
}

async function releaseDomainLease(
  database: D1DatabaseLike,
  normalisedDomain: string,
): Promise<void> {
  await database
    .prepare("DELETE FROM assessment_admission_leases WHERE normalised_domain = ?")
    .bind(normalisedDomain)
    .run();
}

async function releaseLeases(database: D1DatabaseLike, normalisedDomain: string): Promise<void> {
  await releaseDomainLease(database, normalisedDomain);
  await database
    .prepare(
      "UPDATE assessment_concurrency_slots SET normalised_domain = NULL, acquired_at_utc = NULL WHERE normalised_domain = ?",
    )
    .bind(normalisedDomain)
    .run();
}
