import { redirect } from "next/navigation";
import { AppShell, TEACHER_NAV } from "@/components/app-shell";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/store";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role === "admin") redirect("/admin");
  if (user.role !== "teacher" || !user.academyId) redirect("/learn");

  const academy = getDb().academies.find((a) => a.id === user.academyId);

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader variant="app" />
      <AppShell
        role="teacher"
        userName={user.name}
        title={academy?.name ?? "Studio"}
        subtitle="Cours, ventes, portefeuille et abonnement"
        nav={TEACHER_NAV}
      >
        {children}
      </AppShell>
    </div>
  );
}
