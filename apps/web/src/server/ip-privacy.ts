import { getUtcDay } from "./assessment-admission";

const encoder = new TextEncoder();

/**
 * Returns the only IP representation permitted to reach D1. The raw address
 * remains request-local and the secret is a server-side Worker binding.
 */
export async function createIpDayHmac(
  rawIp: string,
  secret: string | undefined,
  now: Date = new Date(),
): Promise<string | undefined> {
  const ip = rawIp.trim();
  if (!ip || !secret) return undefined;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${getUtcDay(now)}:${ip}`),
  );
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}
