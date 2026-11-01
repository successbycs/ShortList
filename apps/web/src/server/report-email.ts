import type { D1DatabaseLike } from "./assessment-repository";
import {
  findStoredGeoAssessment,
  type StoredGeoAssessment,
  type StoredGeoFinding,
} from "./geo-assessment-repository";

/**
 * Emails a visitor their full report when they ask for it (Issue #96). The
 * request is stored with their consent choices; the address is never logged
 * or returned to the browser.
 */

export const REPORT_EMAIL_LIMITS = {
  /** Emails per report, whoever asks. */
  perReport: 3,
  /** Emails per visitor per UTC day (counted by the privacy-safe IP digest). */
  perVisitorDay: 5,
} as const;

/** Changes whenever the consent wording on the page changes. */
export const CONSENT_WORDING_VERSION = "report-email-v1";

export type ReportEmailRequest = {
  assessmentId: string;
  email: string;
  deliveryConsent: boolean;
  marketingConsent: boolean;
};

export type ReportEmailResult =
  | { kind: "sent" }
  | { kind: "send_failed" }
  | { kind: "invalid_email" }
  | { kind: "consent_required" }
  | { kind: "not_found" }
  | { kind: "limited" };

export type OutgoingEmail = { to: string; subject: string; html: string; text: string };
export type SendMail = (email: OutgoingEmail) => Promise<void>;

export type ReportEmailDependencies = {
  database: D1DatabaseLike;
  ipDayHmac: string;
  sendMail: SendMail;
  siteUrl?: string;
  now?: () => Date;
  createId?: () => string;
};

/** A plain, conservative address check; the mail server is the real test. */
export function normaliseEmail(value: string): string | undefined {
  const email = value.trim().toLowerCase();
  if (email.length > 254) return undefined;
  return /^[^\s@<>()",;:]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(
    email,
  )
    ? email
    : undefined;
}

export async function requestReportEmail(
  request: ReportEmailRequest,
  dependencies: ReportEmailDependencies,
): Promise<ReportEmailResult> {
  const email = normaliseEmail(request.email);
  if (email === undefined) return { kind: "invalid_email" };
  if (request.deliveryConsent !== true) return { kind: "consent_required" };

  const report = await findReport(dependencies.database, request.assessmentId);
  if (report === undefined) return { kind: "not_found" };

  const [forReport, forVisitor] = await Promise.all([
    countRequests(dependencies.database, "assessment_id", request.assessmentId),
    countRequests(dependencies.database, "ip_day_hmac", dependencies.ipDayHmac),
  ]);
  if (
    forReport >= REPORT_EMAIL_LIMITS.perReport ||
    forVisitor >= REPORT_EMAIL_LIMITS.perVisitorDay
  ) {
    return { kind: "limited" };
  }

  const message = renderReportEmail(
    report,
    dependencies.siteUrl ?? "https://shortlist.successbycs.com",
  );
  let outcome: "sent" | "failed" = "sent";
  try {
    await dependencies.sendMail({ to: email, ...message });
  } catch {
    // The mail server's error can echo the address, so it is not logged.
    outcome = "failed";
  }

  const now = (dependencies.now ?? (() => new Date()))();
  const result = await dependencies.database
    .prepare(
      `INSERT INTO report_email_requests (
        request_id, assessment_id, email_normalised, delivery_consent, marketing_consent,
        consent_wording_version, ip_day_hmac, requested_at_utc, outcome
      ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)`,
    )
    .bind(
      (dependencies.createId ?? (() => crypto.randomUUID()))(),
      request.assessmentId,
      email,
      request.marketingConsent ? 1 : 0,
      CONSENT_WORDING_VERSION,
      dependencies.ipDayHmac,
      now.toISOString(),
      outcome,
    )
    .run();
  if (!result.success) throw new Error("Could not store the report email request.");

  return outcome === "sent" ? { kind: "sent" } : { kind: "send_failed" };
}

