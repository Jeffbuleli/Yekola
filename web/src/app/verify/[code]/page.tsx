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

  let qrImg: string | null = null;
  if (cert) {
    try {
      const html = await buildCertificateHtml(cert);
      const m =
        html.match(/class="qr"[^>]*src="(data:image\/png;base64,[^"]+)"/) ||
        html.match(/src="(data:image\/png;base64,[^"]+)"/);
      qrImg = m?.[1] ?? null;
    } catch {
      qrImg = null;
    }
  }

  const issued = cert
    ? new Date(cert.issuedAt).toLocaleDateString("fr-CD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="mb-8 flex justify-center">
          <Image
            src="/brand/yekola-mark.png"
            alt=""
            width={64}
            height={64}
            className="h-14 w-14 object-contain"
            priority
          />
        </div>

        {!cert ? (
          <div className="yk-card text-center">
            <h1 className="font-display text-xl font-bold text-red-700">
              Brevet introuvable
            </h1>
            <p className="mt-2 text-sm text-[var(--yk-muted)]">
              Code « {code} » non reconnu.
            </p>
          </div>
        ) : (
          <article className="overflow-hidden rounded-2xl border border-[var(--yk-forest)]/15 bg-white shadow-sm">
            <div className="bg-[var(--yk-forest)] px-5 py-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--yk-amber)]">
                Brevet authentique
              </p>
              <h1 className="font-display mt-1 text-xl font-bold leading-snug">
                {cert.learnerName}
              </h1>
              <p className="mt-1 text-sm text-white/80">{cert.courseTitle}</p>
            </div>

            <div className="px-5 py-5">
              {qrImg && (
                <div className="mx-auto flex w-fit flex-col items-center">
                  <div className="relative h-40 w-40 rounded-2xl border border-[var(--yk-line)] bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrImg} alt="" className="h-full w-full" />
                    <span className="absolute left-1/2 top-1/2 flex h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-white shadow-[0_0_0_3px_#fff]">
                      <Image
                        src="/brand/yekola-mark.png"
                        alt=""
                        width={48}
                        height={48}
                        className="h-[78%] w-[78%] object-contain"
                      />
                    </span>
                  </div>
                  <p className="mt-2 text-center text-[11px] text-[var(--yk-muted)]">
                    QR de vérification
                  </p>
                </div>
              )}

              <dl className="mt-5 divide-y divide-[var(--yk-line)] text-sm">
                <div className="flex justify-between gap-3 py-2.5">
                  <dt className="text-[var(--yk-muted)]">Code</dt>
                  <dd className="font-mono text-xs font-semibold">{cert.code}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2.5">
                  <dt className="text-[var(--yk-muted)]">Académie</dt>
                  <dd className="text-right font-semibold">{cert.academyName}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2.5">
                  <dt className="text-[var(--yk-muted)]">Formateur</dt>
                  <dd className="font-semibold">{cert.teacherName}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2.5">
                  <dt className="text-[var(--yk-muted)]">Date</dt>
                  <dd className="font-semibold">{issued}</dd>
                </div>
                {typeof cert.overallQuizAverage === "number" && (
                  <div className="flex justify-between gap-3 py-2.5">
                    <dt className="text-[var(--yk-muted)]">Moyenne quiz</dt>
                    <dd className="font-semibold">{cert.overallQuizAverage}%</dd>
                  </div>
                )}
              </dl>

              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-[var(--yk-muted)]">
                Modules validés
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
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
                className="yk-btn yk-btn-primary mt-6 w-full"
                target="_blank"
                rel="noreferrer"
              >
                Ouvrir / imprimer le brevet
              </a>
            </div>
          </article>
        )}

        <p className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--yk-teal)]"
          >
            <Image
              src="/brand/yekola-mark.png"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5"
            />
            Accueil
          </Link>
        </p>
      </main>
    </div>
  );
}
