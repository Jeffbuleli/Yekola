import { SiteHeader } from "@/components/site-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      {children}
    </div>
  );
}
