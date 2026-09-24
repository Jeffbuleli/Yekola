import Image from "next/image";
import Link from "next/link";
import { getDb } from "@/lib/db/store";
import { IconCheck } from "@/components/icons";
import { buildCertificateHtml } from "@/lib/progress/certificate-html";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const db = getDb();
  const cert = db.certificates.find(
    (c) => c.code.toUpperCase() === code.toUpperCase(),
  );

  // Optional: embed QR preview via same builder fragment — download page has full print layout
  let qrImg: string | null = null;
  if (cert) {
    try {
      const html = await buildCertificateHtml(cert);
      const m = html.match(/src="(data:image\/png;base64,[^"]+)"/);
      qrImg = m?.[1] ?? null;
    } catch {
      qrImg = null;
    }
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <main className="mx-auto max-w-lg px-4 py-12">
        <div className="mb-6 flex justify-center">
          <Image
            src="/brand/yekola-wordmark.png"
            alt="Yekola"
            width={180}
            height={40}
            className="h-9 w-auto"
          />
        </div>
        <div className="yk-card border-2 border-[var(--yk-forest)]/20 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--yk-amber)]">
            Vérification employeur
          </p>
          {cert ? (
            <>
              <h1 className="font-display mt-2 text-2xl font-bold text-[var(--yk-forest)]">
                Brevet authentique
              </h1>
              <p className="mt-3 text-lg font-semibold text-[var(--yk-ink)]">
                {cert.learnerName}
              </p>
              <p className="text-sm text-[var(--yk-muted)]">
                a validé <strong>{cert.courseTitle}</strong>
              </p>
              {qrImg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrImg}
                  alt="QR vérification"
                  className="mx-auto mt-4 h-36 w-36 rounded-xl border border-[var(--yk-line)] bg-white p-2"
                />
              )}
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--yk-muted)]">Code</dt>
                  <dd className="font-mono font-semibold">{cert.code}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--yk-muted)]">Académie</dt>
                  <dd className="text-right font-semibold">{cert.academyName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--yk-muted)]">Formateur</dt>
                  <dd className="font-semibold">{cert.teacherName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--yk-muted)]">Date</dt>
                  <dd className="font-semibold">{cert.issuedAt}</dd>
                </div>
                {typeof cert.overallQuizAverage === "number" && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[var(--yk-muted)]">Moyenne quiz</dt>
                    <dd className="font-semibold">{cert.overallQuizAverage}%</dd>
                  </div>
                )}
              </dl>
              <p className="mt-4 text-sm font-semibold">Modules validés</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {cert.skills.map((s) => (
                  <li
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[var(--yk-forest)]"
                  >
                    <IconCheck size={12} className="text-[var(--yk-lime)]" />
                    {s}
                  </li>
                ))}
              </ul>
              <a
                href={`/api/certificates/${encodeURIComponent(cert.code)}`}
                className="yk-btn yk-btn-primary mt-5 w-full"
                target="_blank"
                rel="noreferrer"
              >
                Ouvrir le brevet (PDF / impression)
              </a>
            </>
          ) : (
            <>
              <h1 className="font-display mt-2 text-2xl font-bold text-red-700">
                Certificat introuvable
              </h1>
              <p className="mt-2 text-sm text-[var(--yk-muted)]">
                Code « {code} » non reconnu.
              </p>
            </>
          )}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="font-bold text-[var(--yk-teal)]">
            yekola.mcbuleli.com
          </Link>
        </p>
      </main>
    </div>
  );
}
