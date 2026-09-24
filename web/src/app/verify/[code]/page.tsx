import Image from "next/image";
import Link from "next/link";
import { CERTIFICATE } from "@/lib/seed/demo-data";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const valid = code.toUpperCase() === CERTIFICATE.code.toUpperCase();

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
        <div className="yk-card">
          <p className="text-xs font-bold uppercase text-[var(--yk-amber)]">
            Vérification certificat
          </p>
          {valid ? (
            <>
              <h1 className="font-display mt-2 text-2xl font-bold text-[var(--yk-forest)]">
                Certificat authentique
              </h1>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--yk-muted)]">Code</dt>
                  <dd className="font-semibold">{CERTIFICATE.code}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--yk-muted)]">Apprenant</dt>
                  <dd className="font-semibold">{CERTIFICATE.learnerName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--yk-muted)]">Formation</dt>
                  <dd className="font-semibold text-right">{CERTIFICATE.pathTitle}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--yk-muted)]">Organisme</dt>
                  <dd className="font-semibold text-right">{CERTIFICATE.orgName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--yk-muted)]">Formateur</dt>
                  <dd className="font-semibold">{CERTIFICATE.instructorName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--yk-muted)]">Date</dt>
                  <dd className="font-semibold">{CERTIFICATE.issuedAt}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm font-semibold">Compétences</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {CERTIFICATE.skills.map((s) => (
                  <li
                    key={s}
                    className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[var(--yk-forest)]"
                  >
                    ✓ {s}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h1 className="font-display mt-2 text-2xl font-bold text-red-700">
                Certificat introuvable
              </h1>
              <p className="mt-2 text-sm text-[var(--yk-muted)]">
                Code « {code} » non reconnu. Essayez {CERTIFICATE.code}.
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
