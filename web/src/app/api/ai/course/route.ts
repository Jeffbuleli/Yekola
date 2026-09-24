import { NextResponse } from "next/server";
import { generateCourse } from "@/lib/ai/course-builder";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await generateCourse({
    subject: String(body.subject || ""),
    audience: String(body.audience || ""),
    weeks: Number(body.weeks) || 4,
    objective: String(body.objective || ""),
  });
  return NextResponse.json(result);
}
