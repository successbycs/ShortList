import { describe, expect, it, vi } from "vitest";

import type { D1DatabaseLike, D1StatementLike } from "./assessment-repository";
import type { FetchImplementation } from "./safe-website-fetch";
import { runWebsiteAssessment } from "./website-assessment";

type Call = { query: string; values: unknown[] };

function databaseFixture(): { database: D1DatabaseLike; calls: Call[] } {
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
          return null as T | null;
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

function ids(...ids: string[]): () => string {
  return () => ids.shift() ?? "unexpected-id";
}

function fetchFixture(response: Response): FetchImplementation {
  return vi.fn().mockResolvedValue(response);
}

const now = () => new Date("2026-10-05T08:15:00.000Z");

describe("runWebsiteAssessment", () => {
  it("keeps invalid input out of D1 and never calls the website transport", async () => {
    const { database, calls } = databaseFixture();
    const fetchImplementation = fetchFixture(new Response("unused"));

    await expect(
      runWebsiteAssessment("http://127.0.0.1", { database, fetchImplementation, now }),
    ).resolves.toEqual({ kind: "invalid_input", reasonCode: "private_or_local_target" });
    expect(calls).toEqual([]);
    expect(fetchImplementation).not.toHaveBeenCalled();
  });

  it("persists bounded evidence then marks the run preview-ready", async () => {
    const { database, calls } = databaseFixture();

    const result = await runWebsiteAssessment("HarbourHandyman.CO.NZ", {
      database,
      fetchImplementation: fetchFixture(
        new Response("<title>Harbour</title><h1>Local home repairs</h1>", {
          headers: { "content-type": "text/html" },
        }),
      ),
      now,
      createId: ids("customer-1", "assessment-1", "evidence-1"),
    });

    expect(result).toMatchObject({
      kind: "preview_ready",
      assessment: { assessmentId: "assessment-1", normalisedDomain: "harbourhandyman.co.nz" },
      evidence: { evidenceId: "evidence-1", excerpt: "Harbour Local home repairs" },
    });
    expect(calls.at(-1)).toEqual({
      query: "UPDATE assessment_runs SET status = ?, reason_code = ? WHERE assessment_id = ?",
      values: ["preview_ready", null, "assessment-1"],
    });
  });

  it("persists an honest limited state when website text is insufficient", async () => {
    const { database, calls } = databaseFixture();

    const result = await runWebsiteAssessment("harbourhandyman.co.nz", {
      database,
      fetchImplementation: fetchFixture(
        new Response("<script>ignored()</script>", {
          headers: { "content-type": "text/html" },
        }),
      ),
      now,
      createId: ids("customer-1", "assessment-1", "evidence-1"),
    });

    expect(result).toMatchObject({ kind: "limited", reasonCode: "evidence_insufficient" });
    expect(calls.at(-2)?.values).toContain("evidence_insufficient");
    expect(calls.at(-1)?.values).toEqual(["limited", "evidence_insufficient", "assessment-1"]);
  });
});
