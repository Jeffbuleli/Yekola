import Image from "next/image";
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
import {
  evaluateProgress,
  QUIZ_PASS_THRESHOLD,
  quizModuleIds,
} from "@/lib/progress/certify";

export const dynamic = "force-dynamic";

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
  const evald = progress
    ? evaluateProgress(course, progress)
    : evaluateProgress(course, { completedLessonIds: [], quizScores: {} });
  const qIds = quizModuleIds(course);

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
            detail={`Progression ${evald.percent}% · leçons ${evald.lessonDone}/${evald.lessonTotal} · quiz ${evald.quizPassed}/${evald.quizTotal}`}
            size={28}
            liveRequired={course.liveRequired}
          />
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--yk-line)]">
          <div
            className="h-full bg-[var(--yk-lime)] transition-all"
            style={{ width: `${evald.percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--yk-muted)]">
          Brevet : toutes les leçons + chaque quiz ≥ {QUIZ_PASS_THRESHOLD}%. Sync auto
          online/offline.
        </p>

        {(course.liveSessions?.length ?? 0) > 0 && (
          <section className="yk-card mt-6">
            <h2 className="font-display font-bold text-[var(--yk-forest)]">
              Calendrier live
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {course.liveSessions.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--yk-line)] px-3 py-2"
                >
                  <div>
                    <p className="font-bold">{s.title}</p>
                    <p className="text-xs text-[var(--yk-muted)]">
                      {new Date(s.startsAt).toLocaleString("fr-CD")} · {s.durationMin}{" "}
                      min
                      {s.required ? " · obligatoire" : ""}
                    </p>
                  </div>
                  <MeetJoinButton courseId={courseId} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-6">
          <OfflinePackButton courseId={courseId} />
        </div>

        {cert ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-display font-bold text-emerald-900">Brevet obtenu</p>
            <p className="mt-1 text-sm text-emerald-800">
              Code{" "}
              <Link href={`/verify/${cert.code}`} className="font-bold underline">
                {cert.code}
              </Link>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`/api/certificates/${encodeURIComponent(cert.code)}`}
                className="yk-btn yk-btn-primary !py-2 !text-sm"
                target="_blank"
                rel="noreferrer"
              >
                Télécharger / imprimer le brevet
              </a>
              <Link
                href={`/verify/${cert.code}`}
                className="yk-btn yk-btn-ghost !py-2 !text-sm"
              >
                Page de vérification
              </Link>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--yk-muted)]">
            {evald.lessonsComplete
              ? evald.quizzesComplete
                ? "Finalisation du brevet…"
                : `Validez tous les quiz (≥ ${QUIZ_PASS_THRESHOLD}%) pour le brevet.`
              : "Terminez toutes les leçons, puis validez chaque quiz."}
          </p>
        )}

        <div className="mt-6">
          <LearnerTutorPanel courseTitle={course.title} learnerName={user.name} />
        </div>

        <div className="mt-8 space-y-6">
          {course.modules.map((m) => {
            const quizScore = progress?.quizScores?.[m.id];
            const quizOk =
              (m.quiz?.length ?? 0) === 0 ||
              (typeof quizScore === "number" && quizScore >= QUIZ_PASS_THRESHOLD);
            return (
              <section key={m.id} className="yk-card">
                <h2 className="font-display text-lg font-bold">
                  Module {m.order} — {m.title}
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
                              <IconCheck
                                size={16}
                                className="shrink-0 text-[var(--yk-lime)]"
                              />
                            )}
                            {l.title}
                          </Link>
                          <p className="text-xs text-[var(--yk-muted)]">{l.minutes} min</p>
                        </div>
                        <LessonCompleteButton
                          courseId={courseId}
                          lessonId={l.id}
                          completed={!!done}
                        />
                      </li>
                    );
                  })}
                </ul>
                {m.quiz.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/learn/${courseId}/quiz/${m.id}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-[var(--yk-teal)]"
                    >
                      {typeof quizScore === "number" ? "Repasser le quiz" : "Passer le quiz"}{" "}
                      <IconArrowRight size={16} />
                    </Link>
                    {typeof quizScore === "number" && (
                      <span
                        className={`text-xs font-bold ${
                          quizOk ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        Score {quizScore}% {quizOk ? "· validé" : `· min ${QUIZ_PASS_THRESHOLD}%`}
                      </span>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {qIds.length > 0 && !cert && (
          <p className="mt-6 text-center text-xs text-[var(--yk-muted)]">
            Quiz validés : {evald.quizPassed}/{evald.quizTotal}
          </p>
        )}
      </main>
    </div>
  );
}
