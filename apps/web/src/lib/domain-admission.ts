/**
 * Offline validation shared by the browser's input feedback and the server's
 * authoritative safe-fetch boundary. It never resolves or fetches a target.
 */
export type DomainAdmission =
  | { kind: "accepted"; normalisedDomain: string }
  | { kind: "rejected"; reasonCode: DomainAdmissionReasonCode };

export type DomainAdmissionReasonCode =
  | "empty_domain"
  | "malformed_domain"
  | "unsupported_scheme"
  | "credentials_not_allowed"
  | "port_not_allowed"
  | "private_or_local_target";

const IPV4_ADDRESS = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const DOMAIN_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const TOP_LEVEL_LABEL = /^[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/**
 * Validates an ordinary public website hostname without network access.
 * Accepts a hostname or an `http`/`https` URL pasted from a browser, then
 * returns only a lower-cased hostname. It does not treat `www` aliases as the
 * same customer: that identity decision belongs with the later database
 * normalisation policy.
 */
export function admitPublicDomain(input: string): DomainAdmission {
  const candidate = input.trim();

  if (candidate.length === 0) {
    return rejected("empty_domain");
  }

  const parsed = parseCandidate(candidate);
  if ("kind" in parsed) {
    return parsed;
  }

  if (parsed.username.length > 0 || parsed.password.length > 0) {
    return rejected("credentials_not_allowed");
  }

  if (parsed.port.length > 0) {
    return rejected("port_not_allowed");
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");
  if (isPrivateOrLocalHostname(hostname)) {
    return rejected("private_or_local_target");
  }

  if (!isDomainHostname(hostname)) {
    return rejected("malformed_domain");
  }

  return { kind: "accepted", normalisedDomain: hostname };
}

function parseCandidate(candidate: string): URL | DomainAdmission {
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(candidate);
  if (hasScheme && !/^https?:/i.test(candidate)) {
    return rejected("unsupported_scheme");
  }

  try {
    return new URL(hasScheme ? candidate : `https://${candidate}`);
  } catch {
    return rejected("malformed_domain");
  }
}

function isDomainHostname(hostname: string): boolean {
  if (hostname.length > 253 || !hostname.includes(".")) {
    return false;
  }

  const labels = hostname.split(".");
  const topLevelLabel = labels.at(-1);
  return (
    labels.every((label) => DOMAIN_LABEL.test(label)) &&
    topLevelLabel !== undefined &&
    TOP_LEVEL_LABEL.test(topLevelLabel)
  );
}

function isPrivateOrLocalHostname(hostname: string): boolean {
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    return true;
  }

  // Literal IPv6 addresses are never a valid public business-domain input.
  // They are refused before a future fetcher could reach a loopback, link-local
  // or another non-public address form.
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    return true;
  }

  if (!IPV4_ADDRESS.test(hostname)) {
    return false;
  }

  const octets = hostname.split(".").map(Number);
  const [first, second] = octets;
  if (first === undefined || second === undefined || octets.some((octet) => octet > 255)) {
    return true;
  }

  return (
    first === 10 ||
    first === 127 ||
    first === 0 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 168) ||
    (first === 192 && second === 2) ||
    (first === 198 && (second === 18 || second === 19 || second === 51)) ||
    (first === 203 && second === 0)
  );
}

function rejected(reasonCode: DomainAdmissionReasonCode): DomainAdmission {
  return { kind: "rejected", reasonCode };
}
