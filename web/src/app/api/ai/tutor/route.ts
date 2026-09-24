import { NextResponse } from "next/server";
import { askTutor } from "@/lib/ai/tutor";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await askTutor({
    learnerName: String(body.learnerName || ""),
    pathTitle: String(body.pathTitle || ""),
    moduleTitle: String(body.moduleTitle || ""),
    lessonTitle: String(body.lessonTitle || ""),
    quizScore: body.quizScore ? String(body.quizScore) : undefined,
    weakTopics: Array.isArray(body.weakTopics) ? body.weakTopics.map(String) : [],
    question: String(body.question || ""),
  });
  return NextResponse.json(result);
}
