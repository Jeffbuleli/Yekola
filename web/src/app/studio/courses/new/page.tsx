"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [priceCdf, setPriceCdf] = useState(1000);
  const [moduleTitle, setModuleTitle] = useState("Module 1");
  const [lessonTitle, setLessonTitle] = useState("Leçon 1");
  const [lessonBody, setLessonBody] = useState("Contenu de la leçon…");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tagline,
          description,
          priceCdf,
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
    <div className="min-h-screen bg-[var(--yk-paper)] px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link href="/studio" className="text-sm font-bold text-[var(--yk-teal)]">
          ← Studio
        </Link>
        <form onSubmit={onSubmit} className="yk-card mt-4 space-y-4">
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
          <label className="block text-sm font-semibold">
            Premier module
            <input
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Première leçon
            <input
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Contenu de la leçon
            <textarea
              rows={6}
              value={lessonBody}
              onChange={(e) => setLessonBody(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
            {busy ? "…" : "Enregistrer le brouillon"}
          </button>
        </form>
      </div>
    </div>
  );
}
