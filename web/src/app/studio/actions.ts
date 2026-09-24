"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { mutateDb } from "@/lib/db/store";
import { canPublishCourse } from "@/lib/plans";

export async function togglePublishCourse(courseId: string, _formData?: FormData): Promise<void> {
  void _formData;
  const user = await getCurrentUser();
  if (!user?.academyId || user.role !== "teacher") return;

  mutateDb((d) => {
    const c = d.courses.find((x) => x.id === courseId && x.academyId === user.academyId);
    if (!c) return;
    if (c.status === "draft") {
      const academy = d.academies.find((a) => a.id === user.academyId)!;
      const published = d.courses.filter(
        (x) => x.academyId === academy.id && x.status === "published",
      ).length;
      if (!canPublishCourse(academy.planId, published)) return;
      c.status = "published";
    } else {
      c.status = "draft";
    }
    c.updatedAt = new Date().toISOString();
  });

  revalidatePath("/studio");
  revalidatePath("/catalog");
}
