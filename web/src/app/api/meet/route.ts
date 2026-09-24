import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/store";
import { enrollmentFor } from "@/lib/db/queries";
import { courseMeetUrl } from "@/lib/meet";

/** Meet audio pour un cours — réservé aux inscrits / propriétaire académie. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const courseId = new URL(req.url).searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json({ error: "courseId_required" }, { status: 400 });
  }

  const db = getDb();
  const course = db.courses.find((c) => c.id === courseId);
  if (!course) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const academy = db.academies.find((a) => a.id === course.academyId);
  const isOwner = user.academyId === course.academyId && user.role === "teacher";
  const isLearner = !!enrollmentFor(user.id, courseId);

  if (!isOwner && !isLearner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = courseMeetUrl(courseId, academy?.slug);
  const now = Date.now();
  const sessions = (course.liveSessions || [])
    .map((s) => ({
      id: s.id,
      title: s.title,
      startsAt: s.startsAt,
      durationMin: s.durationMin,
      meetUrl: s.meetUrl || url,
      liveRequired: course.liveRequired,
    }))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const upcoming = sessions.find((s) => new Date(s.startsAt).getTime() >= now - 30 * 60_000);
  const joinUrl = upcoming?.meetUrl || url;

  return NextResponse.json({
    url: joinUrl,
    roomUrl: url,
    role: isOwner ? "host" : "learner",
    courseTitle: course.title,
    liveRequired: course.liveRequired,
    sessions,
    nextSession: upcoming || null,
    hint: "Audio recommandé - démarrez sans caméra pour économiser la data.",
  });
}
