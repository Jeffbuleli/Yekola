"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { LessonMedia, LiveSession } from "@/lib/types";

const COVER_PRESETS = [
  { id: "web", icon: "code", src: "/covers/web.png", label: "Web / numérique" },
  { id: "momo", icon: "wallet", src: "/covers/momo.png", label: "Mobile Money" },
  { id: "electric", icon: "book", src: "/covers/electric.png", label: "Électricité / FP" },
  { id: "weld", icon: "store", src: "/covers/weld.png", label: "Atelier / métier" },
];

type LiveDraft = {
  title: string;
  startsAt: string;
  durationMin: number;
  required: boolean;
};

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [priceCdf, setPriceCdf] = useState(1000);
  const [, setCoverPreset] = useState(COVER_PRESETS[2]);
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[2].src);
  const [coverIcon, setCoverIcon] = useState(COVER_PRESETS[2].icon);
  const [moduleTitle, setModuleTitle] = useState("Module 1");
  const [lessonTitle, setLessonTitle] = useState("Leçon 1");
  const [lessonBody, setLessonBody] = useState("Contenu de la leçon…");
  const [lessonMedia, setLessonMedia] = useState<LessonMedia[]>([]);
  const [liveRequired, setLiveRequired] = useState(false);
  const [lives, setLives] = useState<LiveDraft[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function uploadFile(file: File, asCover = false) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Upload impossible");
        return;
      }
      if (asCover) {
        setCoverImage(data.media.url);
      } else {
        setLessonMedia((prev) => [...prev, data.media]);
      }
    } catch {
      setError("Erreur réseau upload");
    } finally {
      setUploading(false);
    }
  }

  function addLiveSlot() {
    const start = new Date();
    start.setDate(start.getDate() + 2);
    start.setMinutes(0, 0, 0);
    setLives((prev) => [
      ...prev,
      {
        title: `Session live ${prev.length + 1}`,
        startsAt: start.toISOString().slice(0, 16),
        durationMin: 60,
        required: liveRequired,
      },
    ]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const liveSessions: Omit<LiveSession, "id" | "meetUrl">[] = lives.map((l) => ({
        title: l.title,
        startsAt: new Date(l.startsAt).toISOString(),
        durationMin: l.durationMin,
        required: l.required || liveRequired,
      }));

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tagline,
          description,
          priceCdf,
          coverIcon,
          coverImage,
          liveRequired: liveRequired || lives.some((l) => l.required),
          liveSessions,
          status: "draft",
          modules: [
            {
              title: moduleTitle,
              summary: moduleTitle,
              lessons: [
                {
                  title: lessonTitle,
                  minutes: 15,
                  body: lessonBody,
                  media: lessonMedia,
                },
              ],
              quiz: [
                {
                  prompt: "Question de validation",
                  choices: ["Oui", "Non", "Peut-être", "Je ne sais pas"],
                  correctIndex: 0,
                  explanation: "Bonne réponse : Oui.",
                },
              ],
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Erreur");
        return;
      }
      router.push("/studio");
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/studio" className="text-sm font-bold text-[var(--yk-teal)]">
          ← Studio
        </Link>
        <form onSubmit={onSubmit} className="mt-4 space-y-6">
          <section className="yk-card space-y-4">
            <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)]">
              Nouveau cours
            </h1>
            <label className="block text-sm font-semibold">
              Titre
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Accroche
              <input
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Description
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Prix (FC)
              <input
                type="number"
                min={0}
                step={1}
                value={priceCdf}
                onChange={(e) => setPriceCdf(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
              />
            </label>
          </section>

          <section className="yk-card space-y-3">
            <h2 className="font-display font-bold text-[var(--yk-forest)]">Image de couverture</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COVER_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setCoverPreset(p);
                    setCoverImage(p.src);
                    setCoverIcon(p.icon);
                  }}
                  className={`overflow-hidden rounded-xl border-2 text-left ${
                    coverImage === p.src
                      ? "border-[var(--yk-amber)]"
                      : "border-[var(--yk-line)]"
                  }`}
                >
                  <div className="relative aspect-[4/3]">
                    <Image src={p.src} alt="" fill className="object-cover" sizes="120px" />
                  </div>
                  <p className="p-1.5 text-[10px] font-bold">{p.label}</p>
                </button>
              ))}
            </div>
            <label className="block text-sm font-semibold">
              Ou uploader votre image
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadFile(f, true);
                }}
              />
            </label>
            {coverImage && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                <Image src={coverImage} alt="" fill className="object-cover" sizes="640px" />
              </div>
            )}
          </section>

          <section className="yk-card space-y-4">
            <h2 className="font-display font-bold text-[var(--yk-forest)]">
              Premier module & médias
            </h2>
            <label className="block text-sm font-semibold">
              Module
              <input
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Leçon
              <input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Contenu texte
              <textarea
                rows={5}
                value={lessonBody}
                onChange={(e) => setLessonBody(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
              />
            </label>
            <label className="block text-sm font-semibold">
              Ajouter image, vidéo ou fichier
              <input
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.zip"
                className="mt-1 block w-full text-sm"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadFile(f, false);
                  e.target.value = "";
                }}
              />
            </label>
            {uploading && <p className="text-xs text-[var(--yk-muted)]">Upload…</p>}
            {lessonMedia.length > 0 && (
              <ul className="space-y-1 text-sm">
                {lessonMedia.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[var(--yk-line)] px-3 py-2"
                  >
                    <span>
                      <strong className="uppercase text-[10px] text-[var(--yk-teal)]">
                        {m.kind}
                      </strong>{" "}
                      {m.name}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-bold text-red-600"
                      onClick={() => setLessonMedia((prev) => prev.filter((x) => x.id !== m.id))}
                    >
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="yk-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display font-bold text-[var(--yk-forest)]">
                Calendrier Meet (optionnel)
              </h2>
              <button type="button" onClick={addLiveSlot} className="yk-btn yk-btn-ghost !py-2 !text-xs">
                + Session
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={liveRequired}
                onChange={(e) => setLiveRequired(e.target.checked)}
              />
              Ce cours exige au moins une session live
            </label>
            <p className="text-xs text-[var(--yk-muted)]">
              Les sessions ouvrent une salle McBuleli Live (audio recommandé).
            </p>
            {lives.map((l, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-[var(--yk-line)] p-3">
                <input
                  value={l.title}
                  onChange={(e) =>
                    setLives((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                    )
                  }
                  className="w-full rounded-lg border border-[var(--yk-line)] px-3 py-2 text-sm"
                  placeholder="Titre session"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="datetime-local"
                    value={l.startsAt}
                    onChange={(e) =>
                      setLives((prev) =>
                        prev.map((x, j) => (j === i ? { ...x, startsAt: e.target.value } : x)),
                      )
                    }
                    className="rounded-lg border border-[var(--yk-line)] px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={l.durationMin}
                    onChange={(e) =>
                      setLives((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, durationMin: Number(e.target.value) } : x,
                        ),
                      )
                    }
                    className="rounded-lg border border-[var(--yk-line)] px-3 py-2 text-sm"
                    placeholder="Durée (min)"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={l.required}
                      onChange={(e) =>
                        setLives((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, required: e.target.checked } : x,
                          ),
                        )
                      }
                    />
                    Obligatoire
                  </label>
                  <button
                    type="button"
                    className="text-xs font-bold text-red-600"
                    onClick={() => setLives((prev) => prev.filter((_, j) => j !== i))}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy || uploading} className="yk-btn yk-btn-primary w-full">
            {busy ? "…" : "Enregistrer le brouillon"}
          </button>
        </form>
      </div>
    </div>
  );
}
