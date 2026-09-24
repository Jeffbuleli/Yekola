import Image from "next/image";
import Link from "next/link";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="border-b border-[var(--yk-line)] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/yekola-mark.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
          <Image
            src="/brand/yekola-wordmark.png"
            alt="Yekola"
            width={140}
            height={32}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        {!compact && (
          <nav className="flex items-center gap-2 text-sm font-semibold text-[var(--yk-forest)]">
            <Link href="/demo" className="hidden sm:inline">
              Démo
            </Link>
            <Link href="/learn" className="yk-btn yk-btn-primary !py-2 !text-xs">
              Apprendre
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
