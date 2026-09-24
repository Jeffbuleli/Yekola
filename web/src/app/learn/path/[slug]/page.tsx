import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { MODULES, PATH } from "@/lib/seed/demo-data";

export default function PathPage() {
  return (
    <div className="min-h-screen bg-[var(--yk-paper)] pb-16">
      <SiteHeader compact />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-xs font-bold uppercase text-[var(--yk-amber)]">Parcours</p>
        <h1 className="font-display mt-1 text-2xl font-bold text-[var(--yk-forest)]">
          {PATH.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--yk-muted)]">{PATH.tagline}</p>
        <ol className="mt-8 space-y-3">
          {MODULES.map((m) => (
            <li key={m.id} className="yk-card flex gap-3">
              <span className="font-display text-xl font-bold text-[var(--yk-amber)]">
                {m.order}
              </span>
              <div>
                <h2 className="font-display font-bold">{m.title}</h2>
                <p className="text-sm text-[var(--yk-muted)]">{m.summary}</p>
                {m.id === "mod-3" && (
                  <Link
                    href="/learn/lesson/les-js-functions"
                    className="mt-2 inline-block text-sm font-bold text-[var(--yk-teal)]"
                  >
                    Ouvrir la leçon Functions →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
