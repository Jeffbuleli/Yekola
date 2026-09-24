import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { IconArrowRight, IconCheck } from "@/components/icons";
import { CourseHead } from "@/components/course-card";
import { getCurrentUser } from "@/lib/auth/session";
import { enrollmentFor, getCourseById } from "@/lib/db/queries";
import { getDb } from "@/lib/db/store";
import { OfflinePackButton } from "@/components/offline-pack-button";
import { LessonCompleteButton } from "@/components/lesson-complete-button";
import { MeetJoinButton } from "@/components/meet-join-button";
import { LearnerTutorPanel } from "@/components/learner-tutor-panel";

export default async function LearnCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login`);

  const course = getCourseById(courseId);
  if (!course) notFound();

  const enr = enrollmentFor(user.id, courseId);
  if (!enr) redirect(`/courses/${course.slug}`);

  const progress = getDb().progress.find(
    (p) => p.userId === user.id && p.courseId === courseId,
  );
  const cert = getDb().certificates.find(
    (c) => c.userId === user.id && c.courseId === courseId,
  );

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/learn" className="text-sm font-bold text-[var(--yk-teal)]">
          ← Mes cours
        </Link>
        <div className="mt-3">
          <CourseHead
            coverIcon={course.coverIcon}
            coverImage={course.coverImage}
            title={course.title}
            detail={`Progression ${progress?.percent ?? 0}%`}
            size={28}
            liveRequired={course.liveRequired}
          />
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--yk-line)]">
          <div
            className="h-full bg-[var(--yk-lime)]"
            style={{ width: `${progress?.percent ?? 0}%` }}
          />
        </div>

        {(course.liveSessions?.length ?? 0) > 0 && (
          <section className="mt-6 yk-card">
            <h2 className="font-display font-bold text-[var(--yk-forest)]">Calendrier live</h2>
            {course.liveRequired && (
              <p className="mt-1 text-xs font-semibold text-amber-800">
                Ce cours exige la participation aux sessions marquées obligatoires.
              </p>
            )}
            <ul className="mt-3 space-y-2 text-sm">
              {course.liveSessions.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--yk-line)] px-3 py-2"
                >
                  <div>
                    <p className="font-bold">{s.title}</p>
                    <p className="text-xs text-[var(--yk-muted)]">
                      {new Date(s.startsAt).toLocaleString("fr-CD")} · {s.durationMin} min
                      {s.required ? " · obligatoire" : ""}
                    </p>
                  </div>
                  <MeetJoinButton courseId={courseId} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {(course.liveSessions?.length ?? 0) === 0 && <MeetJoinButton courseId={courseId} />}
        </div>

        <div className="mt-6">
          <OfflinePackButton courseId={courseId} />
        </div>

        {cert ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-display font-bold text-emerald-900">Certificat obtenu</p>
            <p className="mt-1 text-sm text-emerald-800">
              Code{" "}
              <Link href={`/verify/${cert.code}`} className="font-bold underline">
                {cert.code}
              </Link>
              {" · "}
              <a
                href={`/api/verify/${cert.code}`}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                JSON
              </a>
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--yk-muted)]">
            Terminez toutes les leçons pour débloquer le certificat vérifiable.
          </p>
        )}

        <div className="mt-6">
          <LearnerTutorPanel courseTitle={course.title} learnerName={user.name} />
        </div>

        <div className="mt-8 space-y-6">
          {course.modules.map((m) => (
            <section key={m.id} className="yk-card">
              <h2 className="font-display text-lg font-bold">
                Module {m.order} - {m.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--yk-muted)]">{m.summary}</p>
              <ul className="mt-3 space-y-2">
                {m.lessons.map((l) => {
                  const done = progress?.completedLessonIds.includes(l.id);
                  return (
                    <li
                      key={l.id}
                      className="flex flex-col gap-2 rounded-lg border border-[var(--yk-line)] px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/learn/${courseId}/lesson/${l.id}`}
                          className="inline-flex items-center gap-1.5 font-semibold text-[var(--yk-forest)]"
                        >
                          {done && (
                            <IconCheck size={16} className="shrink-0 text-[var(--yk-lime)]" />
                          )}
                          {l.title}
                        </Link>
                        <p className="text-xs text-[var(--yk-muted)]">{l.minutes} min</p>
                      </div>
                      <LessonCompleteButton courseId={courseId} lessonId={l.id} />
                    </li>
                  );
                })}
              </ul>
              {m.quiz.length > 0 && (
                <Link
                  href={`/learn/${courseId}/quiz/${m.id}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[var(--yk-teal)]"
                >
                  Passer le quiz <IconArrowRight size={16} />
                </Link>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
