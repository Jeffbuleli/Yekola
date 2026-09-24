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
  return NextResponse.json({
    url,
    role: isOwner ? "host" : "learner",
    courseTitle: course.title,
    hint: "Audio recommandé - démarrez sans caméra pour économiser la data.",
  });
}
