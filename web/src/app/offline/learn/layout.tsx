export const dynamic = "force-static";

export default function OfflineLearnLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[var(--yk-paper)]">{children}</div>;
}
