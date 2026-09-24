import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, ADMIN_NAV, LEARNER_NAV, TEACHER_NAV } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/store";
import { LogoutButton } from "@/components/logout-button";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const db = getDb();
  const academy = user.academyId
    ? db.academies.find((a) => a.id === user.academyId)
    : null;
  const enrollments = db.enrollments.filter((e) => e.userId === user.id).length;
  const ownedCourses = user.academyId
    ? db.courses.filter((c) => c.academyId === user.academyId).length
    : 0;

  const role = user.role;
  const nav =
    role === "teacher" ? TEACHER_NAV : role === "admin" ? ADMIN_NAV : LEARNER_NAV;
  const home =
    role === "teacher" ? "/studio" : role === "admin" ? "/admin" : "/learn";

  return (
    <AppShell
      role={role}
      userName={user.name}
      title="Mon profil"
      subtitle="Identité et raccourcis de votre espace"
      nav={nav}
      actions={
        <Link href={home} className="yk-btn yk-btn-ghost">
          Tableau de bord
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="yk-card space-y-2">
          <p className="text-xs font-bold uppercase text-[var(--yk-muted)]">Compte</p>
          <p className="font-display text-xl font-bold text-[var(--yk-forest)]">{user.name}</p>
          <p className="text-sm">{user.email}</p>
          <p className="text-sm text-[var(--yk-muted)]">
            Rôle :{" "}
            <strong>
              {role === "teacher"
                ? "Enseignant"
                : role === "admin"
                  ? "Administrateur"
                  : "Apprenant"}
            </strong>
          </p>
        </article>
        <article className="yk-card space-y-2">
          <p className="text-xs font-bold uppercase text-[var(--yk-muted)]">Activité</p>
          {role === "teacher" && (
            <>
              <p className="text-sm">
                Académie : <strong>{academy?.name ?? "—"}</strong>
              </p>
              <p className="text-sm">
                Plan : <strong>{academy?.planId ?? "—"}</strong>
              </p>
              <p className="text-sm">
                Cours : <strong>{ownedCourses}</strong>
              </p>
            </>
          )}
          {role === "learner" && (
            <p className="text-sm">
              Cours achetés : <strong>{enrollments}</strong>
            </p>
          )}
          {role === "admin" && (
            <p className="text-sm">Validation des contenus avant publication.</p>
          )}
        </article>
      </div>
      <div className="mt-6">
        <LogoutButton />
      </div>
    </AppShell>
  );
}
