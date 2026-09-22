import { test } from "node:test";
import assert from "node:assert/strict";
import { serviceTotal } from "../src/lib/service-pricing";
import { validDocument, documentTypes } from "../src/lib/booking-options";
import {
  emptyPatient,
  validatePatient,
  colombiaToday,
} from "../src/lib/booking";
import { price } from "../src/server/payments";

test("tarifa fija: médico 43.000; uno o ambos adicionales total 52.000", () => {
  assert.equal(serviceTotal(["osteomuscular"]), 43000);
  assert.equal(serviceTotal(["osteomuscular", "audiometria"]), 52000);
  assert.equal(serviceTotal(["osteomuscular", "visiometria"]), 52000);
  assert.equal(
    serviceTotal(["osteomuscular", "audiometria", "visiometria"]),
    52000,
  );
  assert.equal(serviceTotal(["audiometria"]), null);
  assert.equal(serviceTotal([]), null);
  assert.equal(
    price({
      ...emptyPatient,
      exams: ["osteomuscular", "audiometria", "visiometria"],
    }),
    5200000,
  );
});
test("documentos permitidos conservan pasaporte alfanumérico y rechazan rutas", () => {
  for (const d of documentTypes)
    assert.equal(validDocument(d.value, "123456789"), true);
  assert.equal(validDocument("PASS", "AB123456"), true);
  assert.equal(validDocument("CC", "AB123456"), false);
  assert.equal(validDocument("PASS", "../12345"), false);
  assert.equal(validDocument("FAKE", "123456789"), false);
});
test("servidor exige examen médico aunque el cliente intente quitarlo", () => {
  const p = {
    ...emptyPatient,
    firstName: "Paciente",
    lastName: "Prueba",
    document: "123456789",
    phone: "3000000000",
    job: "Contratista",
    city: "Bogotá D.C.",
    date: colombiaToday(new Date(Date.now() + 86400000)),
    time: "09:00",
    consent: true,
  };
  assert.ok(validatePatient({ ...p, exams: ["audiometria"] }).exams);
  assert.deepEqual(
    validatePatient({ ...p, documentType: "PASS", document: "AB123456" }),
    {},
  );
});
