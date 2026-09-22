import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  emptyPatient,
  validatePatient,
  colombiaToday,
  parsePatient,
  type Patient,
} from "../src/lib/booking";
import {
  createSession,
  getSession,
  database,
  saveDraft,
} from "../src/server/store";
import {
  updateDraft,
  create,
  checkDuplicate,
  reconcile,
  changeDate,
  publicConfig,
  allowNew,
} from "../src/server/booking-service";
import { availability, configuration } from "../src/server/mediconecta";
import { verifyEvent, paymentReady } from "../src/server/payments";
process.env.DATA_DIR = mkdtempSync(join(tmpdir(), "vip-tests-"));
process.env.MEDICONNECTA_MODE = "mock";
process.env.PAYMENT_POLICY = "unconfigured";
const date = colombiaToday(new Date(Date.now() + 86400000));
function patient(document = "910000001"): Patient {
  return {
    ...emptyPatient,
    document,
    firstName: "Paciente",
    lastName: "Prueba",
    phone: "3000000000",
    city: "Bogotá",
    date,
    time: "09:00",
    consent: true,
  };
}
async function draft(document?: string) {
  const s = createSession();
  await updateDraft(s.record, patient(document));
  return s;
}
test("validaciones rechazan datos incompletos, fechas imposibles y servicio no permitido", () => {
  assert.ok(validatePatient({ ...patient(), phone: "123" }).phone);
  assert.ok(validatePatient({ ...patient(), date: "2026-02-31" }).date);
  assert.ok(validatePatient({ ...patient(), consent: false }).consent);
  assert.equal(parsePatient({ document: "123" }), null);
  assert.deepEqual(validatePatient(patient()), {});
});
test("configuración de demostración explícita y sin pagos", async () => {
  const c = await publicConfig();
  assert.equal(c.demo, true);
  assert.equal(c.paymentReady, false);
  assert.equal((await configuration()).tenant, "ipsVip");
});
test("persistencia cifrada y aislamiento entre sesiones", async () => {
  const a = await draft();
  const b = createSession();
  assert.equal(getSession(a.token)?.data.patient?.firstName, "Paciente");
  assert.equal(getSession(b.token)?.data.patient, null);
  assert.equal(getSession("invalid"), null);
  const raw = database()
    .prepare("SELECT data FROM requests WHERE id=?")
    .get(a.record.id) as { data: string };
  assert.ok(!raw.data.includes("Paciente"));
  assert.ok(
    !readFileSync(join(process.env.DATA_DIR!, "requests.mock.sqlite")).includes(
      Buffer.from("910000001"),
    ),
  );
});
test("orden nueva: doble clic y reintento devuelven una sola orden", async () => {
  const a = await draft("910000002");
  const outcomes = await Promise.allSettled([
    create(getSession(a.token)!),
    create(getSession(a.token)!),
  ]);
  assert.ok(outcomes.some((o) => o.status === "fulfilled"));
  const first = getSession(a.token)!;
  assert.equal(first.order, "confirmed");
  await create(first);
  assert.equal(getSession(a.token)!.data.externalId, first.data.externalId);
  assert.equal(first.payment, "not_configured");
});
test("borrador tardío no sobrescribe una orden confirmada", async () => {
  const a = await draft("910000003");
  const stale = getSession(a.token)!;
  await create(getSession(a.token)!);
  assert.throws(() => saveDraft(stale));
  assert.equal(getSession(a.token)?.order, "confirmed");
});
test("casos pendiente, vencido y atendido no crean otra orden automáticamente", async () => {
  for (const [doc, kind] of [
    ["900000001", "pendiente"],
    ["900000002", "expirado"],
    ["900000003", "atendido"],
  ]) {
    const a = await draft(doc);
    assert.equal((await checkDuplicate(getSession(a.token)!)).kind, kind);
    await assert.rejects(create(getSession(a.token)!));
    assert.equal(getSession(a.token)!.order, "draft");
  }
});
test("nueva atención tras duplicado necesita elección explícita", async () => {
  const a = await draft("900000003");
  await checkDuplicate(getSession(a.token)!);
  allowNew(getSession(a.token)!);
  await create(getSession(a.token)!);
  assert.equal(getSession(a.token)!.order, "confirmed");
});
test("horario desaparecido se rechaza antes de enviar", async () => {
  const a = await draft("910000004");
  const r = getSession(a.token)!;
  r.data.patient!.time = "12:37";
  saveDraft(r);
  await assert.rejects(create(getSession(a.token)!), /SLOT/);
  assert.equal(getSession(a.token)!.order, "draft");
});
test("fallo ambiguo mantiene bloqueo incluso desde otra sesión", async () => {
  const a = await draft("900000004");
  await assert.rejects(create(getSession(a.token)!), /UNCERTAIN/);
  await reconcile(getSession(a.token)!);
  assert.equal(getSession(a.token)!.order, "uncertain");
  const b = await draft("900000004");
  await assert.rejects(create(getSession(b.token)!), /UNCERTAIN/);
});
test("respuesta perdida después de crear: consulta recupera sin duplicar", async () => {
  const a = await draft("900000005");
  await assert.rejects(create(getSession(a.token)!));
  await reconcile(getSession(a.token)!);
  assert.equal(getSession(a.token)!.order, "confirmed");
});
test("reagendar conserva identificador", async () => {
  const a = await draft("910000006");
  await create(getSession(a.token)!);
  const id = getSession(a.token)!.data.externalId;
  await changeDate(getSession(a.token)!, date, "14:00");
  assert.equal(getSession(a.token)!.data.externalId, id);
  assert.equal(getSession(a.token)!.data.patient!.time, "14:00");
});
test("cambio a live jamás usa horarios de simulación ni un tenant incorrecto", async () => {
  process.env.MEDICONNECTA_MODE = "live";
  process.env.MEDICONNECTA_TENANT = "bsl";
  try {
    await assert.rejects(availability(date), /CONFIG/);
  } finally {
    process.env.MEDICONNECTA_MODE = "mock";
    delete process.env.MEDICONNECTA_TENANT;
  }
});
test("firma Wompi verifica integridad y rechaza manipulación", () => {
  const secret = "test-only-not-a-credential";
  const transaction = {
    id: "test-123",
    status: "APPROVED",
    amount_in_cents: 50000,
  };
  const timestamp = 123456789;
  const checksum = createHash("sha256")
    .update(`test-123APPROVED50000${timestamp}${secret}`)
    .digest("hex");
  const e = {
    event: "transaction.updated",
    environment: "test",
    timestamp,
    data: { transaction },
    signature: {
      properties: [
        "transaction.id",
        "transaction.status",
        "transaction.amount_in_cents",
      ],
      checksum,
    },
  };
  assert.equal(verifyEvent(e, secret).transaction.id, "test-123");
  assert.throws(() =>
    verifyEvent(
      { ...e, data: { transaction: { ...transaction, amount_in_cents: 1 } } },
      secret,
    ),
  );
  assert.equal(paymentReady(), false);
});
