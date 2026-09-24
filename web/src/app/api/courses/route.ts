import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { newId } from "@/lib/auth/crypto";
import { getDb, mutateDb } from "@/lib/db/store";
import {
  canPublishCourse,
  getPlan,
} from "@/lib/plans";
import { enrichCourse, slugify } from "@/lib/db/queries";
import type { Course, CourseModule } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";
  const slug = url.searchParams.get("slug");
  const id = url.searchParams.get("id");
  const db = getDb();

  if (slug) {
    const c = db.courses.find((x) => x.slug === slug);
    if (!c || c.status !== "published") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ course: enrichCourse(c) });
  }

  if (id) {
    const user = await getCurrentUser();
    const c = db.courses.find((x) => x.id === id);
    if (!c) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const isOwner =
      user &&
      user.academyId === c.academyId &&
      user.role === "teacher";
    if (c.status !== "published" && !isOwner) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ course: enrichCourse(c) });
  }

  if (mine) {
    const user = await getCurrentUser();
    if (!user?.academyId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const courses = db.courses
      .filter((c) => c.academyId === user.academyId)
      .map(enrichCourse);
    return NextResponse.json({ courses });
  }

  const courses = db.courses
    .filter((c) => c.status === "published")
    .map(enrichCourse);
  return NextResponse.json({ courses });
}

const courseSchema = z.object({
  title: z.string().min(3),
  tagline: z.string().min(3),
  description: z.string().min(10),
  priceCdf: z.number().min(0),
  coverIcon: z.string().optional(),
  modules: z
    .array(
      z.object({
        title: z.string().min(2),
        summary: z.string(),
        lessons: z.array(
          z.object({
            title: z.string().min(2),
            minutes: z.number().min(1),
            body: z.string().min(10),
          }),
        ),
        quiz: z
          .array(
            z.object({
              prompt: z.string(),
              choices: z.array(z.string()).min(2),
              correctIndex: z.number().int().min(0),
              explanation: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .min(1),
  status: z.enum(["draft", "pending_review", "published"]).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher" || !user.academyId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const db = getDb();
  const academy = db.academies.find((a) => a.id === user.academyId);
  if (!academy) return NextResponse.json({ error: "no_academy" }, { status: 400 });

  // Enseignant ne publie pas directement : published → pending_review
  let status = parsed.data.status ?? "draft";
  if (status === "published") status = "pending_review";
  if (status === "pending_review") {
    const published = db.courses.filter(
      (c) => c.academyId === academy.id && c.status === "published",
    ).length;
    if (!canPublishCourse(academy.planId, published)) {
      return NextResponse.json(
        {
          error: "plan_limit",
          message: `Votre plan ${getPlan(academy.planId).name} ne permet pas plus de cours publiés.`,
        },
        { status: 403 },
      );
    }
  }

  const now = new Date().toISOString();
  const baseSlug = slugify(parsed.data.title);
  let slug = baseSlug;
  let i = 1;
  while (db.courses.some((c) => c.slug === slug)) slug = `${baseSlug}-${i++}`;

  const modules: CourseModule[] = parsed.data.modules.map((m, mi) => ({
    id: newId("mod"),
    title: m.title,
    summary: m.summary,
    order: mi + 1,
    lessons: m.lessons.map((l, li) => ({
      id: newId("les"),
      title: l.title,
      minutes: l.minutes,
      body: l.body,
      order: li + 1,
    })),
    quiz: (m.quiz ?? []).map((q) => ({
      id: newId("q"),
      prompt: q.prompt,
      choices: q.choices,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    })),
  }));

  const course: Course = {
    id: newId("crs"),
    academyId: academy.id,
    slug,
    title: parsed.data.title,
    tagline: parsed.data.tagline,
    description: parsed.data.description,
    priceCdf: parsed.data.priceCdf,
    currency: "CDF",
    status,
    reviewNote: null,
    reviewedAt: null,
    reviewedBy: null,
    coverIcon: parsed.data.coverIcon || "book",
    modules,
    createdAt: now,
    updatedAt: now,
  };

  mutateDb((d) => {
    d.courses.push(course);
  });

  return NextResponse.json({ course: enrichCourse(course) });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher" || !user.academyId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const courseId = String(body?.id ?? "");
  const db = getDb();
  const existing = db.courses.find((c) => c.id === courseId);
  if (!existing || existing.academyId !== user.academyId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let nextStatus = body.status as string | undefined;
  if (nextStatus === "published") nextStatus = "pending_review";
  if (nextStatus === "pending_review" && existing.status !== "pending_review") {
    const academy = db.academies.find((a) => a.id === user.academyId)!;
    const published = db.courses.filter(
      (c) => c.academyId === academy.id && c.status === "published",
    ).length;
    if (!canPublishCourse(academy.planId, published)) {
      return NextResponse.json({ error: "plan_limit" }, { status: 403 });
    }
  }

  mutateDb((d) => {
    const c = d.courses.find((x) => x.id === courseId)!;
    if (typeof body.title === "string") c.title = body.title;
    if (typeof body.tagline === "string") c.tagline = body.tagline;
    if (typeof body.description === "string") c.description = body.description;
    if (typeof body.priceCdf === "number") c.priceCdf = body.priceCdf;
    if (nextStatus === "draft" || nextStatus === "pending_review") {
      c.status = nextStatus;
      if (nextStatus === "pending_review") {
        c.reviewNote = null;
        c.reviewedAt = null;
        c.reviewedBy = null;
      }
    }
    c.updatedAt = new Date().toISOString();
  });

  return NextResponse.json({ course: enrichCourse(getDb().courses.find((c) => c.id === courseId)!) });
}
