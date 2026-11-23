import nodemailer, { type Transporter } from "nodemailer";
import { topicLabel } from "@/lib/contact/schema";
import type { ContactSubmission, DeliveryStatus } from "@/lib/contact/store";

/**
 * SMTP delivery via nodemailer. Works with any provider (Gmail/Google Workspace
 * app password, Zoho, Outlook/Microsoft 365, Brevo, SendGrid, Amazon SES, Resend SMTP…).
 *
 * Required env: SMTP_HOST, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL
 * Optional env: SMTP_PORT (587), SMTP_SECURE (auto: true for 465),
 *               CONTACT_FROM_EMAIL (defaults to SMTP_USER), CONTACT_FROM_NAME,
 *               CONTACT_REPLY_TO (reply address for the visitor confirmation),
 *               CONTACT_SEND_CONFIRMATION ("false" to disable the auto-reply)
 */

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  to: string[];
  from: string;
  fromName: string;
  replyTo: string;
  sendConfirmation: boolean;
};

export function getMailConfig(): MailConfig | null {
  const env = process.env;
  const host = env.SMTP_HOST?.trim();
  const to = (env.CONTACT_TO_EMAIL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const from = (env.CONTACT_FROM_EMAIL || env.SMTP_USER || "").trim();
  if (!host || !to.length || !from) return null;

  const port = Number(env.SMTP_PORT || 587);
  return {
    host,
    port,
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === "true" : port === 465,
    user: env.SMTP_USER?.trim() || undefined,
    pass: env.SMTP_PASS || undefined,
    to,
    from,
    fromName: env.CONTACT_FROM_NAME?.trim() || "SkillPassport",
    replyTo: (env.CONTACT_REPLY_TO || to[0]).trim(),
    sendConfirmation: env.CONTACT_SEND_CONFIRMATION !== "false",
  };
}

const g = globalThis as unknown as { __spMailer?: { key: string; transporter: Transporter } };

function getTransporter(cfg: MailConfig) {
  const key = `${cfg.host}:${cfg.port}:${cfg.secure}:${cfg.user ?? ""}`;
  if (g.__spMailer?.key !== key) {
    g.__spMailer = {
      key,
      transporter: nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      }),
    };
  }
  return g.__spMailer.transporter;
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const nl2br = (v: string) => escapeHtml(v).replace(/\n/g, "<br />");

function layout(title: string, preheader: string, body: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><meta name="color-scheme" content="dark light" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#05071c;font-family:Roboto,Arial,Helvetica,sans-serif;color:#e8e6fb;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05071c;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#0b0a33;border:1px solid #2b2370;border-radius:18px;overflow:hidden;">
<tr><td style="padding:26px 32px;background:linear-gradient(135deg,#1071fa,#5224d4);background-color:#3d3ad8;">
<div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">SkillPassport</div>
<div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#dfe8ff;margin-top:4px;">Verify once. Be trusted everywhere.</div>
</td></tr>
<tr><td style="padding:30px 32px 10px;">${body}</td></tr>
<tr><td style="padding:18px 32px 28px;font-size:12px;line-height:1.6;color:#8f8bc0;border-top:1px solid #231d5e;">SkillPassport · This message was sent from the contact form on the SkillPassport website.</td></tr>
</table></td></tr></table></body></html>`;
}

function row(label: string, value: string) {
  return `<tr><td style="padding:8px 0;width:130px;vertical-align:top;font-size:13px;color:#9a96c9;">${escapeHtml(label)}</td><td style="padding:8px 0;font-size:14px;color:#ffffff;">${value}</td></tr>`;
}

function teamEmail(s: ContactSubmission) {
  const topic = topicLabel(s.topic);
  const subject = `New inquiry: ${s.subject} — ${s.name} [${s.reference}]`;
  const html = layout(
    subject,
    `${s.name} (${s.email}) · ${topic}`,
    `<h1 style="margin:0 0 6px;font-size:22px;color:#ffffff;">New contact inquiry</h1>
<p style="margin:0 0 20px;font-size:14px;color:#cfcde8;">Reference <strong style="color:#62acfa;">${escapeHtml(s.reference)}</strong> · Reply directly to this email to answer ${escapeHtml(s.name)}.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row("Name", escapeHtml(s.name))}
${row("Email", `<a href="mailto:${escapeHtml(s.email)}" style="color:#62acfa;">${escapeHtml(s.email)}</a>`)}
${s.organization ? row("Organization", escapeHtml(s.organization)) : ""}
${row("Topic", escapeHtml(topic))}
${row("Subject", escapeHtml(s.subject))}
</table>
<div style="margin:18px 0 8px;padding:18px 20px;border-radius:12px;background:#120f47;border:1px solid #2b2370;font-size:15px;line-height:1.7;color:#ffffff;">${nl2br(s.message)}</div>
<p style="margin:16px 0 0;font-size:12px;color:#8f8bc0;">Received ${escapeHtml(new Date(s.createdAt).toUTCString())} · IP ${escapeHtml(s.meta.ip)}</p>`,
  );
  const text = [
    `New contact inquiry — ${s.reference}`,
    "",
    `Name: ${s.name}`,
    `Email: ${s.email}`,
    s.organization ? `Organization: ${s.organization}` : null,
    `Topic: ${topic}`,
    `Subject: ${s.subject}`,
    "",
    s.message,
    "",
    `Received: ${s.createdAt} · IP ${s.meta.ip}`,
  ]
    .filter((l) => l !== null)
    .join("\n");
  return { subject, html, text };
}

function confirmationEmail(s: ContactSubmission) {
  const firstName = s.name.split(" ")[0];
  const subject = `We received your message — ${s.reference}`;
  const html = layout(
    subject,
    `Thanks ${firstName}, the SkillPassport team will get back to you soon.`,
    `<h1 style="margin:0 0 12px;font-size:22px;color:#ffffff;">Thanks, ${escapeHtml(firstName)} — we've got it.</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#cfcde8;">Your message reached the SkillPassport team. We usually reply within 1–2 business days. You can simply reply to this email if you want to add anything.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 10px;">
