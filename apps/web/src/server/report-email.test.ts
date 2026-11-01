import { beforeEach, describe, expect, it, vi } from "vitest";

import type { D1DatabaseLike, D1StatementLike } from "./assessment-repository";
import type { StoredGeoAssessment } from "./geo-assessment-repository";

const report = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("./geo-assessment-repository", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./geo-assessment-repository")>()),
  findStoredGeoAssessment: vi.fn(async () => report.current),
}));

const {
  CONSENT_WORDING_VERSION,
  normaliseEmail,
  renderReportEmail,
  REPORT_EMAIL_LIMITS,
  requestReportEmail,
} = await import("./report-email");

const finding = (index: number, icpId: string) => ({
  icpId,
  questionId: `q${index}`,
  questionText: `Question ${index}?`,
  buyerIntent: "Find a provider",
  testedClaim: "Relevant",
  answerSummary: `Answer ${index}.`,
  submittedBusinessMention: index % 2 === 0 ? ("mentioned" as const) : ("absent" as const),
  descriptionAccuracy: "accurate" as const,
  recommendationFit: index === 0 ? ("appropriate" as const) : ("uncertain" as const),
  sources: [{ title: "Source", url: "https://source.example/" }],
  websiteContentGaps: ["Show prices"],
  limitations: [],
  confidence: "medium" as const,
});

const storedReport: StoredGeoAssessment = {
  assessmentId: "run-1",
  normalisedDomain: "example.co.nz",
  triggeredAtUtc: "2026-11-01T08:29:48.999Z",
  excerpt: "Example",
  profile: {
    businessName: { value: "Example <Lawns>", evidenceIds: ["s"], confidence: "high" },
    websiteDomain: "example.co.nz",
    services: [{ value: "Lawn mowing", evidenceIds: ["s"], confidence: "high" }],
    serviceAreas: [{ value: "Auckland", evidenceIds: ["s"], confidence: "high" }],
    audienceSignals: [],
    valuePropositions: [],
    proofPoints: [],
    differentiators: [],
    contentGaps: [],
    limitations: [],
    confidence: "medium",
  },
  icps: [
    {
      id: "icp-1",
      label: "Busy homeowners",
      audienceDescription: "People without time.",
      buyerSituation: "x",
      needs: [],
      decisionCriteria: [],
      evidenceIds: ["s"],
      confidence: "medium",
      uncertainty: "x",
    },
  ],
  findings: {
    current_web: [finding(0, "icp-1"), finding(1, "icp-1")],
    model_knowledge: [finding(0, "icp-1")],
  },
};

type Row = { requestId: string; assessmentId: string; ip: string; outcome: string };

/**
 * A small in-memory stand-in for D1. Each statement runs on its own, as in
 * D1, so the reservation's limit check and insert happen together.
 */
function fakeDatabase(
  options: { domain?: string | null; rows?: Row[]; failReservation?: boolean } = {},
) {
  const rows: Row[] = [...(options.rows ?? [])];
  const inserts: unknown[][] = [];
  let queries = 0;
  const database: D1DatabaseLike = {
    prepare(query) {
      queries += 1;
      let values: unknown[] = [];
      const statement: D1StatementLike = {
        bind(...bound) {
          values = bound;
          return statement;
        },
        async first<T>() {
          return (
            options.domain === null
              ? null
              : { normalised_domain: options.domain ?? "example.co.nz" }
          ) as T | null;
        },
        async all<T>() {
          return { results: [] as T[] };
        },
        async run() {
          if (query.includes("INSERT INTO report_email_requests")) {
            if (options.failReservation) return { success: false };
            inserts.push(values);
            const [id, assessmentId, , , , ip, , , perReport, , perVisitor] = values as [
              string,
              string,
              string,
              number,
              string,
              string,
              string,
              string,
              number,
              string,
              number,
            ];
            const forReport = rows.filter((row) => row.assessmentId === assessmentId).length;
            const forVisitor = rows.filter((row) => row.ip === ip).length;
            if (forReport >= perReport || forVisitor >= perVisitor) {
              return { success: true, meta: { changes: 0 } };
            }
            rows.push({ requestId: id, assessmentId, ip, outcome: "pending" });
            return { success: true, meta: { changes: 1 } };
          }
          if (query.startsWith("UPDATE report_email_requests")) {
            const [outcome, id] = values as [string, string];
            const row = rows.find((candidate) => candidate.requestId === id);
            if (row) row.outcome = outcome;
            return { success: true, meta: { changes: row ? 1 : 0 } };
          }
          return { success: true };
        },
      };
      return statement;
    },
  };
  return { database, rows, inserts, queryCount: () => queries };
}

let nextId = 0;
const createId = () => `req-${++nextId}`;

const request = {
  assessmentId: "run-1",
  email: "  Mara@Example.CO.NZ ",
  deliveryConsent: true,
  marketingConsent: false,
};

