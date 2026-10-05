import { describe, expect, it } from "vitest";

import { admitPublicDomain } from "@/lib/domain-admission";

describe("admitPublicDomain", () => {
  it.each([
    ["Harbour-Handyman.CO.NZ", "harbour-handyman.co.nz"],
    [" https://example.co.nz/path?campaign=test ", "example.co.nz"],
    ["https://xn--bcher-kva.example", "xn--bcher-kva.example"],
  ])("normalises a supported public website target %#", (input, expected) => {
    expect(admitPublicDomain(input)).toEqual({ kind: "accepted", normalisedDomain: expected });
  });

  it.each([
    ["", "empty_domain"],
    ["not a domain", "malformed_domain"],
    ["example", "malformed_domain"],
    ["ftp://example.co.nz", "unsupported_scheme"],
    ["https://user:password@example.co.nz", "credentials_not_allowed"],
    ["https://example.co.nz:8443", "port_not_allowed"],
  ])("rejects invalid input %# before a network operation", (input, reasonCode) => {
    expect(admitPublicDomain(input)).toEqual({ kind: "rejected", reasonCode });
  });

  it.each([
    "localhost",
    "api.localhost",
    "printer.local",
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.10",
    "192.168.0.1",
    "169.254.169.254",
    "100.64.0.1",
    "192.0.2.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "http://[::1]",
    "http://[fe80::1]",
  ])("rejects a local or private target %# without resolving it", (input) => {
    expect(admitPublicDomain(input)).toEqual({
      kind: "rejected",
      reasonCode: "private_or_local_target",
    });
  });
});
