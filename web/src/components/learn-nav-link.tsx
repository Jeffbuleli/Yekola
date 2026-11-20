"use client";

import Link from "next/link";
import type { ReactNode, MouseEvent } from "react";
import { isOfflineMode } from "@/lib/sync/sync-manager";

/** En hors ligne : ouvre la coquille /offline/learn. En ligne : Link Next. */
export function LearnNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!isOfflineMode()) return;
    e.preventDefault();
    window.location.assign(`/offline/learn?u=${encodeURIComponent(href)}`);
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
