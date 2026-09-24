import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth/session";
import { newId } from "@/lib/auth/crypto";

const MAX_BYTES = 12 * 1024 * 1024; // 12 Mo

function kindFromMime(mime: string, name: string): "image" | "video" | "file" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  const ext = name.split(".").pop()?.toLowerCase();
  if (["mp4", "webm", "mov", "m4v"].includes(ext || "")) return "video";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) return "image";
  return "file";
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_form" }, { status: 400 });

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "file_too_large", message: "Fichier max 12 Mo." },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const id = newId("up");
  const rel = `${id}-${safeName}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, rel), buf);

  const kind = kindFromMime(file.type || "", safeName);
  const url = `/uploads/${rel}`;

  return NextResponse.json({
    media: {
      id,
      kind,
      name: file.name,
      url,
      sizeBytes: file.size,
    },
  });
}
