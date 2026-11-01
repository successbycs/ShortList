import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  assessmentId: z.string().min(1).max(100),
  email: z.string().max(320),
  deliveryConsent: z.boolean(),
  marketingConsent: z.boolean(),
});

export type ReportEmailSubmissionResult =
  import("@/server/report-email").ReportEmailResult | { kind: "unavailable" };

/**
 * Browser-callable boundary for "Email me this report". It returns only an
 * outcome; the address is never echoed back or logged.
 */
export const requestReportEmail = createServerFn({ method: "POST" })
  .validator((data) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<ReportEmailSubmissionResult> => {
    const [
      { getRequestHeader, getRequestIP },
      { getShortListWorkerRuntime },
      { createIpDayHmac },
      reportEmail,
      { createSmtpSendMail },
    ] = await Promise.all([
      import("@tanstack/react-start/server"),
      import("@/server/worker-runtime"),
      import("@/server/ip-privacy"),
      import("@/server/report-email"),
      import("@/server/report-email-smtp"),
    ]);
    const runtime = getShortListWorkerRuntime();
    const ipDayHmac = await createIpDayHmac(
      getRequestHeader("CF-Connecting-IP") ?? getRequestIP({ xForwardedFor: true }) ?? "",
      runtime.ASSESSMENT_IP_HASH_SECRET,
    );
    if (
      runtime.SHORTLIST_DB === undefined ||
      ipDayHmac === undefined ||
      !runtime.SMTP_HOST ||
      !runtime.SMTP_USER ||
      !runtime.SMTP_PASS ||
      !runtime.REPORT_EMAIL_FROM
    ) {
      return { kind: "unavailable" };
    }
    try {
      return await reportEmail.requestReportEmail(data, {
        database: runtime.SHORTLIST_DB,
        ipDayHmac,
        sendMail: createSmtpSendMail({
          host: runtime.SMTP_HOST,
          port: Number(runtime.SMTP_PORT ?? "465"),
          username: runtime.SMTP_USER,
          password: runtime.SMTP_PASS,
          from: runtime.REPORT_EMAIL_FROM,
          replyTo: runtime.REPORT_EMAIL_REPLY_TO ?? runtime.SMTP_USER,
        }),
      });
    } catch {
      return { kind: "unavailable" };
    }
  });
