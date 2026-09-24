import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { enrollmentFor, buildOfflinePack } from "@/lib/db/queries";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const courseId = new URL(req.url).searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId_required" }, { status: 400 });

  const enr = enrollmentFor(user.id, courseId);
  if (!enr || !enr.offlinePackUnlocked) {
    return NextResponse.json(
      { error: "purchase_required", message: "Achetez ce cours pour télécharger le pack hors ligne." },
      { status: 403 },
    );
  }

  const pack = buildOfflinePack(courseId);
  if (!pack) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({ pack });
}
