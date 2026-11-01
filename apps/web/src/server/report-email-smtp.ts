import type { SendMail } from "./report-email";

export type SmtpConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  /** For example "ShortList by SuccessByCS <reports@successbycs.com>". */
  from: string;
  replyTo: string;
};

/**
 * Sends through an SMTP server (Gmail for MVP 1) over Cloudflare sockets.
 * Logging is switched off so no address or server reply reaches the logs.
 * The library is loaded only when an email is sent, because
 * `cloudflare:sockets` exists only in the Worker runtime.
 */
export function createSmtpSendMail(config: SmtpConfig): SendMail {
  return async (email) => {
    const { WorkerMailer, LogLevel } = await import("worker-mailer");
    const mailer = await WorkerMailer.connect({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      startTls: config.port !== 465,
      credentials: { username: config.username, password: config.password },
      authType: "plain",
      logLevel: LogLevel.NONE,
      socketTimeoutMs: 15_000,
      responseTimeoutMs: 15_000,
    });
    try {
      await mailer.send({
        from: parseAddress(config.from),
        reply: config.replyTo,
        to: email.to,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
    } finally {
      await mailer.close().catch(() => undefined);
    }
  };
}

/** "Name <address>" or a bare address. */
export function parseAddress(value: string): { name?: string; email: string } {
  const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(value);
  if (match === null) return { email: value.trim() };
  return match[1] ? { name: match[1], email: match[2]! } : { email: match[2]! };
}
