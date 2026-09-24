import { NextResponse } from "next/server";
import { buildMeetUrl } from "@/lib/meet";

export async function GET() {
  return NextResponse.json({ url: buildMeetUrl() });
}
