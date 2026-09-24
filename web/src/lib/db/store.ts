import fs from "fs";
import path from "path";
import type { DbShape } from "@/lib/types";
import { buildSeed, SEED_VERSION } from "@/lib/db/seed";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

declare global {
  var __yekolaDb: DbShape | undefined;
}

function emptyDb(): DbShape {
  return {
    seedVersion: 0,
    users: [],
    academies: [],
    courses: [],
    enrollments: [],
    progress: [],
    certificates: [],
    walletTx: [],
    subscriptions: [],
    payments: [],
    syncAccepted: [],
  };
}

function ensureShape(db: DbShape): DbShape {
  if (!Array.isArray(db.payments)) db.payments = [];
  if (!Array.isArray(db.syncAccepted)) db.syncAccepted = [];
  return db;
}

function readFromDisk(): DbShape | null {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return ensureShape(JSON.parse(raw) as DbShape);
  } catch {
    return null;
  }
}

export function saveDb(db: DbShape) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  globalThis.__yekolaDb = db;
}

export function getDb(): DbShape {
  if (globalThis.__yekolaDb && globalThis.__yekolaDb.seedVersion === SEED_VERSION) {
    return globalThis.__yekolaDb;
  }
  const disk = readFromDisk();
  if (disk && disk.users.length > 0 && disk.seedVersion === SEED_VERSION) {
    globalThis.__yekolaDb = disk;
    return disk;
  }
  const seeded = buildSeed();
  saveDb(seeded);
  return seeded;
}

export function resetDb() {
  const seeded = buildSeed();
  saveDb(seeded);
  return seeded;
}

export function mutateDb(fn: (db: DbShape) => void): DbShape {
  const db = structuredClone(getDb());
  fn(db);
  saveDb(db);
  return db;
}

export { emptyDb };
