import { env } from "cloudflare:workers";

type ShortListRuntime = Env & {
  OPENAI_API_KEY?: string;
  TURNSTILE_SECRET?: string;
  ASSESSMENT_IP_HASH_SECRET?: string;
};

/** Cloudflare injects these bindings for the current Worker request. */
export function getShortListWorkerRuntime(): ShortListRuntime {
  return env as ShortListRuntime;
}
