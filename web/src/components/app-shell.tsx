"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import {
  IconAcademy,
  IconBook,
  IconClose,
  IconMenu,
  IconSell,
  IconWallet,
} from "@/components/icons";

type NavItem = { href: string; label: string; icon?: "book" | "wallet" | "sell" | "academy" };

const ICONS = {
  book: IconBook,
  wallet: IconWallet,
  sell: IconSell,
  academy: IconAcademy,
};

export function AppShell({
  role,
  userName,
  title,
  subtitle,
  nav,
  children,
  actions,
}: {
  role: "teacher" | "learner" | "admin";
  userName: string;
  title: string;
  subtitle?: string;
  nav: NavItem[];
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const roleLabel =
    role === "teacher" ? "Enseignant" : role === "admin" ? "Admin" : "Apprenant";

  return (
    <div className="yk-shell grid gap-6 py-6 lg:grid-cols-[220px_1fr] lg:py-8">
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <div className="yk-card !p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--yk-amber)]">
              {roleLabel}
            </p>
            <p className="font-display mt-1 font-bold text-[var(--yk-forest)]">{userName}</p>
            <Link
              href="/profile"
              className="mt-2 inline-block text-xs font-bold text-[var(--yk-teal)]"
            >
              Mon profil
            </Link>
          </div>
          <nav className="yk-card !space-y-1 !p-2">
            {nav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon ? ICONS[item.icon] : IconBook;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[var(--yk-forest)] text-white"
                      : "text-[var(--yk-forest)] hover:bg-[var(--yk-paper)]"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-[var(--yk-line)] px-2 pt-2">
              <LogoutButton />
            </div>
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-4 flex items-start justify-between gap-3 lg:hidden">
          <div>
            <p className="text-[10px] font-bold uppercase text-[var(--yk-amber)]">{roleLabel}</p>
            <h1 className="font-display text-xl font-bold text-[var(--yk-forest)]">{title}</h1>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--yk-line)]"
            aria-label="Menu espace"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
        </div>

        {open && (
          <nav className="yk-card mb-4 space-y-1 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/profile"
              className="block px-3 py-2 text-sm font-bold text-[var(--yk-teal)]"
            >
              Mon profil
            </Link>
            <LogoutButton />
          </nav>
        )}

        <div className="mb-6 hidden items-end justify-between gap-4 lg:flex">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)] sm:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 max-w-2xl text-sm text-[var(--yk-muted)]">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>

        {actions && <div className="mb-4 flex flex-wrap gap-2 lg:hidden">{actions}</div>}

        {children}
      </div>
    </div>
  );
}

export const TEACHER_NAV: NavItem[] = [
  { href: "/studio", label: "Tableau de bord", icon: "academy" },
  { href: "/studio/courses/new", label: "Nouveau cours", icon: "book" },
  { href: "/studio/analytics", label: "Statistiques", icon: "sell" },
  { href: "/studio/wallet", label: "Portefeuille", icon: "wallet" },
  { href: "/studio/billing", label: "Abonnement", icon: "wallet" },
  { href: "/studio/ai", label: "Assistant IA", icon: "book" },
  { href: "/catalog", label: "Catalogue", icon: "book" },
];

export const LEARNER_NAV: NavItem[] = [
  { href: "/learn", label: "Mes cours", icon: "book" },
  { href: "/catalog", label: "Catalogue", icon: "sell" },
  { href: "/profile", label: "Profil", icon: "academy" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Modération", icon: "academy" },
  { href: "/catalog", label: "Catalogue", icon: "book" },
  { href: "/profile", label: "Profil", icon: "academy" },
];
