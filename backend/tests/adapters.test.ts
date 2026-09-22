import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { configuration, availability, createOrder, duplicate } from "../src/server/mediconecta";
import { emptyPatient, colombiaToday } from "../src/lib/booking";
import { createSession, getSession, save } from "../src/server/store";
import { processEvent, checkout } from "../src/server/payments";

process.env.DATA_DIR = mkdtempSync(join(tmpdir(), "vip-adapter-tests-"));
process.env.MEDICONNECTA_MODE = "live";
process.env.MEDICONNECTA_TENANT = "ipsVip";
process.env.MEDICONNECTA_BASE_URL = "https://provider.example";
process.env.MEDICONNECTA_WRITES_ENABLED = "true";
process.env.WOMPI_ENVIRONMENT = "sandbox";
process.env.WOMPI_PUBLIC_KEY = "test_pub_unit-fixture";
process.env.WOMPI_INTEGRITY_SECRET = "unit-test-integrity";
process.env.WOMPI_EVENTS_SECRET = "unit-test-events";
process.env.EXAM_PRICES_JSON = '{"osteomuscular":50000}';
process.env.APP_ORIGIN = "https://web.example";
const originalFetch = global.fetch;
function stub(handler: (url: string, init?: RequestInit) => unknown) {
  global.fetch = async (input, init) => Response.json(handler(String(input), init));
}
const config = { tenant: { id: "ipsVip", orden_virtual: { codEmpresa: "PARTICULAR" } } };
const tomorrow = colombiaToday(new Date(Date.now() + 86400000));

test("contrato de configuración, disponibilidad y creación con fetch simulado", async () => {
  let calls = 0;
  stub((url, init) => {
    if (url.endsWith("/api/tenants/config")) return config;
    if (url.includes("/api/turnos-disponibles")) return { turnos: [{ hora: "10:30", disponible: true }, { hora: "11:00", disponible: false }] };
    if (url.endsWith("/api/ordenes")) {
      calls++;
      const data = JSON.parse(String(init?.body));
      assert.equal(init?.method, "POST");
      assert.equal(data.codEmpresa, "PARTICULAR");
      assert.equal(data.asignarMedicoAuto, true);
      assert.equal(data.medico, null);
      assert.equal(data.examenes, "EXAMEN MÉDICO OCUPACIONAL OSTEOMUSCULAR");
      return { success: true, data: { _id: "fixture-order-1" } };
    }
    throw new Error("Unexpected test URL");
  });
  try {
    assert.equal((await configuration()).tenant, "ipsVip");
    assert.deepEqual(await availability(tomorrow), ["10:30"]);
    assert.equal(await createOrder({ ...emptyPatient, document: "999000111", date: tomorrow, time: "10:30" }), "fixture-order-1");
    assert.equal(calls, 1);
  } finally { global.fetch = originalFetch; }
});

test("tenant ajeno, cupos inesperados y duplicado incompleto fallan de forma cerrada", async () => {
  try {
    stub(() => ({ tenant: { id: "bsl", orden_virtual: { codEmpresa: "OTHER" } } }));
    await assert.rejects(configuration(), /CONFIG/);
    stub(url => url.endsWith("config") ? config : { turnos: [{ hora: "10:00", disponible: "yes" }] });
    await assert.rejects(availability(tomorrow), /PROVIDER/);
    stub(url => url.endsWith("config") ? config : { success: true, hayDuplicado: true, tipo: "pendiente", ordenExistente: {} });
    await assert.rejects(duplicate("999000111"), /PROVIDER/);
  } finally { global.fetch = originalFetch; }
});

function event(id: string, status: string, amount = 50000) {
  const timestamp = Math.floor(Date.now() / 1000);
  return { event: "transaction.updated", environment: "test", timestamp,
    data: { transaction: { id, status, amount_in_cents: amount } },
    signature: { properties: ["transaction.id", "transaction.status", "transaction.amount_in_cents"],
      checksum: createHash("sha256").update(`${id}${status}${amount}${timestamp}${process.env.WOMPI_EVENTS_SECRET}`).digest("hex") } };
}
test("webhook consulta Wompi, verifica monto, es idempotente y no degrada aprobación", async () => {
  const s = createSession();
  s.record.order = "confirmed"; s.record.data.amount = 50000; s.record.payment = "pending"; save(s.record);
  let status = "APPROVED", amount = 50000;
  stub(() => ({ data: { id: "fixture-tx-1", reference: s.record.reference, status, currency: "COP", amount_in_cents: amount } }));
  try {
    amount = 1;
    await assert.rejects(processEvent(event("fixture-tx-1", "APPROVED")), /FORBIDDEN/);
    assert.equal(getSession(s.token)!.payment, "pending");
    amount = 50000;
    await processEvent(event("fixture-tx-1", "APPROVED"));
    await processEvent(event("fixture-tx-1", "APPROVED"));
    assert.equal(getSession(s.token)!.payment, "approved");
    status = "PENDING";
    await processEvent(event("fixture-tx-1", "PENDING"));
    assert.equal(getSession(s.token)!.payment, "approved");
  } finally { global.fetch = originalFetch; }
});
test("webhook cubre rechazo, error y anulación sin aprobar por redirección", async () => {
  for (const [status, state] of [["DECLINED", "declined"], ["ERROR", "error"], ["VOIDED", "voided"]]) {
    const s = createSession(); s.record.order = "confirmed"; s.record.payment = "pending"; s.record.data.amount = 50000; save(s.record);
    const id = `fixture-${status}`;
    stub(() => ({ data: { id, reference: s.record.reference, status, currency: "COP", amount_in_cents: 50000 } }));
    try { await processEvent(event(id, status)); assert.equal(getSession(s.token)!.payment, state); }
    finally { global.fetch = originalFetch; }
  }
});
test("checkout solo contiene referencia, monto y firma; nunca datos de paciente", () => {
  const s = createSession(); s.record.order = "confirmed"; s.record.data.amount = 50000;
  s.record.data.patient = { ...emptyPatient, document: "999000111", phone: "3000000000", firstName: "Paciente" }; save(s.record);
  const result = checkout(getSession(s.token)!);
  assert.ok(!result.url.includes("999000111")); assert.ok(!result.url.includes("3000000000")); assert.ok(!result.url.includes("Paciente"));
  assert.equal(getSession(s.token)!.payment, "pending");
});
