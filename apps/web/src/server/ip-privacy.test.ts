import { describe, expect, it } from "vitest";

import { createIpDayHmac } from "./ip-privacy";

describe("IP privacy boundary", () => {
  it("returns a deterministic keyed digest and never returns the raw IP", async () => {
    const now = new Date("2026-10-04T11:30:00.000Z");
    const digest = await createIpDayHmac("203.0.113.9", "test-only-secret", now);
    expect(digest).toHaveLength(64);
    expect(digest).not.toContain("203.0.113.9");
    await expect(createIpDayHmac("203.0.113.9", "test-only-secret", now)).resolves.toBe(digest);
  });

  it("uses a different digest on a different UTC calendar day", async () => {
    const first = await createIpDayHmac(
      "203.0.113.9",
      "test-only-secret",
      new Date("2026-10-04T11:30:00.000Z"),
    );
    const second = await createIpDayHmac(
      "203.0.113.9",
      "test-only-secret",
      new Date("2026-10-05T11:30:00.000Z"),
    );
    expect(first).not.toBe(second);
  });

  it("fails closed when the address or server-only secret is unavailable", async () => {
    await expect(createIpDayHmac("", "test-only-secret")).resolves.toBeUndefined();
    await expect(createIpDayHmac("203.0.113.9", undefined)).resolves.toBeUndefined();
  });
});
