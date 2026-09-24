/**
 * Resend client — same McBuleli stack (RESEND_API_KEY / noreply@mcbuleli.org).
 */

export function canSendViaResend(): boolean {
  if (!process.env.RESEND_API_KEY?.trim()) return false;
  if (process.env.NODE_ENV === "production") return true;
  const allow = (process.env.RESEND_ALLOW_SEND ?? "").trim().toLowerCase();
  return allow === "1" || allow === "true" || allow === "yes";
}

export function emailFromAddress(): string {
  return (
    process.env.AUTH_EMAIL_FROM?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "Yekola <noreply@mcbuleli.org>"
  );
}

export function emailReplyTo(): string {
  return (
    process.env.AUTH_EMAIL_REPLY_TO?.trim() ||
    process.env.EMAIL_REPLY_TO?.trim() ||
    "hi@mcbuleli.org"
  );
}

export function appBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "https://yekola.mcbuleli.com"
  );
}

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const from = emailFromAddress();
  const replyTo = emailReplyTo();

  if (!canSendViaResend()) {
    console.warn("[yekola-email] skipped (configure RESEND_API_KEY)", {
      to: args.to,
      subject: args.subject,
    });
    return { ok: false, error: "resend_not_configured" };
  }

  const key = process.env.RESEND_API_KEY!.trim();
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      reply_to: replyTo,
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
    cache: "no-store",
  }).catch((err) => {
    console.error("[yekola-email] network", err);
    return null;
  });

  if (!res) return { ok: false, error: "network_error" };
  const body = (await res.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };
  if (!res.ok) {
    console.error("[yekola-email] resend error", res.status, body);
    return { ok: false, error: body.message || `http_${res.status}` };
  }
  return { ok: true, id: body.id };
}
