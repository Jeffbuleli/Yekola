import { NextResponse } from "next/server";
import { askTutor } from "@/lib/ai/tutor";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const question = String(body.question || "").trim();
  if (question.length < 3) {
    return NextResponse.json({ error: "question_required" }, { status: 400 });
  }

  const result = await askTutor({
    learnerName: user.name || String(body.learnerName || ""),
    pathTitle: String(body.pathTitle || "Cours Yekola"),
    moduleTitle: String(body.moduleTitle || ""),
    lessonTitle: String(body.lessonTitle || ""),
    quizScore: body.quizScore ? String(body.quizScore) : undefined,
    weakTopics: Array.isArray(body.weakTopics) ? body.weakTopics.map(String) : [],
    question,
  });
  return NextResponse.json(result);
}
