import QRCode from "qrcode";
import type { Certificate } from "@/lib/types";
import { appBaseUrl } from "@/lib/email/resend";

export async function certificateVerifyUrl(code: string) {
  return `${appBaseUrl()}/verify/${encodeURIComponent(code)}`;
}

export async function buildCertificateHtml(cert: Certificate): Promise<string> {
  const verifyUrl = await certificateVerifyUrl(cert.code);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 220,
    margin: 1,
    color: { dark: "#0d3d2e", light: "#ffffff" },
  });
  const average =
    typeof cert.overallQuizAverage === "number"
      ? `${cert.overallQuizAverage}%`
      : "—";
  const skills = cert.skills
    .map(
      (s) =>
        `<li style="display:inline-block;margin:0 6px 6px 0;padding:6px 12px;border-radius:999px;background:#e8f5ee;color:#0d3d2e;font-size:12px;font-weight:700">${esc(s)}</li>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Brevet Yekola — ${esc(cert.code)}</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 24px;
    font-family: "Sora", "Manrope", system-ui, sans-serif;
    background: #f4f7f5; color: #0b1410;
  }
  .sheet {
    max-width: 1100px; margin: 0 auto;
    background: #fff;
    border: 2px solid #0d3d2e;
    border-radius: 18px;
    padding: 36px 40px;
    position: relative;
    overflow: hidden;
  }
  .sheet::before {
    content: "";
    position: absolute; inset: 10px;
    border: 1px solid #d5e0d9; border-radius: 12px; pointer-events: none;
  }
  .top { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; }
  .brand { color: #f0a020; font-size: 11px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
  h1 { margin: 8px 0 0; font-size: 34px; color: #0d3d2e; line-height: 1.15; }
  .subtitle { margin-top: 8px; color: #6b7f74; font-size: 14px; }
  .learner { margin-top: 28px; font-size: 28px; font-weight: 800; color: #0b1410; }
  .course { margin-top: 6px; font-size: 18px; color: #145c45; font-weight: 700; }
  .meta { margin-top: 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; font-size: 13px; }
  .meta dt { color: #6b7f74; } .meta dd { margin: 2px 0 0; font-weight: 700; }
  .skills { margin-top: 22px; } .skills h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #6b7f74; }
  .skills ul { list-style: none; padding: 0; margin: 10px 0 0; }
  .qr-box { text-align: center; min-width: 180px; }
  .qr-box img { width: 150px; height: 150px; border: 1px solid #d5e0d9; border-radius: 12px; padding: 8px; background: #fff; }
  .qr-box p { margin: 8px 0 0; font-size: 11px; color: #6b7f74; max-width: 180px; word-break: break-all; }
  .footer { margin-top: 28px; display: flex; justify-content: space-between; gap: 16px; align-items: end; font-size: 12px; color: #6b7f74; border-top: 1px solid #d5e0d9; padding-top: 16px; }
  .actions { margin: 16px auto 0; max-width: 1100px; display: flex; gap: 10px; justify-content: center; }
  .actions button, .actions a {
    appearance: none; border: 0; cursor: pointer; text-decoration: none;
    background: #f0a020; color: #1a1205; font-weight: 800; padding: 12px 18px; border-radius: 10px; font-size: 14px;
  }
  .actions a.secondary { background: #0d3d2e; color: #fff; }
  @media print {
    body { background: #fff; padding: 0; }
    .actions { display: none !important; }
    .sheet { border-radius: 0; max-width: none; }
  }
</style>
</head>
<body>
  <div class="actions">
    <button type="button" onclick="window.print()">Imprimer / PDF</button>
    <a class="secondary" href="${esc(verifyUrl)}" target="_blank" rel="noreferrer">Vérifier en ligne</a>
  </div>
  <article class="sheet">
    <div class="top">
      <div>
        <div class="brand">Yekola · Brevet de compétence</div>
        <h1>Certificat de réussite</h1>
        <p class="subtitle">Formation professionnelle vérifiable · Mobile Money · Hors ligne</p>
        <p class="learner">${esc(cert.learnerName)}</p>
        <p class="course">a validé le parcours « ${esc(cert.courseTitle)} »</p>
        <dl class="meta">
          <div><dt>Académie</dt><dd>${esc(cert.academyName)}</dd></div>
          <div><dt>Formateur</dt><dd>${esc(cert.teacherName)}</dd></div>
          <div><dt>Date d’émission</dt><dd>${esc(cert.issuedAt)}</dd></div>
          <div><dt>Moyenne quiz</dt><dd>${esc(average)} (seuil ≥ 70 % par module)</dd></div>
          <div><dt>Code d’authenticité</dt><dd style="font-family:ui-monospace,monospace">${esc(cert.code)}</dd></div>
        </dl>
        <div class="skills">
          <h2>Compétences / modules</h2>
          <ul>${skills}</ul>
        </div>
      </div>
      <div class="qr-box">
        <img src="${qrDataUrl}" alt="QR de vérification"/>
        <p>Scannez pour vérifier l’authenticité auprès de l’employeur</p>
      </div>
    </div>
    <div class="footer">
      <div>
        Document émis par Yekola (McBuleli)<br/>
        ${esc(verifyUrl)}
      </div>
      <div style="text-align:right">
        Toute falsification est détectable via le QR / code unique.
      </div>
    </div>
  </article>
</body>
</html>`;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
