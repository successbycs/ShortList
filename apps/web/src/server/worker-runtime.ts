import { env } from "cloudflare:workers";

type ShortListRuntime = Env & {
  ANTHROPIC_API_KEY?: string;
  SHORTLIST_MODEL_PROFILE?: string;
  ASSESSMENT_IP_HASH_SECRET?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  REPORT_EMAIL_FROM?: string;
  REPORT_EMAIL_REPLY_TO?: string;
};

/** Cloudflare injects these bindings for the current Worker request. */
export function getShortListWorkerRuntime(): ShortListRuntime {
  return env as ShortListRuntime;
}