${row("Reference", `<strong style="color:#62acfa;">${escapeHtml(s.reference)}</strong>`)}
${row("Topic", escapeHtml(topicLabel(s.topic)))}
${row("Subject", escapeHtml(s.subject))}
</table>
<div style="margin:14px 0 8px;padding:16px 18px;border-radius:12px;background:#120f47;border:1px solid #2b2370;font-size:14px;line-height:1.7;color:#dcdaf3;">${nl2br(s.message)}</div>
<p style="margin:18px 0 0;font-size:13px;color:#9a96c9;">If you didn't send this, you can safely ignore this email.</p>`,
  );
  const text = `Hi ${firstName},\n\nThanks for contacting SkillPassport — we received your message and usually reply within 1–2 business days.\n\nReference: ${s.reference}\nSubject: ${s.subject}\n\n${s.message}\n\nIf you didn't send this, you can ignore this email.\n\n— The SkillPassport team`;
  return { subject, html, text };
}

/* ------------------------------------------------------------------ */
/* Delivery                                                            */
/* ------------------------------------------------------------------ */

export type DeliveryResult = { status: DeliveryStatus; detail?: string };

export async function deliverContactEmails(s: ContactSubmission): Promise<DeliveryResult> {
  const cfg = getMailConfig();
  if (!cfg) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[contact] SMTP is not configured — submission ${s.reference} was saved but no email was sent. ` +
          "Set SMTP_HOST, SMTP_USER, SMTP_PASS and CONTACT_TO_EMAIL in .env.local.",
      );
    }
    return { status: "not_configured" };
  }

  const transporter = getTransporter(cfg);
  const from = { name: cfg.fromName, address: cfg.from };
  const team = teamEmail(s);

  const jobs: Promise<unknown>[] = [
    transporter.sendMail({
      from,
      to: cfg.to,
      replyTo: { name: s.name, address: s.email },
      subject: team.subject,
      text: team.text,
      html: team.html,
      headers: { "X-SkillPassport-Reference": s.reference },
    }),
  ];
  if (cfg.sendConfirmation) {
    const conf = confirmationEmail(s);
    jobs.push(
      transporter.sendMail({
        from,
        to: { name: s.name, address: s.email },
        replyTo: cfg.replyTo,
        subject: conf.subject,
        text: conf.text,
        html: conf.html,
        headers: { "X-SkillPassport-Reference": s.reference, "Auto-Submitted": "auto-replied" },
      }),
    );
  }

  const [teamResult, confirmResult] = await Promise.allSettled(jobs);
  const err = (r?: PromiseSettledResult<unknown>) =>
    r?.status === "rejected" ? String((r.reason as Error)?.message ?? r.reason) : undefined;

  if (teamResult.status === "rejected") {
    console.error(`[contact] Team notification failed for ${s.reference}:`, err(teamResult));
    return { status: "failed", detail: err(teamResult) };
  }
  if (confirmResult?.status === "rejected") {
    console.error(`[contact] Visitor confirmation failed for ${s.reference}:`, err(confirmResult));
    return { status: "partial", detail: `confirmation: ${err(confirmResult)}` };
  }
  return { status: "sent" };
}
