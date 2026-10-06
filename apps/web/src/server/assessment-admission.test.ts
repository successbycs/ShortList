import { describe, expect, it } from "vitest";

import type { D1DatabaseLike, D1StatementLike } from "./assessment-repository";
import {
  ASSESSMENT_ADMISSION_LEASE_MS,
  admitAssessmentStart,
  getAucklandDay,
} from "./assessment-admission";
import { runLiveAssessment } from "./live-assessment";

type State = {
  domains: Set<string>;
  slots: Array<string | null>;
  rates: Map<string, number>;
  domainAcquiredAt: Map<string, string>;
  slotAcquiredAt: Array<string | null>;
  queries: string[];
};

function database(state: State): D1DatabaseLike {
  return {
    prepare(query) {
      let values: unknown[] = [];
      const statement: D1StatementLike = {
        bind(...bound) {
          values = bound;
          return statement;
        },
        async first<T>() {
          return null as T | null;
        },
        async all<T>() {
          return { results: [] as T[] };
        },
        async run() {
          state.queries.push(query);
          if (query.startsWith("DELETE FROM assessment_admission_leases WHERE acquired")) {
            const expiryUtc = values[0] as string;
            let removed = 0;
            for (const [domain, acquiredAtUtc] of state.domainAcquiredAt) {
              if (acquiredAtUtc < expiryUtc) {
                state.domainAcquiredAt.delete(domain);
                state.domains.delete(domain);
                removed += 1;
              }
            }
            return { success: true, meta: { changes: removed } };
          }
          if (
            query.startsWith("UPDATE assessment_concurrency_slots SET normalised_domain = NULL") &&
            query.includes("acquired_at_utc <")
          ) {
            const expiryUtc = values[0] as string;
            let removed = 0;
            state.slots = state.slots.map((domain, slot) => {
              if (state.slotAcquiredAt[slot] && state.slotAcquiredAt[slot] < expiryUtc) {
                state.slotAcquiredAt[slot] = null;
                removed += 1;
                return null;
              }
              return domain;
            });
            return { success: true, meta: { changes: removed } };
          }
          if (query.startsWith("INSERT OR IGNORE INTO assessment_admission_leases")) {
            const domain = values[0] as string;
            if (state.domains.has(domain)) return { success: true, meta: { changes: 0 } };
            state.domains.add(domain);
            state.domainAcquiredAt.set(domain, values[1] as string);
            return { success: true, meta: { changes: 1 } };
          }
          if (
            query.startsWith("UPDATE assessment_concurrency_slots\n       SET normalised_domain")
          ) {
            const domain = values[0] as string;
            const slot = state.slots.findIndex((value) => value === null);
            if (slot === -1) return { success: true, meta: { changes: 0 } };
            state.slots[slot] = domain;
            state.slotAcquiredAt[slot] = values[1] as string;
            return { success: true, meta: { changes: 1 } };
          }
          if (query.startsWith("INSERT INTO assessment_ip_day_limits")) {
            const key = `${values[0]}:${values[1]}`;
            const count = state.rates.get(key) ?? 0;
            if (count >= 5) return { success: true, meta: { changes: 0 } };
            state.rates.set(key, count + 1);
            return { success: true, meta: { changes: 1 } };
          }
          if (query.startsWith("DELETE FROM assessment_admission_leases WHERE normalised_domain")) {
            const domain = values[0] as string;
            state.domains.delete(domain);
            state.domainAcquiredAt.delete(domain);
            return { success: true, meta: { changes: 1 } };
          }
          if (
            query.startsWith("UPDATE assessment_concurrency_slots SET normalised_domain = NULL")
          ) {
            const domain = values[0] as string;
            state.slots = state.slots.map((value, slot) => {
              if (value === domain) state.slotAcquiredAt[slot] = null;
              return value === domain ? null : value;
            });
            return { success: true, meta: { changes: 1 } };
          }
          throw new Error(`Unexpected query: ${query}`);
        },
      };
      return statement;
    },
  };
}

function state(overrides: Partial<State> = {}): State {
  return {
    domains: new Set(),
    slots: [null, null],
    rates: new Map(),
    domainAcquiredAt: new Map(),
    slotAcquiredAt: [null, null],
    queries: [],
    ...overrides,
  };
}

const clock = () => new Date("2026-10-04T11:30:00.000Z");