describe("report email", () => {
  beforeEach(() => {
    report.current = storedReport;
  });

  it("normalises sensible addresses and rejects others", () => {
    expect(normaliseEmail(" Mara@Example.CO.NZ ")).toBe("mara@example.co.nz");
    for (const bad of [
      "",
      "mara",
      "mara@",
      "@example.co.nz",
      "a b@example.co.nz",
      "mara@example",
    ]) {
      expect(normaliseEmail(bad)).toBeUndefined();
    }
    expect(normaliseEmail(`${"a".repeat(250)}@x.nz`)).toBeUndefined();
  });

  it("reserves the request with consent first, then sends, then records the outcome", async () => {
    const { database, rows, inserts } = fakeDatabase();
    const sendMail = vi.fn(async () => {
      expect(rows[0]?.outcome).toBe("pending"); // reserved before sending
    });

    const result = await requestReportEmail(
      { ...request, marketingConsent: true },
      {
        database,
        ipDayHmac: "ip-day",
        sendMail,
        createId: () => "req-1",
        now: () => new Date("2026-11-01T09:00:00Z"),
      },
    );

    expect(result).toEqual({ kind: "sent" });
    expect(JSON.stringify(result)).not.toContain("mara");
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "mara@example.co.nz",
        subject: "Your ShortList report for example.co.nz",
      }),
    );
    expect(inserts[0]?.slice(0, 7)).toEqual([
      "req-1",
      "run-1",
      "mara@example.co.nz",
      1,
      CONSENT_WORDING_VERSION,
      "ip-day",
      "2026-11-01T09:00:00.000Z",
    ]);
    expect(rows).toEqual([
      { requestId: "req-1", assessmentId: "run-1", ip: "ip-day", outcome: "sent" },
    ]);
  });

  it("records a failed send and says so, without logging the error", async () => {
    const { database, rows } = fakeDatabase();
    const sendMail = vi.fn(async () => {
      throw new Error("535 bad credentials for mara@example.co.nz");
    });
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const result = await requestReportEmail(request, {
      database,
      ipDayHmac: "ip",
      sendMail,
      createId,
    });

    expect(result).toEqual({ kind: "send_failed" });
    expect(rows[0]?.outcome).toBe("failed");
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it.each([
    [{ email: "not-an-email" }, "invalid_email"],
    [{ deliveryConsent: false }, "consent_required"],
  ] as const)("refuses %o before any lookup or send (%s)", async (change, kind) => {
    const { database, queryCount } = fakeDatabase();
    const sendMail = vi.fn();
    const result = await requestReportEmail(
      { ...request, ...change },
      { database, ipDayHmac: "ip", sendMail },
    );
    expect(result).toEqual({ kind });
    expect(queryCount()).toBe(0);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("refuses an unknown run, or one whose saved report is a different run", async () => {
    const sendMail = vi.fn();
    expect(
      await requestReportEmail(request, {
        database: fakeDatabase({ domain: null }).database,
        ipDayHmac: "ip",
        sendMail,
      }),
    ).toEqual({ kind: "not_found" });
    report.current = { ...storedReport, assessmentId: "a-newer-run" };
    expect(
      await requestReportEmail(request, {
        database: fakeDatabase().database,
        ipDayHmac: "ip",
        sendMail,
      }),
    ).toEqual({ kind: "not_found" });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it.each([
    [
      "per report",
      Array.from({ length: REPORT_EMAIL_LIMITS.perReport }, (_, i) => ({
        requestId: `old-${i}`,
        assessmentId: "run-1",
        ip: `other-${i}`,
        outcome: "sent",
      })),
    ],
    [
      "per visitor per day",
      Array.from({ length: REPORT_EMAIL_LIMITS.perVisitorDay }, (_, i) => ({
        requestId: `old-${i}`,
        assessmentId: `run-${i + 10}`,
        ip: "ip",
        outcome: "failed",
      })),
    ],
  ])("stops at the %s limit, counting failed and pending attempts too", async (_label, rows) => {
    const { database } = fakeDatabase({ rows });
    const sendMail = vi.fn();
    expect(
      await requestReportEmail(request, { database, ipDayHmac: "ip", sendMail, createId }),
    ).toEqual({ kind: "limited" });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("lets only three of a burst of twelve simultaneous requests through", async () => {
    const { database, rows } = fakeDatabase();
    const sendMail = vi.fn(async () => undefined);

    const results = await Promise.all(
      Array.from({ length: 12 }, () =>
        requestReportEmail(request, { database, ipDayHmac: "ip", sendMail, createId }),
      ),
    );

    expect(sendMail).toHaveBeenCalledTimes(REPORT_EMAIL_LIMITS.perReport);
    expect(rows).toHaveLength(REPORT_EMAIL_LIMITS.perReport);
    expect(results.filter((result) => result.kind === "limited")).toHaveLength(9);
  });

  it("sends nothing when the request can't be stored", async () => {
    const { database } = fakeDatabase({ failReservation: true });
    const sendMail = vi.fn();
    await expect(
      requestReportEmail(request, { database, ipDayHmac: "ip", sendMail, createId }),
    ).rejects.toThrow("Could not store");
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("renders the whole report, escapes page text, and includes the privacy line", () => {
    const email = renderReportEmail(storedReport, "https://shortlist.successbycs.com");

    expect(email.html).toContain("Example &lt;Lawns&gt;");
    expect(email.html).not.toContain("<Lawns>");
    expect(email.html).toContain("Busy homeowners");
    expect(email.html).toContain("Question 0?");
    expect(email.html).toContain("Mentioned you");
    expect(email.html).toContain("Recommended you");
    expect(email.html).toContain("Show prices");
    expect(email.text).toContain("it mentioned you in 1 and recommended you in 1");
    expect(email.text).toContain("until you ask us to delete it");
  });
});
