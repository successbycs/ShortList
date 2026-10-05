export const DOMAIN_ASSESSMENT_TURNSTILE_ACTION = "domain_assessment";

export const MVP1_TURNSTILE_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "shortlist.successbycs.com",
]);

export type TurnstileVerification =
  | { kind: "verified" }
  | {
      kind:
        | "missing_configuration"
        | "missing_token"
        | "invalid_token"
        | "verification_unavailable"
        | "verification_rejected";
    };

type TurnstileDependencies = {
  secret: string | undefined;
  expectedHostname: string;
  expectedAction?: string;
  expectedHostnames?: Set<string>;
  fetchImplementation?: typeof fetch;
};

/** Verifies one browser-issued Turnstile response without exposing its secret. */
export async function verifyTurnstileResponse(
  token: string,
  dependencies: TurnstileDependencies,
): Promise<TurnstileVerification> {
  const expectedAction = dependencies.expectedAction ?? DOMAIN_ASSESSMENT_TURNSTILE_ACTION;
  const expectedHostnames = dependencies.expectedHostnames ?? MVP1_TURNSTILE_HOSTNAMES;
  const expectedHostname = normaliseHostname(dependencies.expectedHostname);
  if (
    typeof dependencies.secret !== "string" ||
    dependencies.secret.trim().length === 0 ||
    !expectedHostnames.has(expectedHostname)
  ) {
    return { kind: "missing_configuration" };
  }
  if (!token) return { kind: "missing_token" };
  if (token.length > 2048) return { kind: "invalid_token" };

  let response: Response;
  try {
    response = await (dependencies.fetchImplementation ?? fetch)(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: dependencies.secret, response: token }),
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    return { kind: "verification_unavailable" };
  }
  if (!response.ok) return { kind: "verification_unavailable" };

  let result: { success?: unknown; action?: unknown; hostname?: unknown };
  try {
    result = (await response.json()) as typeof result;
  } catch {
    return { kind: "verification_unavailable" };
  }
  if (
    result.success !== true ||
    result.action !== expectedAction ||
    normaliseHostname(result.hostname) !== expectedHostname
  ) {
    return { kind: "verification_rejected" };
  }
  return { kind: "verified" };
}

function normaliseHostname(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase().replace(/\.$/, "") : "";
}
