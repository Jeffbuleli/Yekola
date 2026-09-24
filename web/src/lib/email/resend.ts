/**
 * Resend — McBuleli key. Robust env parsing (quotes / accidental inline comments).
 */

function envVal(key: string): string {
  let v = process.env[key]?.trim() ?? "";
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  // Accidental: value="true   # comment"
  const hash = v.search(/\s+#/);
  if (hash > 0) v = v.slice(0, hash).trim();
  return v;
}

export function canSendViaResend(): boolean {
  if (!envVal("RESEND_API_KEY")) return false;
  if (process.env.NODE_ENV === "production") return true;
  const allow = envVal("RESEND_ALLOW_SEND").toLowerCase();
  return allow === "1" || allow === "true" || allow === "yes";
}

export function emailFromAddress(): string {
  return (
    envVal("AUTH_EMAIL_FROM") ||
    envVal("EMAIL_FROM") ||
    "Yekola <noreply@mcbuleli.org>"
  );
}

export function emailReplyTo(): string {
  return (
    envVal("AUTH_EMAIL_REPLY_TO") ||
    envVal("EMAIL_REPLY_TO") ||
    "hi@mcbuleli.org"
  );
}

export function appBaseUrl(): string {
  return (
    envVal("NEXT_PUBLIC_APP_URL").replace(/\/$/, "") ||
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
    console.warn("[yekola-email] skipped", {
      to: args.to,
      subject: args.subject,
      reason: "not_configured",
    });
    return { ok: false, error: "resend_not_configured" };
  }

  const key = envVal("RESEND_API_KEY");
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
    name?: string;
  };
  if (!res.ok) {
    console.error("[yekola-email] resend error", res.status, body);
    return {
      ok: false,
      error: body.message || body.name || `http_${res.status}`,
    };
  }
  return { ok: true, id: body.id };
}
