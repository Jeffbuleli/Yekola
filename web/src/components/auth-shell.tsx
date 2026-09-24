import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

/** Auth UI minimal — logo, nom, carte, champs (style mcbuleli.com/login). */
export function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col bg-[var(--yk-paper)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-8 pt-8 sm:px-6">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Link href="/" className="flex flex-col items-center gap-2">
            <Image
              src="/brand/yekola-mark.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 object-contain"
              priority
            />
            <span className="font-display text-base font-bold tracking-tight text-[var(--yk-forest)]">
              Yekola
            </span>
          </Link>
          <h1 className="font-display text-center text-xl font-bold text-[var(--yk-forest)]">
            {title}
          </h1>
        </div>

        <div className="rounded-2xl border border-[var(--yk-line)] bg-white p-5 shadow-sm sm:p-6">
          {children}
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-[var(--yk-muted)]">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

export const authInputClass =
  "mt-1.5 w-full rounded-xl border border-[var(--yk-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--yk-teal)]";

export const authLabelClass =
  "block text-sm font-semibold text-[var(--yk-forest)]";
