import { appBaseUrl } from "./resend";

const brand = {
  forest: "#0d3d2e",
  amber: "#f0a020",
  muted: "#6b7f74",
  paper: "#f4f7f5",
  line: "#d5e0d9",
};

function layout(args: {
  title: string;
  preheader: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const cta =
    args.ctaLabel && args.ctaUrl
      ? `<p style="margin:28px 0 8px">
          <a href="${esc(args.ctaUrl)}"
             style="display:inline-block;background:${brand.amber};color:#1a1205;font-weight:700;text-decoration:none;padding:14px 22px;border-radius:10px;font-family:Arial,sans-serif">
            ${esc(args.ctaLabel)}
          </a>
        </p>
        <p style="font-size:12px;color:${brand.muted};word-break:break-all">${esc(args.ctaUrl)}</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(args.title)}</title></head>
<body style="margin:0;padding:0;background:${brand.paper};font-family:Arial,Helvetica,sans-serif;color:#0b1410">
  <div style="display:none;max-height:0;overflow:hidden">${esc(args.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.paper};padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#fff;border:1px solid ${brand.line};border-radius:16px;overflow:hidden">
        <tr><td style="background:${brand.forest};padding:20px 24px">
          <p style="margin:0;color:${brand.amber};font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Yekola</p>
          <h1 style="margin:6px 0 0;color:#fff;font-size:22px;line-height:1.25">${esc(args.title)}</h1>
        </td></tr>
        <tr><td style="padding:24px">
          ${args.bodyHtml}
          ${cta}
          <hr style="border:none;border-top:1px solid ${brand.line};margin:28px 0 16px" />
          <p style="margin:0;font-size:12px;color:${brand.muted};line-height:1.5">
            Formation professionnelle hors ligne · Mobile Money ·
            <a href="${esc(appBaseUrl())}" style="color:${brand.forest}">yekola.mcbuleli.com</a><br/>
            Envoyé via McBuleli · hi@mcbuleli.org
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function p(text: string) {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#0b1410">${text}</p>`;
}

export function verifyAccountEmail(args: { name: string; verifyUrl: string }) {
  const subject = "Confirmez votre compte Yekola";
  const html = layout({
    title: "Confirmez votre email",
    preheader: "Un clic pour activer votre compte Yekola",
    ctaLabel: "Confirmer mon compte",
    ctaUrl: args.verifyUrl,
    bodyHtml: [
      p(`Bonjour <strong>${esc(args.name)}</strong>,`),
      p(
        "Merci de vous être inscrit sur Yekola. Confirmez votre adresse email pour activer votre compte et accéder aux cours.",
      ),
      p("Ce lien expire dans <strong>24 heures</strong>."),
    ].join(""),
  });
  const text = `Bonjour ${args.name},\n\nConfirmez votre compte Yekola :\n${args.verifyUrl}\n\nLien valable 24 h.`;
  return { subject, html, text };
}

export function welcomeEmail(args: { name: string; role: string }) {
  const dest =
    args.role === "teacher"
      ? `${appBaseUrl()}/studio`
      : `${appBaseUrl()}/catalog`;
  const subject = "Bienvenue sur Yekola";
  const html = layout({
    title: "Compte confirmé",
    preheader: "Votre compte Yekola est prêt",
    ctaLabel: args.role === "teacher" ? "Ouvrir mon studio" : "Voir le catalogue",
    ctaUrl: dest,
    bodyHtml: [
      p(`Bonjour <strong>${esc(args.name)}</strong>,`),
      p(
        "Votre email est confirmé. Vous pouvez télécharger des cours hors ligne, payer en Mobile Money et suivre votre progression.",
      ),
    ].join(""),
  });
  const text = `Bonjour ${args.name},\n\nCompte confirmé. Ouvrez Yekola : ${dest}`;
  return { subject, html, text };
}

export function passwordResetEmail(args: { name: string; resetUrl: string }) {
  const subject = "Réinitialiser votre mot de passe Yekola";
  const html = layout({
    title: "Mot de passe oublié",
    preheader: "Lien pour choisir un nouveau mot de passe",
    ctaLabel: "Choisir un nouveau mot de passe",
    ctaUrl: args.resetUrl,
    bodyHtml: [
      p(`Bonjour <strong>${esc(args.name)}</strong>,`),
      p(
        "Nous avons reçu une demande de réinitialisation. Si ce n’est pas vous, ignorez cet email.",
      ),
      p("Ce lien expire dans <strong>1 heure</strong>."),
    ].join(""),
  });
  const text = `Bonjour ${args.name},\n\nRéinitialisez votre mot de passe :\n${args.resetUrl}\n\nValable 1 h.`;
  return { subject, html, text };
}

export function passwordChangedEmail(args: { name: string }) {
  const subject = "Mot de passe Yekola modifié";
  const html = layout({
    title: "Mot de passe mis à jour",
    preheader: "Votre mot de passe vient d’être changé",
    ctaLabel: "Se connecter",
    ctaUrl: `${appBaseUrl()}/auth/login`,
    bodyHtml: [
      p(`Bonjour <strong>${esc(args.name)}</strong>,`),
      p(
        "Votre mot de passe Yekola a bien été modifié. Si vous n’êtes pas à l’origine de ce changement, contactez hi@mcbuleli.org immédiatement.",
      ),
    ].join(""),
  });
  const text = `Bonjour ${args.name},\n\nVotre mot de passe Yekola a été modifié.`;
  return { subject, html, text };
}

export function purchaseConfirmEmail(args: {
  name: string;
  courseTitle: string;
  amountCdf: number;
  learnUrl: string;
}) {
  const subject = `Inscription confirmée · ${args.courseTitle}`;
  const html = layout({
    title: "Inscription confirmée",
    preheader: `Vous avez accès à ${args.courseTitle}`,
    ctaLabel: "Ouvrir le cours",
    ctaUrl: args.learnUrl,
    bodyHtml: [
      p(`Bonjour <strong>${esc(args.name)}</strong>,`),
      p(
        `Paiement reçu${args.amountCdf > 0 ? ` (${args.amountCdf.toLocaleString("fr-FR")} CDF)` : ""}. Vous pouvez suivre <strong>${esc(args.courseTitle)}</strong> hors ligne depuis votre espace apprenant.`,
      ),
    ].join(""),
  });
  const text = `Bonjour ${args.name},\n\nInscription confirmée à ${args.courseTitle}.\n${args.learnUrl}`;
  return { subject, html, text };
}
