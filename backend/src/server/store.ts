import { DatabaseSync } from "node:sqlite";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
} from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import type {
  Patient,
  OrderState,
  PaymentState,
  DuplicateKind,
} from "../lib/booking";
import { AppError } from "./errors";

export interface RecordData {
  attention: "not_started" | "pending" | "completed";
  patient: Patient | null;
  externalId: string | null;
  duplicateId: string | null;
  duplicate: DuplicateKind;
  allowNew: boolean;
  operation: "create" | "reschedule" | null;
  consentAt: string | null;
  policyUrl: string | null;
  transactionId: string | null;
  amount: number | null;
}
export interface BookingRecord {
  id: string;
  order: OrderState;
  payment: PaymentState;
  reference: string;
  updated: number;
  expires: number;
  data: RecordData;
}
let db: DatabaseSync | undefined;
let key: Buffer | undefined;
function encryptionKey(): Buffer {
  if (key) return key;
  const configured = process.env.DATA_ENCRYPTION_KEY;
  if (configured) {
    if (!/^[a-f\d]{64}$/i.test(configured)) throw new AppError("CONFIG");
    return (key = Buffer.from(configured, "hex"));
  }
  if (process.env.NODE_ENV === "production") throw new AppError("CONFIG");
  const directory = resolve(
    /* turbopackIgnore: true */ process.env.DATA_DIR || ".data",
  );
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const file = join(directory, "development.key");
  if (!existsSync(file))
    writeFileSync(file, randomBytes(32), { mode: 0o600, flag: "wx" });
  return (key = readFileSync(file));
}
export function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
export function privateDigest(value: string): string {
  return createHmac("sha256", encryptionKey()).update(value).digest("hex");
}
function seal(data: unknown): string {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const payload = Buffer.concat([
    cipher.update(JSON.stringify(data)),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), payload]).toString("base64");
}
function unseal(data: string): RecordData {
  const bytes = Buffer.from(data, "base64"),
    decipher = createDecipheriv(
      "aes-256-gcm",
      encryptionKey(),
      bytes.subarray(0, 12),
    );
  decipher.setAuthTag(bytes.subarray(12, 28));
  return JSON.parse(
    Buffer.concat([
      decipher.update(bytes.subarray(28)),
      decipher.final(),
    ]).toString(),
  ) as RecordData;
}
export function database(): DatabaseSync {
  if (db) return db;
  encryptionKey();
  const directory = resolve(
    /* turbopackIgnore: true */ process.env.DATA_DIR || ".data",
  );
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  db = new DatabaseSync(
    join(
      directory,
      process.env.MEDICONNECTA_MODE === "live"
        ? "requests.live.sqlite"
        : "requests.mock.sqlite",
    ),
  );
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS requests(id TEXT PRIMARY KEY, session TEXT UNIQUE NOT NULL, state TEXT NOT NULL,
      payment TEXT NOT NULL, reference TEXT UNIQUE NOT NULL, data TEXT NOT NULL, created INTEGER NOT NULL, updated INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS document_locks(document TEXT PRIMARY KEY, request_id TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS payment_events(key TEXT PRIMARY KEY, created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS mock_orders(document TEXT PRIMARY KEY, id TEXT NOT NULL, state TEXT NOT NULL, date TEXT, time TEXT);
  `);
  return db;
}
type Row = {
  id: string;
  state: OrderState;
  payment: PaymentState;
  reference: string;
  data: string;
  updated: number;
  expires: number;
};
function fromRow(row: Row | undefined): BookingRecord | null {
  return row
    ? {
        id: row.id,
        order: row.state,
        payment: row.payment,
        reference: row.reference,
        data: unseal(row.data),
        updated: row.updated,
        expires: row.expires,
      }
    : null;
}
export function getSession(token: string): BookingRecord | null {
  const row = database()
    .prepare("SELECT * FROM requests WHERE session=? AND expires>?")
    .get(digest(token), Date.now()) as Row | undefined;
  return fromRow(row);
}
export function getByReference(reference: string): BookingRecord | null {
  return fromRow(
    database()
      .prepare("SELECT * FROM requests WHERE reference=?")
      .get(reference) as Row | undefined,
  );
}
// Read-only operational feed. Never expose sessions, documents or clinical data.
export function notificationPage(after = "") {
  const rows = database().prepare(
    "SELECT id,state,payment,reference,data,updated,expires FROM requests WHERE state != 'draft' AND id > ? ORDER BY id LIMIT 100",
  ).all(after) as Row[];
  const appointments = rows.flatMap(row => {
    const r = fromRow(row)!;
    if (!r.data.externalId || !r.data.patient) return [];
    return [{
      id: r.data.externalId, version: r.updated,
      startsAt: `${r.data.patient.date}T${r.data.patient.time}:00-05:00`,
      status: r.data.attention === "completed" ? "completed" : r.order,
      payment: r.payment, form: "unknown", doctorId: null,
    }];
  });
  return { appointments, nextCursor: rows.length === 100 ? rows[rows.length - 1]!.id : null };
}
export function createSession(): { token: string; record: BookingRecord } {
  const token = randomBytes(32).toString("hex"),
    now = Date.now();
  const record: BookingRecord = {
    id: randomUUID(),
    order: "draft",
    payment: "not_configured",
    reference: `VIP-${randomUUID()}`,
    updated: now,
    expires: now + 86400000,
    data: {
      attention: "not_started",
      patient: null,
      externalId: null,
      duplicateId: null,
      duplicate: "none",
      allowNew: false,
      operation: null,
      consentAt: null,
      policyUrl: null,
      transactionId: null,
      amount: null,
    },
  };
  database()
    .prepare("INSERT INTO requests VALUES(?,?,?,?,?,?,?,?,?)")
    .run(
      record.id,
      digest(token),
      record.order,
      record.payment,
      record.reference,
      seal(record.data),
      now,
      now,
      record.expires,
    );
  return { token, record };
}
export function save(r: BookingRecord) {
  const latest = fromRow(
    database().prepare("SELECT * FROM requests WHERE id=?").get(r.id) as
      | Row
      | undefined,
  );
  // Provider requests can finish after a payment webhook. Preserve that newer payment.
  if (latest && latest.updated !== r.updated) {
    r.payment = latest.payment;
    r.data.transactionId = latest.data.transactionId;
    r.data.amount = latest.data.amount;
  }
  r.updated = Math.max(Date.now(), (latest?.updated ?? r.updated) + 1);
  database()
    .prepare(
      "UPDATE requests SET state=?, payment=?, data=?, updated=? WHERE id=?",
    )
    .run(r.order, r.payment, seal(r.data), r.updated, r.id);
}
export function saveDraft(r: BookingRecord) {
  const updated = Math.max(Date.now(), r.updated + 1);
  const changed = database()
    .prepare(
      "UPDATE requests SET data=?,updated=? WHERE id=? AND state='draft' AND updated=?",
    )
    .run(seal(r.data), updated, r.id, r.updated);
  if (!changed.changes) throw new AppError("LOCKED", 409);
  r.updated = updated;
}
export function acquire(
  r: BookingRecord,
  document: string,
  operation: "create" | "reschedule",
): boolean {
  const db = database();
  db.exec("BEGIN IMMEDIATE");
  try {
    const current = db
      .prepare("SELECT state FROM requests WHERE id=?")
      .get(r.id) as { state: string };
    const expected = operation === "create" ? "draft" : "confirmed";
    if (current.state !== expected) {
      db.exec("ROLLBACK");
      return false;
    }
    const hash = privateDigest(document);
    const lock = db
      .prepare("SELECT request_id FROM document_locks WHERE document=?")
      .get(hash) as { request_id: string } | undefined;
    if (lock && lock.request_id !== r.id) {
      const previous = fromRow(
        db.prepare("SELECT * FROM requests WHERE id=?").get(lock.request_id) as
          | Row
          | undefined,
      );
      if (
        !r.data.allowNew ||
        previous?.order !== "confirmed" ||
        !r.data.duplicateId ||
        previous.data.externalId !== r.data.duplicateId
      )
        throw new AppError(previous?.order === "confirmed" ? "PREVIOUS_REQUEST" : "UNCERTAIN", 409);
      db.prepare("DELETE FROM document_locks WHERE document=?").run(hash);
    }
    db.prepare("INSERT OR IGNORE INTO document_locks VALUES(?,?)").run(
      hash,
      r.id,
    );
    r.order = operation === "create" ? "creating" : "rescheduling";
    r.data.operation = operation;
    save(r);
    db.exec("COMMIT");
    return true;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
export function release(r: BookingRecord) {
  database().prepare("DELETE FROM document_locks WHERE request_id=?").run(r.id);
}
export function rateLimit(identity: string, max = 90): void {
  const db = database(),
    key = privateDigest(identity),
    now = Date.now();
  const row = db
    .prepare(
      "INSERT INTO rate_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset<? THEN 1 ELSE count+1 END, reset=CASE WHEN reset<? THEN excluded.reset ELSE reset END RETURNING count",
    )
    .get(key, now + 60000, now, now) as { count: number };
  if (row.count > max) throw new AppError("RATE", 429);
  db.prepare("DELETE FROM rate_limits WHERE reset<?").run(now - 60000);
}
// Explicit retention tool: do not delete uncertain financial/clinical operations automatically.
export function purgeExpiredDrafts(): number {
  return Number(
    database()
      .prepare(
        "DELETE FROM requests WHERE expires<? AND state='draft' AND payment IN ('not_configured','not_required')",
      )
      .run(Date.now()).changes,
  );
}
