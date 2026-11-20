import fs from "fs";
import path from "path";
import type { DbShape } from "@/lib/types";
import { buildSeed, SEED_VERSION } from "@/lib/db/seed";

declare global {
  var __yekolaDb: DbShape | undefined;
}

function dataDir() {
  const fromEnv = process.env.YEKOOLA_DATA_DIR?.trim();
  if (fromEnv) return fromEnv.replace(/^["']|["']$/g, "");
  return path.join(process.cwd(), "data");
}

function dataFile() {
  return path.join(dataDir(), "store.json");
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
    sessions: [],
    passkeys: [],
    webauthnChallenges: [],
  };
}

function ensureShape(db: DbShape): DbShape {
  if (!Array.isArray(db.payments)) db.payments = [];
  if (!Array.isArray(db.syncAccepted)) db.syncAccepted = [];
  if (!Array.isArray(db.sessions)) db.sessions = [];
  if (!Array.isArray(db.passkeys)) db.passkeys = [];
  if (!Array.isArray(db.webauthnChallenges)) db.webauthnChallenges = [];
  for (const u of db.users) {
    if (u.emailVerifiedAt === undefined) {
      u.emailVerifiedAt = u.createdAt;
    }
    if (u.emailVerifyTokenHash === undefined) u.emailVerifyTokenHash = null;
    if (u.emailVerifyExpiresAt === undefined) u.emailVerifyExpiresAt = null;
    if (u.passwordResetTokenHash === undefined) u.passwordResetTokenHash = null;
    if (u.passwordResetExpiresAt === undefined) u.passwordResetExpiresAt = null;
    if (u.devicePollTokenHash === undefined) u.devicePollTokenHash = null;
    if (u.devicePollExpiresAt === undefined) u.devicePollExpiresAt = null;
    if (u.devicePollPurpose === undefined) u.devicePollPurpose = null;
    if (u.piUid === undefined) u.piUid = null;
    if (u.piUsername === undefined) u.piUsername = null;
  }
  for (const a of db.academies) {
    if (a.walletBalancePi === undefined) a.walletBalancePi = 0;
  }
  for (const c of db.courses) {
    if (c.coverImage === undefined) c.coverImage = null;
    if (typeof c.liveRequired !== "boolean") c.liveRequired = false;
    if (!Array.isArray(c.liveSessions)) c.liveSessions = [];
    for (const m of c.modules || []) {
      for (const l of m.lessons || []) {
        if (!Array.isArray(l.media)) l.media = [];
      }
    }
  }
  return db;
}

/**
 * Upgrade catalogue seed without wiping real users / sessions / progress.
 */
function migratePreserveUsers(existing: DbShape): DbShape {
  const seeded = buildSeed();
  const demoEmails = new Set(seeded.users.map((u) => u.email));

  // Keep all non-demo users; refresh demo accounts from seed
  const keptUsers = existing.users.filter((u) => !demoEmails.has(u.email));
  const users = [...seeded.users, ...keptUsers];

  // Preserve academies owned by real users; refresh seed academies
  const seedAcademyIds = new Set(seeded.academies.map((a) => a.id));
  const seedOwnerIds = new Set(seeded.users.map((u) => u.id));
  const keptAcademies = existing.academies.filter(
    (a) => !seedAcademyIds.has(a.id) && !seedOwnerIds.has(a.ownerId),
  );

  // Remap: seed academy ids may change each buildSeed() because newId() is random!
  // So for migration we should NOT replace course IDs if seed regenerates random IDs.
  // Safer approach: only bump seedVersion, keep courses if already present;
  // only inject missing seed courses by slug.
  const coursesBySlug = new Map(existing.courses.map((c) => [c.slug, c]));
  for (const c of seeded.courses) {
    if (!coursesBySlug.has(c.slug)) {
      coursesBySlug.set(c.slug, c);
    }
  }

  const academiesBySlug = new Map(existing.academies.map((a) => [a.slug, a]));
  for (const a of seeded.academies) {
    const cur = academiesBySlug.get(a.slug);
    if (cur) {
      // Keep academy id (courses point to it); refresh owner to current demo teacher
      academiesBySlug.set(a.slug, { ...cur, ownerId: a.ownerId, name: a.name, bio: a.bio });
    } else {
      academiesBySlug.set(a.slug, a);
    }
  }
  for (const a of keptAcademies) academiesBySlug.set(a.slug, a);

  return ensureShape({
    ...existing,
    seedVersion: SEED_VERSION,
    users,
    academies: [...academiesBySlug.values()],
    courses: [...coursesBySlug.values()],
    // preserve runtime data
    enrollments: existing.enrollments || [],
    progress: existing.progress || [],
    certificates: existing.certificates || [],
    walletTx: existing.walletTx || [],
    subscriptions: existing.subscriptions || [],
    payments: existing.payments || [],
    syncAccepted: existing.syncAccepted || [],
    sessions: existing.sessions || [],
    passkeys: existing.passkeys || [],
    webauthnChallenges: existing.webauthnChallenges || [],
  });
}

function readFromDisk(): DbShape | null {
  try {
    const file = dataFile();
    if (!fs.existsSync(file)) return null;
    const raw = fs.readFileSync(file, "utf8");
    return ensureShape(JSON.parse(raw) as DbShape);
  } catch (err) {
    console.error("[yekola-db] read failed", dataFile(), err);
    return null;
  }
}

export function saveDb(db: DbShape) {
  const dir = dataDir();
  const file = dataFile();
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  const payload = JSON.stringify(db, null, 2);
  fs.writeFileSync(tmp, payload, "utf8");
  fs.renameSync(tmp, file);
  globalThis.__yekolaDb = db;
}

export function getDb(): DbShape {
  if (globalThis.__yekolaDb) {
    if (globalThis.__yekolaDb.seedVersion !== SEED_VERSION) {
      const migrated = migratePreserveUsers(globalThis.__yekolaDb);
      saveDb(migrated);
      return migrated;
    }
    return globalThis.__yekolaDb;
  }

  const disk = readFromDisk();
  if (disk && disk.users.length > 0) {
    if (disk.seedVersion !== SEED_VERSION) {
      const migrated = migratePreserveUsers(disk);
      saveDb(migrated);
      return migrated;
    }
    globalThis.__yekolaDb = disk;
    return disk;
  }

  // Empty disk only → seed once
  const seeded = buildSeed();
  saveDb(seeded);
  console.warn("[yekola-db] seeded fresh store at", dataFile());
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

export function dbInfo() {
  return {
    dataDir: dataDir(),
    dataFile: dataFile(),
    seedVersion: SEED_VERSION,
    memoryLoaded: Boolean(globalThis.__yekolaDb),
    users: globalThis.__yekolaDb?.users.length ?? readFromDisk()?.users.length ?? 0,
    sessions: globalThis.__yekolaDb?.sessions?.length ?? readFromDisk()?.sessions?.length ?? 0,
  };
}

export { emptyDb };
