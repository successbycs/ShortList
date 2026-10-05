import { describe, expect, it } from "vitest";

import {
  createAssessmentAdmission,
  completeAssessmentRun,
  recordWebsiteEvidence,
  type D1DatabaseLike,
  type D1StatementLike,
} from "./assessment-repository";

type Call = { query: string; values: unknown[] };

function fakeDatabase(firstResults: Array<unknown | null> = []): {
  database: D1DatabaseLike;
  calls: Call[];
} {
  const calls: Call[] = [];
  const database: D1DatabaseLike = {
    prepare(query) {
      let values: unknown[] = [];
      const statement: D1StatementLike = {
        bind(...boundValues) {
          values = boundValues;
          return statement;
        },
        async first<T>() {
          calls.push({ query, values });
          return (firstResults.shift() ?? null) as T | null;
        },
        async all<T>() {
          calls.push({ query, values });
          return { results: [] as T[] };
        },
        async run() {
          calls.push({ query, values });
          return { success: true };
        },
      };
      return statement;
    },
  };
  return { database, calls };
}

function deterministicIds(): () => string {
  const ids = ["customer-1", "assessment-1", "evidence-1"];
  return () => ids.shift() ?? "unexpected-id";
}

describe("assessment repository", () => {
  it("creates one customer and one dated admitted assessment for a new domain", async () => {
    const { database, calls } = fakeDatabase();
    const admission = await createAssessmentAdmission(database, {
      normalisedDomain: "harbourhandyman.co.nz",
      originalSubmission: "HarbourHandyman.CO.NZ",
      inputUrl: "https://harbourhandyman.co.nz/",
      triggeredAtUtc: "2026-10-05T07:00:00.000Z",
      contractVersion: "v1",
      createId: deterministicIds(),
    });

    expect(admission).toEqual({
      customerId: "customer-1",
      assessmentId: "assessment-1",
      normalisedDomain: "harbourhandyman.co.nz",
      inputUrl: "https://harbourhandyman.co.nz/",
      triggeredAtUtc: "2026-10-05T07:00:00.000Z",
    });
    expect(calls).toHaveLength(3);
    expect(calls[0]?.query).toContain("SELECT customer_id FROM customers");
    expect(calls[1]?.query).toContain("INSERT INTO customers");
    expect(calls[2]?.query).toContain("INSERT INTO assessment_runs");
    expect(calls.flatMap((call) => call.values)).not.toContain("undefined");
  });

  it("reuses the customer record while creating a fresh dated assessment run", async () => {
    const { database, calls } = fakeDatabase([{ customer_id: "existing-customer" }]);
    const admission = await createAssessmentAdmission(database, {
      normalisedDomain: "harbourhandyman.co.nz",
      originalSubmission: "harbourhandyman.co.nz",
      inputUrl: "https://harbourhandyman.co.nz/",
      triggeredAtUtc: "2026-10-05T07:00:00.000Z",
      contractVersion: "v1",
      createId: deterministicIds(),
    });

    expect(admission.customerId).toBe("existing-customer");
    expect(admission.assessmentId).toBe("customer-1");
    expect(calls.map((call) => call.query)).toEqual([
      "SELECT customer_id FROM customers WHERE normalised_domain = ?",
      "UPDATE customers SET reused_at_utc = ? WHERE customer_id = ?",
      expect.stringContaining("INSERT INTO assessment_runs"),
    ]);
  });

  it("uses bound parameters when storing website evidence", async () => {
    const { database, calls } = fakeDatabase();
    await recordWebsiteEvidence(database, {
      evidenceId: "evidence-1",
      assessmentId: "assessment-1",
      sourceUrl: "https://harbourhandyman.co.nz/",
      observedAtUtc: "2026-10-05T07:00:00.000Z",
      contentType: "text/html",
      boundedExcerpt: "Reliable home repairs",
      fetchOutcome: "captured",
      extractionOutcome: "captured",
      contractVersion: "v1",
    });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.query).toContain("VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    expect(calls[0]?.values).toContain("Reliable home repairs");
  });

  it("records a final public-safe outcome against the admitted assessment", async () => {
    const { database, calls } = fakeDatabase();

    await completeAssessmentRun(database, {
      assessmentId: "assessment-1",
      status: "limited",
      reasonCode: "evidence_insufficient",
    });

    expect(calls).toEqual([
      {
        query: "UPDATE assessment_runs SET status = ?, reason_code = ? WHERE assessment_id = ?",
        values: ["limited", "evidence_insufficient", "assessment-1"],
      },
    ]);
  });
});
