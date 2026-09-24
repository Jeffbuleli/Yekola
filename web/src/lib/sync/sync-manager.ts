/**
 * SyncManager - file d'attente offline crédible (IndexedDB).
 * Conçu pour évoluer vers un Learning Hub physique.
 */

export type SyncEventType =
  | "LESSON_COMPLETED"
  | "QUIZ_ATTEMPT_CREATED"
  | "PROJECT_SUBMITTED"
  | "PROGRESS_UPDATED"
  | "AI_HINT_VIEWED";

export type SyncEvent = {
  id: string;
  type: SyncEventType;
  payload: Record<string, unknown>;
  createdAt: string;
  status: "pending" | "synced" | "failed";
};

export type ConnectivityMode = "online" | "syncing" | "offline";

const DB_NAME = "yekola-hub";
const STORE = "sync_queue";
const PROGRESS = "progress";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PROGRESS)) {
        db.createObjectStore(PROGRESS, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function uid() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
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
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(event);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return event;
}

export async function listPending(): Promise<SyncEvent[]> {
  const db = await openDb();
  const all = await new Promise<SyncEvent[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as SyncEvent[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return all.filter((e) => e.status === "pending");
}

export async function getAllEvents(): Promise<SyncEvent[]> {
  const db = await openDb();
  const all = await new Promise<SyncEvent[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as SyncEvent[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return all;
}

export async function markSynced(ids: string[]) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
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
    const tx = db.transaction(PROGRESS, "readwrite");
    tx.objectStore(PROGRESS).put({ key, value, updatedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getProgress<T>(key: string): Promise<T | null> {
  const db = await openDb();
  const row = await new Promise<{ value: T } | undefined>((resolve, reject) => {
    const tx = db.transaction(PROGRESS, "readonly");
    const req = tx.objectStore(PROGRESS).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return row ? row.value : null;
}

/** Sync vers cloud (API). Idempotent par event.id. */
export async function syncNow(): Promise<{ synced: number; mode: ConnectivityMode }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { synced: 0, mode: "offline" };
  }
  const pending = await listPending();
  if (pending.length === 0) return { synced: 0, mode: "online" };

  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
