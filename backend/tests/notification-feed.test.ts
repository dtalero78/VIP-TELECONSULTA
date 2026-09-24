import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { createVipServer } from "../src/server";
import { createSession, save } from "../src/server/store";
import { emptyPatient } from "../src/lib/booking";

process.env.DATA_DIR = mkdtempSync(join(tmpdir(), "vip-feed-tests-"));
process.env.MEDICONNECTA_MODE = "mock";
process.env.DATA_ENCRYPTION_KEY = "b".repeat(64);
const token = "c".repeat(64);
const app = createVipServer();
let base: string;
before(async () => {
  await new Promise<void>(resolve => app.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(app.address() as AddressInfo).port}/api/notifications/appointments`;
});
after(async () => { await new Promise<void>((resolve, reject) => app.close(e => e ? reject(e) : resolve())); });

test("feed is disabled without token, rejects patient tokens and exposes only operational fields", async () => {
  delete process.env.NOTIFICATIONS_READ_TOKEN;
  assert.equal((await fetch(base)).status, 403);
  process.env.NOTIFICATIONS_READ_TOKEN = token;
  const session = createSession();
  assert.equal((await fetch(base, { headers: { Authorization: `Bearer ${session.token}` } })).status, 403);
  session.record.order = "confirmed";
  session.record.data.externalId = "known-provider-order";
  session.record.data.patient = { ...emptyPatient, firstName: "SECRET_NAME", document: "SECRET_DOCUMENT", date: "2027-01-10", time: "10:30" };
  save(session.record);
  const response = await fetch(base, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  const text = await response.text();
  assert.ok(!text.includes("SECRET_DOCUMENT") && !text.includes(session.token));
  const body = JSON.parse(text);
  assert.deepEqual(Object.keys(body.appointments[0]).sort(), ["id", "version", "startsAt", "status", "payment", "form", "doctorId", "patientName"].sort());
  assert.equal(body.appointments[0].patientName, 'SECRET_NAME');
  assert.equal(body.appointments[0].id, "known-provider-order");
  assert.equal(body.nextCursor, null);
  assert.equal((await fetch(base + '?after=..%2F', { headers: { Authorization: `Bearer ${token}` } })).status, 400);
});

test("feed paginates without exposing drafts or duplicating orders", async () => {
  process.env.NOTIFICATIONS_READ_TOKEN = token;
  for (let i = 0; i < 105; i++) {
    const { record } = createSession();
    record.order = "confirmed";
    record.data.externalId = `page-order-${i}`;
    record.data.patient = { ...emptyPatient, date: "2027-01-10", time: "10:30" };
    save(record);
  }
  createSession();
  const ids: string[] = [];
  let cursor = "";
  do {
    const r = await fetch(base + (cursor ? `?after=${cursor}` : ''), { headers: { Authorization: `Bearer ${token}` } });
    const body = await r.json() as { appointments: Array<{ id: string }>; nextCursor: string | null };
    ids.push(...body.appointments.map(a => a.id));
    cursor = body.nextCursor || "";
  } while (cursor);
  assert.equal(ids.length, 106);
  assert.equal(new Set(ids).size, ids.length);
});
