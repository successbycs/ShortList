import { env } from "cloudflare:workers";

type ShortListRuntime = Env & {
  ANTHROPIC_API_KEY?: string;
  SHORTLIST_MODEL_PROFILE?: string;
  ASSESSMENT_IP_HASH_SECRET?: string;
};

/** Cloudflare injects these bindings for the current Worker request. */
export function getShortListWorkerRuntime(): ShortListRuntime {
  return env as ShortListRuntime;
}
