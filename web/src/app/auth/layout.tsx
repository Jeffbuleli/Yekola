import { ReactNode } from "react";

/** Auth pages: no site header clutter — just the form shell. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[var(--yk-paper)]">{children}</div>;
}
