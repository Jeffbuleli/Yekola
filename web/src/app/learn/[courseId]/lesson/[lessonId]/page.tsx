import { SiteHeader } from "@/components/site-header";
import { LessonViewer } from "@/components/lesson-viewer";
import { getCurrentUser } from "@/lib/auth/session";
import { enrollmentFor, getCourseById } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const user = await getCurrentUser();
  // Auth soft: if offline shell loads without cookie, client pack still works for enrolled devices
  const course = getCourseById(courseId);
  let serverLesson: {
    title: string;
    body: string;
    minutes: number;
    media?: { id: string; kind: "image" | "video" | "file"; name: string; url: string }[];
  } | null = null;
  let courseTitle = "Cours";

  if (user && course && enrollmentFor(user.id, courseId)) {
    courseTitle = course.title;
    for (const m of course.modules) {
      const found = m.lessons.find((l) => l.id === lessonId);
      if (found) {
        serverLesson = {
          title: found.title,
          body: found.body,
          minutes: found.minutes,
          media: found.media ?? [],
        };
        break;
      }
    }
  } else if (!user) {
    // Still render shell so offline pack can load
  } else if (course && !enrollmentFor(user.id, courseId)) {
    redirect(`/courses/${course.slug}`);
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      <LessonViewer
        courseId={courseId}
        lessonId={lessonId}
        courseTitle={courseTitle}
        serverLesson={serverLesson}
      />
    </div>
  );
}