/** The completed report for this exact run, or nothing. */
async function findReport(
  database: D1DatabaseLike,
  assessmentId: string,
): Promise<StoredGeoAssessment | undefined> {
  const row = await database
    .prepare(
      `SELECT customers.normalised_domain
       FROM assessment_runs
       JOIN customers ON customers.customer_id = assessment_runs.customer_id
       WHERE assessment_runs.assessment_id = ?`,
    )
    .bind(assessmentId)
    .first<{ normalised_domain: string }>();
  if (row === null) return undefined;
  const report = await findStoredGeoAssessment(database, row.normalised_domain);
  return report?.assessmentId === assessmentId ? report : undefined;
}

async function countRequests(
  database: D1DatabaseLike,
  column: "assessment_id" | "ip_day_hmac",
  value: string,
): Promise<number> {
  const row = await database
    .prepare(`SELECT count(*) AS requests FROM report_email_requests WHERE ${column} = ?`)
    .bind(value)
    .first<{ requests: number }>();
  return row?.requests ?? 0;
}

const MENTION: Record<StoredGeoFinding["submittedBusinessMention"], string> = {
  mentioned: "Mentioned you",
  absent: "Didn't mention you",
  uncertain: "Unclear whether it mentioned you",
  contradicted: "Contradicted your website",
};
const ACCURACY: Partial<Record<StoredGeoFinding["descriptionAccuracy"], string>> = {
  accurate: "Described you accurately",
  partial: "Partly accurate",
  inaccurate: "Described you inaccurately",
};
const RECOMMENDATION: Partial<Record<StoredGeoFinding["recommendationFit"], string>> = {
  appropriate: "Recommended you",
  not_appropriate: "Didn't recommend you",
  uncertain: "Recommendation unclear",
};

