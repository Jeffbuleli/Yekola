"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IconClose, IconMenu } from "@/components/icons";

type Props = {
  userName?: string | null;
  role?: "teacher" | "learner" | "admin" | null;
  /** app = logo only; AppShell owns the menu (no double hamburger) */
  variant?: "public" | "app";
};

function linksForRole(role: Props["role"]) {
  if (role === "learner") {
    return [
      { href: "/learn", label: "Mes cours" },
      { href: "/catalog", label: "Catalogue" },
      { href: "/profile", label: "Profil" },
    ];
  }
  if (role === "teacher") {
    return [
      { href: "/studio", label: "Studio" },
      { href: "/studio/wallet", label: "Portefeuille" },
      { href: "/catalog", label: "Catalogue" },
      { href: "/profile", label: "Profil" },
    ];
  }
  if (role === "admin") {
    return [
      { href: "/admin", label: "Modération" },
      { href: "/catalog", label: "Catalogue" },
      { href: "/profile", label: "Profil" },
    ];
  }
  return [
    { href: "/catalog", label: "Catalogue" },
    { href: "/pricing", label: "Tarifs enseignants" },
  ];
}

function homeForRole(role: Props["role"]) {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/studio";
  if (role === "learner") return "/learn";
  return "/auth/login";
}

export function SiteHeaderClient({
  userName,
  role,
  variant = "public",
}: Props) {
  const [open, setOpen] = useState(false);
  const links = linksForRole(role);
  const isApp = variant === "app";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--yk-line)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src="/brand/yekola-mark.png"
            alt=""
            width={40}
            height={40}
            className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            priority
          />
          <Image
            src="/brand/yekola-wordmark.png"
            alt="Yekola"
            width={140}
            height={32}
            className="hidden h-7 w-auto object-contain sm:block"
            priority
          />
          <span className="font-display text-lg font-bold text-[var(--yk-forest)] sm:hidden">
            Yekola
          </span>
        </Link>

        {!isApp && (
          <nav className="hidden items-center gap-1 text-sm font-semibold text-[var(--yk-forest)] lg:flex lg:gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-2.5 py-2 hover:bg-[var(--yk-paper)] hover:text-[var(--yk-teal)]"
              >
                {l.label}
              </Link>
            ))}
            {userName ? (
              <Link href={homeForRole(role)} className="yk-btn yk-btn-primary !py-2 !text-xs">
                {userName.split(" ")[0]}
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="yk-btn yk-btn-ghost !py-2 !text-xs">
                  Connexion
                </Link>
                <Link
                  href="/auth/register?role=teacher"
                  className="yk-btn yk-btn-primary !py-2 !text-xs"
                >
                  Créer mon académie
                </Link>
              </>
            )}
          </nav>
        )}

        {isApp && userName && (
          <Link
            href={homeForRole(role)}
            className="hidden rounded-lg bg-[var(--yk-forest)] px-3 py-2 text-xs font-bold text-white sm:inline-flex"
          >
            {userName.split(" ")[0]}
          </Link>
        )}

        {!isApp && (
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--yk-line)] text-[var(--yk-forest)] lg:hidden"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose size={20} /> : <IconMenu size={20} />}
          </button>
        )}
      </div>

      {!isApp && open && (
        <div className="border-t border-[var(--yk-line)] bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1 text-sm font-semibold text-[var(--yk-forest)]">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-3 hover:bg-[var(--yk-paper)]"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            {userName ? (
              <Link
                href={homeForRole(role)}
                className="yk-btn yk-btn-primary mt-2"
                onClick={() => setOpen(false)}
              >
                {userName.split(" ")[0]}
              </Link>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link href="/auth/login" className="yk-btn yk-btn-ghost" onClick={() => setOpen(false)}>
                  Connexion
                </Link>
                <Link
                  href="/auth/register?role=teacher"
                  className="yk-btn yk-btn-primary"
                  onClick={() => setOpen(false)}
                >
                  Créer mon académie
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
