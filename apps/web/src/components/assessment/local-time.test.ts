import { describe, expect, it } from "vitest";

import { formatLocalTime } from "./journey-screens";

describe("report check time", () => {
  it("shows the time in the visitor's timezone, not UTC", () => {
    // 08:29 UTC on 1 Nov 2026 is 9:29 pm NZDT.
    const text = formatLocalTime("2026-11-01T08:29:48.999Z", "Pacific/Auckland");
    expect(text).toContain("1 November 2026");
    expect(text).toMatch(/9:29\s?pm/i);
    expect(text).toContain("NZDT");
    expect(text).not.toContain("UTC");
  });
});
