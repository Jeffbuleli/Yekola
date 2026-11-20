/**
 * SyncManager — packs cours + file d'attente hors ligne (IndexedDB).
 */

export type SyncEventType =
  | "LESSON_COMPLETED"
  | "QUIZ_ATTEMPT_CREATED"
  | "PROGRESS_UPDATED";

export type SyncEvent = {
  id: string;
  type: SyncEventType;
  payload: Record<string, unknown>;
  createdAt: string;
  status: "pending" | "synced" | "failed";
};

export type ConnectivityMode = "online" | "syncing" | "offline";

export type OfflinePack = {
  version: number;
  courseId: string;
  slug: string;
  title: string;
  downloadedAt: string;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      minutes: number;
      body: string;
      order: number;
    }>;
    quiz: Array<{
      id: string;
      prompt: string;
      choices: string[];
      correctIndex: number;
      explanation: string;
    }>;
  }>;
};

const DB_NAME = "yekola-offline";
const DB_VERSION = 2;
const STORE_SYNC = "sync_queue";
const STORE_META = "meta";
const STORE_PACKS = "packs";

const FORCE_KEY = "yekola_force_offline";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_SYNC)) {
        db.createObjectStore(STORE_SYNC, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_PACKS)) {
        db.createObjectStore(STORE_PACKS, { keyPath: "courseId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function uid() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function isForcedOffline(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(FORCE_KEY) === "1";
}

export function isOfflineMode(): boolean {
  if (typeof navigator === "undefined") return false;
  return isForcedOffline() || !navigator.onLine;
}

export async function queueEvent(
  type: SyncEventType,
  payload: Record<string, unknown>,
): Promise<SyncEvent> {
  const event: SyncEvent = {
    id: uid(),
    type,
    payload,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_SYNC, "readwrite");
    tx.objectStore(STORE_SYNC).put(event);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return event;
}

export async function listPending(): Promise<SyncEvent[]> {
  const db = await openDb();
  const all = await new Promise<SyncEvent[]>((resolve, reject) => {
    const tx = db.transaction(STORE_SYNC, "readonly");
    const req = tx.objectStore(STORE_SYNC).getAll();
    req.onsuccess = () => resolve(req.result as SyncEvent[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return all.filter((e) => e.status === "pending");
}

export async function markSynced(ids: string[]) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_SYNC, "readwrite");
    const store = tx.objectStore(STORE_SYNC);
    for (const id of ids) {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const ev = getReq.result as SyncEvent | undefined;
        if (ev) {
          ev.status = "synced";
          store.put(ev);
        }
      };
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function setProgress(key: string, value: unknown) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_META, "readwrite");
    tx.objectStore(STORE_META).put({ key, value, updatedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getProgress<T>(key: string): Promise<T | null> {
  const db = await openDb();
  const row = await new Promise<{ value: T } | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_META, "readonly");
    const req = tx.objectStore(STORE_META).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return row ? row.value : null;
}

export async function savePack(pack: OfflinePack): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PACKS, "readwrite");
    tx.objectStore(STORE_PACKS).put(pack);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  localStorage.setItem(`yekola_pack_${pack.courseId}`, "1");
}

export async function getPack(courseId: string): Promise<OfflinePack | null> {
  const db = await openDb();
  const row = await new Promise<OfflinePack | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_PACKS, "readonly");
    const req = tx.objectStore(STORE_PACKS).get(courseId);
    req.onsuccess = () => resolve(req.result as OfflinePack | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return row ?? null;
}

export async function hasPack(courseId: string): Promise<boolean> {
  const p = await getPack(courseId);
  return !!p;
}

export async function listPackCourseIds(): Promise<string[]> {
  const db = await openDb();
  const all = await new Promise<OfflinePack[]>((resolve, reject) => {
    const tx = db.transaction(STORE_PACKS, "readonly");
    const req = tx.objectStore(STORE_PACKS).getAll();
    req.onsuccess = () => resolve(req.result as OfflinePack[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return all.map((p) => p.courseId);
}

export async function getLessonFromPack(
  courseId: string,
  lessonId: string,
): Promise<{ title: string; body: string; minutes: number; courseTitle: string } | null> {
  const pack = await getPack(courseId);
  if (!pack) return null;
  for (const m of pack.modules) {
    const les = m.lessons.find((l) => l.id === lessonId);
    if (les) {
      return {
        title: les.title,
        body: les.body,
        minutes: les.minutes,
        courseTitle: pack.title,
      };
    }
  }
  return null;
}

export async function getQuizFromPack(courseId: string, moduleId: string) {
  const pack = await getPack(courseId);
  if (!pack) return null;
  const mod = pack.modules.find((m) => m.id === moduleId);
  if (!mod) return null;
  return { title: mod.title, quiz: mod.quiz };
}

/** Sync vers cloud. Idempotent par event.id. Applique aussi la progression serveur. */
export async function syncNow(): Promise<{ synced: number; mode: ConnectivityMode }> {
  if (isOfflineMode()) {
    return { synced: 0, mode: "offline" };
  }
  const pending = await listPending();
  if (pending.length === 0) return { synced: 0, mode: "online" };

  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ events: pending }),
  });
  if (!res.ok) throw new Error("sync_failed");
  const data = (await res.json()) as { accepted: string[] };
  await markSynced(data.accepted);
  return { synced: data.accepted.length, mode: "online" };
}

export function detectMode(pendingCount: number, forcedOffline?: boolean): ConnectivityMode {
  if (forcedOffline || (typeof navigator !== "undefined" && !navigator.onLine)) {
    return "offline";
  }
  if (pendingCount > 0) return "syncing";
  return "online";
}

export { FORCE_KEY };

/** Demande au SW de mettre en cache les pages learn du pack (pour ouverture hors ligne). */
export async function precacheLearnUrls(pack: OfflinePack): Promise<void> {
  const urls = [
    "/offline/learn",
    `/learn/${pack.courseId}`,
    ...pack.modules.flatMap((m) => [
      ...m.lessons.map((l) => `/learn/${pack.courseId}/lesson/${l.id}`),
      ...(m.quiz.length ? [`/learn/${pack.courseId}/quiz/${m.id}`] : []),
    ]),
  ];
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  reg.active?.postMessage({ type: "CACHE_URLS", urls });
  // Also warm browser HTTP cache / SW via fetch while online
  for (const url of urls) {
    try {
      await fetch(url, { credentials: "same-origin" });
    } catch {
      /* ignore */
    }
  }
}

export async function saveLocalLessonDone(courseId: string, lessonId: string) {
  const key = `local_done:${courseId}`;
  const prev = (await getProgress<string[]>(key)) ?? [];
  if (!prev.includes(lessonId)) await setProgress(key, [...prev, lessonId]);
}

export async function saveLocalQuizScore(
  courseId: string,
  moduleId: string,
  score: number,
) {
  const key = `local_quiz:${courseId}`;
  const prev = (await getProgress<Record<string, number>>(key)) ?? {};
  const cur = prev[moduleId];
  if (cur == null || score > cur) {
    await setProgress(key, { ...prev, [moduleId]: score });
  }
}

export async function getLocalProgress(courseId: string): Promise<{
  completedLessonIds: string[];
  quizScores: Record<string, number>;
}> {
  const done = (await getProgress<string[]>(`local_done:${courseId}`)) ?? [];
  const quiz = (await getProgress<Record<string, number>>(`local_quiz:${courseId}`)) ?? {};
  return { completedLessonIds: done, quizScores: quiz };
}

export function emitProgressChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("yekola-progress"));
  }
}