export function renderReportEmail(
  report: StoredGeoAssessment,
  siteUrl: string,
): { subject: string; html: string; text: string } {
  const name = report.profile.businessName?.value ?? report.normalisedDomain;
  const live = report.findings.current_web;
  const memory = new Map(report.findings.model_knowledge.map((f) => [f.questionId, f]));
  const mentioned = live.filter((f) => f.submittedBusinessMention === "mentioned").length;
  const recommended = live.filter((f) => f.recommendationFit === "appropriate").length;
  const gaps = [...new Set(live.flatMap((f) => f.websiteContentGaps))].slice(0, 6);
  const sources = [
    ...new Map(live.flatMap((f) => f.sources).map((s) => [s.url, s])).values(),
  ].slice(0, 8);
  const list = (label: string, items: readonly { value: string }[]) =>
    items.length ? { label, items: items.map((i) => i.value) } : undefined;
  const overview = [
    list("What you offer", report.profile.services),
    list("Where you work", report.profile.serviceAreas),
    list("What sets you apart", report.profile.valuePropositions),
    list("Proof you show", report.profile.proofPoints),
  ].filter((section) => section !== undefined);

  const subject = `Your ShortList report for ${report.normalisedDomain}`;
  const summary = `When we asked AI nine questions your buyers might ask, it mentioned you in ${mentioned} and recommended you in ${recommended}.`;

  const html = [
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2a24;max-width:640px;margin:0 auto;line-height:1.5">`,
    `<p style="color:#1e6b45;font-weight:bold;margin:0">ShortList website assessment</p>`,
    `<h1 style="font-family:Georgia,serif;font-size:26px;margin:4px 0 8px">How AI answers your buyers: ${esc(name)}</h1>`,
    `<p style="margin:0 0 16px">${esc(report.normalisedDomain)} · checked ${esc(formatDate(report.triggeredAtUtc))}</p>`,
    `<p style="background:#e7f2ec;padding:12px 14px;border-radius:8px">${esc(summary)}</p>`,
    `<h2 style="font-family:Georgia,serif;font-size:20px;margin:24px 0 8px">What your website says about you</h2>`,
    ...overview.map(
      (section) =>
        `<p style="margin:8px 0 2px"><strong>${esc(section.label)}</strong></p><ul style="margin:0;padding-left:20px">${section.items
          .map((item) => `<li>${esc(item)}</li>`)
          .join("")}</ul>`,
    ),
    ...report.icps.map((icp) => {
      const questions = live.filter((f) => f.icpId === icp.id);
      return [
        `<h2 style="font-family:Georgia,serif;font-size:20px;margin:28px 0 4px">${esc(icp.label)}</h2>`,
        `<p style="margin:0 0 8px;color:#56635b">${esc(icp.audienceDescription)}</p>`,
        ...questions.map((finding, index) => {
          const labels = [
            MENTION[finding.submittedBusinessMention],
            ACCURACY[finding.descriptionAccuracy],
            RECOMMENDATION[finding.recommendationFit],
          ].filter(Boolean);
          const fromMemory = memory.get(finding.questionId)?.answerSummary;
          return [
            `<div style="border-top:1px solid #d9dfd9;padding:10px 0">`,
            `<p style="margin:0"><strong>${index + 1}. ${esc(finding.questionText)}</strong></p>`,
            `<p style="margin:4px 0;font-size:13px;color:#1e6b45">${esc(labels.join(" · "))}</p>`,
            `<p style="margin:4px 0"><em>On the live web:</em> ${esc(finding.answerSummary ?? "No answer recorded.")}</p>`,
            fromMemory
              ? `<p style="margin:4px 0;color:#56635b"><em>From AI's own memory:</em> ${esc(fromMemory)}</p>`
              : "",
            `</div>`,
          ].join("");
        }),
      ].join("");
    }),
    gaps.length
      ? `<h2 style="font-family:Georgia,serif;font-size:20px;margin:28px 0 8px">What your website could say more clearly</h2><ul style="padding-left:20px">${gaps
          .map((gap) => `<li>${esc(gap)}</li>`)
          .join("")}</ul>`
      : "",
    sources.length
      ? `<p style="margin:20px 0 4px"><strong>Web pages the search used</strong></p><ul style="padding-left:20px;font-size:13px">${sources
          .map((source) => `<li>${esc(source.title)} (${esc(source.url)})</li>`)
          .join("")}</ul>`
      : "",
    `<p style="margin:28px 0 8px;font-size:13px;color:#56635b">These findings are AI's answers on the day we checked, not a ranking or a guarantee. Questions about your report? Just reply to this email.</p>`,
    `<p style="font-size:12px;color:#56635b">You asked ShortList to email you this report. We keep your email address until you ask us to delete it: reply to this email to ask. <a href="${esc(siteUrl)}" style="color:#1e6b45">ShortList by SuccessByCS</a></p>`,
    `</div>`,
  ].join("");

  const text = [
    `How AI answers your buyers: ${name}`,
    `${report.normalisedDomain}, checked ${formatDate(report.triggeredAtUtc)}`,
    "",
    summary,
    "",
    "WHAT YOUR WEBSITE SAYS ABOUT YOU",
    ...overview.flatMap((section) => [section.label, ...section.items.map((item) => `- ${item}`)]),
    ...report.icps.flatMap((icp) => [
      "",
      icp.label.toUpperCase(),
      icp.audienceDescription,
      ...live
        .filter((f) => f.icpId === icp.id)
        .flatMap((finding, index) => [
          `${index + 1}. ${finding.questionText}`,
          `   ${[MENTION[finding.submittedBusinessMention], ACCURACY[finding.descriptionAccuracy], RECOMMENDATION[finding.recommendationFit]].filter(Boolean).join(" · ")}`,
          `   On the live web: ${finding.answerSummary ?? "No answer recorded."}`,
        ]),
    ]),
    ...(gaps.length
      ? ["", "WHAT YOUR WEBSITE COULD SAY MORE CLEARLY", ...gaps.map((gap) => `- ${gap}`)]
      : []),
    "",
    "These findings are AI's answers on the day we checked, not a ranking or a guarantee.",
    "You asked ShortList to email you this report. We keep your email address until you ask us to delete it: reply to this email to ask.",
    siteUrl,
  ].join("\n");

  return { subject, html, text };
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Pacific/Auckland",
  }).format(new Date(value));
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
