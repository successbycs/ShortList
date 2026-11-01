import { describe, expect, it, vi } from "vitest";

const saved = { assessmentId: "saved-run", normalisedDomain: "example.co.nz" };

vi.mock("./geo-assessment-repository", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./geo-assessment-repository")>()),
  findStoredGeoAssessment: vi.fn(async () => saved),
}));

const { runLiveAssessment } = await import("./live-assessment");

describe("repeat visits", () => {
  it("replay the saved report without crawling the site or calling AI", async () => {
    const fetchImplementation = vi.fn(async () => {
      throw new Error("no website or AI request may run on a repeat visit");
    });

    const result = await runLiveAssessment("example.co.nz", {
      database: {} as never,
      apiKey: "not-used",
      ipDayHmac: "ip",
      fetchImplementation,
    });

    expect(result).toEqual({ kind: "cached", result: saved });
    expect(fetchImplementation).not.toHaveBeenCalled();
  });
});
