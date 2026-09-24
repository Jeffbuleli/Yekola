import Link from "next/link";
import { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-16">
      <div className="hidden lg:block">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--yk-amber)]">
          Yekola
        </p>
        <h2 className="font-display mt-2 text-3xl font-bold leading-tight text-[var(--yk-forest)]">
          Formation professionnelle, même hors ligne.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--yk-muted)]">
          Compte sécurisé, confirmation par email (Resend McBuleli), paiement Mobile Money
          et cours téléchargeables.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-[var(--yk-forest)]">
          <li>· Confirmation email obligatoire</li>
          <li>· Récupération de compte par email</li>
          <li>· Rôles apprenant / enseignant / admin</li>
        </ul>
      </div>
      <div className="yk-card mx-auto w-full max-w-md !p-6 sm:!p-8">
        <Link
          href="/"
          className="font-display text-sm font-bold text-[var(--yk-teal)] lg:hidden"
        >
          ← Yekola
        </Link>
        <h1 className="font-display mt-2 text-2xl font-bold text-[var(--yk-forest)]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-[var(--yk-muted)]">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
