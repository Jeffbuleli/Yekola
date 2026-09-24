"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { mutateDb } from "@/lib/db/store";
import { canPublishCourse } from "@/lib/plans";

/** Enseignant : brouillon ↔ soumettre à validation ; ou retirer du public → brouillon. */
export async function togglePublishCourse(courseId: string, _formData?: FormData): Promise<void> {
  void _formData;
  const user = await getCurrentUser();
  if (!user?.academyId || user.role !== "teacher") return;

  mutateDb((d) => {
    const c = d.courses.find((x) => x.id === courseId && x.academyId === user.academyId);
    if (!c) return;
    const academy = d.academies.find((a) => a.id === user.academyId)!;
    const published = d.courses.filter(
      (x) => x.academyId === academy.id && x.status === "published",
    ).length;

    if (c.status === "draft" || c.status === "rejected") {
      if (!canPublishCourse(academy.planId, published)) return;
      c.status = "pending_review";
      c.reviewNote = null;
      c.reviewedAt = null;
      c.reviewedBy = null;
    } else if (c.status === "pending_review") {
      c.status = "draft";
    } else if (c.status === "published") {
      c.status = "draft";
      c.reviewNote = null;
      c.reviewedAt = null;
      c.reviewedBy = null;
    }
    c.updatedAt = new Date().toISOString();
  });

  revalidatePath("/studio");
  revalidatePath("/admin");
  revalidatePath("/catalog");
}

export async function adminReviewCourse(
  courseId: string,
  decision: "approve" | "reject",
  note?: string,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return;

  mutateDb((d) => {
    const c = d.courses.find((x) => x.id === courseId);
    if (!c || c.status !== "pending_review") return;
    const academy = d.academies.find((a) => a.id === c.academyId);
    if (!academy) return;
    if (decision === "approve") {
      const published = d.courses.filter(
        (x) => x.academyId === academy.id && x.status === "published",
      ).length;
      if (!canPublishCourse(academy.planId, published)) {
        c.status = "rejected";
        c.reviewNote = "Limite du plan enseignant atteinte.";
      } else {
        c.status = "published";
        c.reviewNote = null;
      }
    } else {
      c.status = "rejected";
      c.reviewNote = (note || "Contenu à retravailler.").slice(0, 280);
    }
    c.reviewedAt = new Date().toISOString();
    c.reviewedBy = user.id;
    c.updatedAt = c.reviewedAt;
  });

  revalidatePath("/admin");
  revalidatePath("/studio");
  revalidatePath("/catalog");
}

export async function approveCourseAction(courseId: string, _formData?: FormData) {
  void _formData;
  await adminReviewCourse(courseId, "approve");
}

export async function rejectCourseAction(courseId: string, _formData?: FormData) {
  void _formData;
  await adminReviewCourse(courseId, "reject", "Contenu à améliorer");
}