describe("assessment admission boundary", () => {
  it("uses the Auckland calendar day across the daylight-saving transition", () => {
    expect(getAucklandDay(new Date("2026-04-04T10:30:00.000Z"))).toBe("2026-04-04");
    expect(getAucklandDay(new Date("2026-04-04T14:30:00.000Z"))).toBe("2026-04-05");
  });

  it("rejects an already-active normalised domain without an assessment write", async () => {
    const current = state({ domains: new Set(["example.co.nz"]) });
    const result = await admitAssessmentStart({
      database: database(current),
      normalisedDomain: "example.co.nz",
      ipDayHmac: "ip",
      now: clock,
    });
    expect(result).toEqual({ kind: "rejected", reasonCode: "duplicate_active" });
    expect(current.queries.join("\n")).not.toContain("assessment_runs");
  });

  it("rejects when both global slots are active and releases its domain lease", async () => {
    const current = state({ slots: ["one.co.nz", "two.co.nz"] });
    const result = await admitAssessmentStart({
      database: database(current),
      normalisedDomain: "example.co.nz",
      ipDayHmac: "ip",
      now: clock,
    });
    expect(result).toEqual({ kind: "rejected", reasonCode: "concurrency_limited" });
    expect(current.domains).not.toContain("example.co.nz");
    expect(current.queries.join("\n")).not.toContain("assessment_runs");
  });

  it("rejects a sixth start for the privacy-minimised IP/day and releases all leases", async () => {
    const key = "ip:2026-10-05";
    const current = state({ rates: new Map([[key, 5]]) });
    const result = await admitAssessmentStart({
      database: database(current),
      normalisedDomain: "example.co.nz",
      ipDayHmac: "ip",
      now: clock,
    });
    expect(result).toEqual({ kind: "rejected", reasonCode: "rate_limited" });
    expect(current.domains).not.toContain("example.co.nz");
    expect(current.slots).toEqual([null, null]);
    expect(current.queries.join("\n")).not.toContain("assessment_runs");
  });

  it("holds and releases a permitted domain/global reservation", async () => {
    const current = state();
    const result = await admitAssessmentStart({
      database: database(current),
      normalisedDomain: "example.co.nz",
      ipDayHmac: "ip",
      now: clock,
    });
    expect(result.kind).toBe("admitted");
    if (result.kind === "admitted") await result.release();
    expect(current.domains.size).toBe(0);
    expect(current.slots).toEqual([null, null]);
    expect(current.rates.get("ip:2026-10-05")).toBe(1);
  });

  it("keeps domain and global claims through the maximum supported assessment duration", async () => {
    const current = state();
    const first = await admitAssessmentStart({
      database: database(current),
      normalisedDomain: "first.co.nz",
      ipDayHmac: "first-ip",
      now: clock,
    });
    const second = await admitAssessmentStart({
      database: database(current),
      normalisedDomain: "second.co.nz",
      ipDayHmac: "second-ip",
      now: clock,
    });
    expect(first.kind).toBe("admitted");
    expect(second.kind).toBe("admitted");

    const maximumRunClock = () => new Date(clock().getTime() + 65_000);
    await expect(
      admitAssessmentStart({
        database: database(current),
        normalisedDomain: "first.co.nz",
        ipDayHmac: "third-ip",
        now: maximumRunClock,
      }),
    ).resolves.toEqual({ kind: "rejected", reasonCode: "duplicate_active" });
    await expect(
      admitAssessmentStart({
        database: database(current),
        normalisedDomain: "third.co.nz",
        ipDayHmac: "third-ip",
        now: maximumRunClock,
      }),
    ).resolves.toEqual({ kind: "rejected", reasonCode: "concurrency_limited" });

    if (first.kind === "admitted") await first.release();
    if (second.kind === "admitted") await second.release();
  });

  it("recovers an abandoned reservation only after the full conservative lease", async () => {
    const current = state();
    const first = await admitAssessmentStart({
      database: database(current),
      normalisedDomain: "example.co.nz",
      ipDayHmac: "ip",
      now: clock,
    });
    expect(first.kind).toBe("admitted");

    const staleClock = () => new Date(clock().getTime() + ASSESSMENT_ADMISSION_LEASE_MS + 1);
    const recovered = await admitAssessmentStart({
      database: database(current),
      normalisedDomain: "example.co.nz",
      ipDayHmac: "ip",
      now: staleClock,
    });
    expect(recovered.kind).toBe("admitted");
    expect(current.rates.get("ip:2026-10-05")).toBe(2);
    if (recovered.kind === "admitted") await recovered.release();
  });

  it.each([
    ["duplicate-active", state({ domains: new Set(["example.co.nz"]) }), "duplicate_active"],
    ["global-concurrency", state({ slots: ["one.co.nz", "two.co.nz"] }), "concurrency_limited"],
    ["daily-rate", state({ rates: new Map([["ip:2026-10-05", 5]]) }), "rate_limited"],
  ] as const)("stops %s work before website or AI fetches", async (_case, current, reasonCode) => {
    const network = async () => {
      throw new Error("website or AI fetch must not run");
    };
    const result = await runLiveAssessment("example.co.nz", {
      database: database(current),
      apiKey: "not-used",
      ipDayHmac: "ip",
      now: clock,
      fetchImplementation: network as typeof fetch,
    });
    expect(result).toEqual({ kind: "admission_rejected", reasonCode });
  });

  it("stops an invalid private target before D1, website or AI work", async () => {
    const current = state();
    const result = await runLiveAssessment("http://127.0.0.1/private", {
      database: database(current),
      apiKey: "not-used",
      ipDayHmac: "ip",
      now: clock,
      fetchImplementation: (async () => {
        throw new Error("website or AI fetch must not run");
      }) as typeof fetch,
    });
    expect(result.kind).toBe("invalid_input");
    expect(current.queries).toEqual([]);
  });
});
