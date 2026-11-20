import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import type { Certificate } from "@/lib/types";
import { appBaseUrl } from "@/lib/email/resend";

export async function certificateVerifyUrl(code: string) {
  return `${appBaseUrl()}/verify/${encodeURIComponent(code)}`;
}

function readLogoDataUrl(): string | null {
  const candidates = [
    path.join(process.cwd(), "public/brand/yekola-mark.png"),
    path.join(process.cwd(), "brand/yekola-mark.png"),
    path.join(__dirname, "../../../public/brand/yekola-mark.png"),
  ];
  for (const file of candidates) {
    try {
      if (fs.existsSync(file)) {
        const b64 = fs.readFileSync(file).toString("base64");
        return `data:image/png;base64,${b64}`;
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function buildCertificateHtml(cert: Certificate): Promise<string> {
  const verifyUrl = await certificateVerifyUrl(cert.code);
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "H",
    width: 280,
    margin: 1,
    color: { dark: "#0d3d2e", light: "#ffffff" },
  });
  const logo = readLogoDataUrl();
  const average =
    typeof cert.overallQuizAverage === "number"
      ? `${cert.overallQuizAverage}%`
      : "—";
  const skills = cert.skills
    .map(
      (s) =>
        `<li>${esc(s)}</li>`,
    )
    .join("");
  const issued = new Date(cert.issuedAt).toLocaleDateString("fr-CD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const logoImg = logo
    ? `<img class="mark" src="${logo}" alt=""/>`
    : "";

  const qrBlock = logo
    ? `<div class="qr-wrap">
        <img class="qr" src="${qrDataUrl}" alt="QR"/>
        <span class="qr-logo"><img src="${logo}" alt=""/></span>
      </div>`
    : `<div class="qr-wrap"><img class="qr" src="${qrDataUrl}" alt="QR"/></div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Brevet — ${esc(cert.code)}</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 20px;
    font-family: "Sora", "Manrope", system-ui, sans-serif;
    background: linear-gradient(160deg, #e8f2ec 0%, #f7faf8 45%, #fff8ec 100%);
    color: #0b1410;
  }
  .actions { max-width: 1040px; margin: 0 auto 14px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .actions button, .actions a {
    appearance: none; border: 0; cursor: pointer; text-decoration: none;
    background: #f0a020; color: #1a1205; font-weight: 800; padding: 11px 16px; border-radius: 10px; font-size: 13px;
  }
  .actions a.secondary { background: #0d3d2e; color: #fff; }
  .sheet {
    max-width: 1040px; margin: 0 auto;
    background: #fff;
    border: 1.5px solid #0d3d2e;
    border-radius: 20px;
    padding: 28px 32px 24px;
    position: relative;
    box-shadow: 0 18px 50px rgba(13,61,46,.08);
  }
  .sheet::before {
    content: ""; position: absolute; inset: 8px;
    border: 1px solid #cfe0d6; border-radius: 14px; pointer-events: none;
  }
  .row { display: grid; grid-template-columns: 1fr 200px; gap: 28px; align-items: start; position: relative; }
  .mark { width: 52px; height: 52px; object-fit: contain; display: block; }
  .eyebrow { margin-top: 10px; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #f0a020; }
  h1 { margin: 6px 0 0; font-size: 30px; color: #0d3d2e; line-height: 1.15; }
  .learner { margin: 22px 0 0; font-size: 26px; font-weight: 800; }
  .course { margin: 4px 0 0; font-size: 16px; color: #145c45; font-weight: 700; }
  .meta {
    margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px;
    padding: 14px 16px; border-radius: 12px; background: #f4f8f5; font-size: 13px;
  }
  .meta dt { color: #6b7f74; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
  .meta dd { margin: 2px 0 0; font-weight: 700; }
  .skills { margin-top: 16px; }
  .skills h2 { margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #6b7f74; }
  .skills ul { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-wrap: wrap; gap: 6px; }
  .skills li {
    padding: 6px 11px; border-radius: 999px; background: #e8f5ee; color: #0d3d2e;
    font-size: 12px; font-weight: 700;
  }
  .side { text-align: center; }
  .qr-wrap {
    position: relative; width: 168px; height: 168px; margin: 0 auto;
    border: 1px solid #d5e0d9; border-radius: 16px; padding: 10px; background: #fff;
  }
  .qr-wrap .qr { width: 100%; height: 100%; display: block; }
  .qr-logo {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: 36%; height: 36%; border-radius: 10px; background: #fff;
    display: grid; place-items: center; box-shadow: 0 0 0 3px #fff;
  }
  .qr-logo img { width: 78%; height: 78%; object-fit: contain; }
  .side .hint { margin: 10px 0 0; font-size: 11px; color: #6b7f74; line-height: 1.35; }
  .code {
    margin-top: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px; font-weight: 700; color: #0d3d2e; word-break: break-all;
  }
  .footer {
    margin-top: 20px; padding-top: 14px; border-top: 1px solid #d5e0d9;
    display: flex; justify-content: space-between; gap: 12px; font-size: 11px; color: #6b7f74;
  }
  @media (max-width: 720px) {
    .row { grid-template-columns: 1fr; }
    .side { order: -1; }
  }
  @media print {
    body { background: #fff; padding: 0; }
    .actions { display: none !important; }
    .sheet { box-shadow: none; border-radius: 0; max-width: none; }
  }
</style>
</head>
<body>
  <div class="actions">
    <button type="button" onclick="window.print()">Imprimer / PDF</button>
    <a class="secondary" href="${esc(verifyUrl)}" target="_blank" rel="noreferrer">Vérifier en ligne</a>
  </div>
  <article class="sheet">
    <div class="row">
      <div>
        ${logoImg}
        <p class="eyebrow">Brevet de compétence</p>
        <h1>Certificat de réussite</h1>
        <p class="learner">${esc(cert.learnerName)}</p>
        <p class="course">a validé « ${esc(cert.courseTitle)} »</p>
        <dl class="meta">
          <div><dt>Académie</dt><dd>${esc(cert.academyName)}</dd></div>
          <div><dt>Formateur</dt><dd>${esc(cert.teacherName)}</dd></div>
          <div><dt>Date</dt><dd>${esc(issued)}</dd></div>
          <div><dt>Moyenne quiz</dt><dd>${esc(average)} · seuil ≥ 70 %</dd></div>
        </dl>
        <div class="skills">
          <h2>Modules validés</h2>
          <ul>${skills}</ul>
        </div>
      </div>
      <aside class="side">
        ${qrBlock}
        <p class="hint">Scannez pour vérifier l’authenticité</p>
        <p class="code">${esc(cert.code)}</p>
      </aside>
    </div>
    <div class="footer">
      <div>${esc(verifyUrl)}</div>
      <div style="text-align:right">Document vérifiable · code unique</div>
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
