import { createHash, timingSafeEqual } from "node:crypto";
import type { Patient, PaymentState } from "../lib/booking";
import { AppError } from "./errors";
import { database, getByReference, save, type BookingRecord } from "./store";
import { isDemo } from "./mediconecta";
import { serviceTotal } from "../lib/service-pricing";
import { frontendUrl } from "../config";

export function paymentPolicy(): "unconfigured" | "order-only" | "required" {
  const p = process.env.PAYMENT_POLICY || "unconfigured";
  if (!["unconfigured", "order-only", "required"].includes(p))
    throw new AppError("CONFIG");
  return p as "unconfigured" | "order-only" | "required";
}
export function paymentReady(): boolean {
  const env = process.env.WOMPI_ENVIRONMENT;
  const prefix = env === "production" ? "prod_" : "test_";
  return (
    !isDemo() &&
    ["sandbox", "production"].includes(env || "") &&
    !!process.env.WOMPI_PUBLIC_KEY?.startsWith(prefix + "pub_") &&
    !!process.env.WOMPI_INTEGRITY_SECRET &&
    !!process.env.WOMPI_EVENTS_SECRET
  );
}
export function price(p: Patient): number {
  const total = serviceTotal(p.exams);
  if (total === null) throw new AppError("PAYMENT");
  return total * 100;
}
export function checkout(r: BookingRecord): { url: string } {
  if (
    !paymentReady() ||
    r.order !== "confirmed" ||
    r.payment === "approved" ||
    !r.data.amount
  )
    throw new AppError("PAYMENT", 409);
  const amount = r.data.amount;
  const signature = createHash("sha256")
    .update(`${r.reference}${amount}COP${process.env.WOMPI_INTEGRITY_SECRET}`)
    .digest("hex");
  const url = new URL("https://checkout.wompi.co/p/");
  url.search = new URLSearchParams({
    "public-key": process.env.WOMPI_PUBLIC_KEY!,
    currency: "COP",
    "amount-in-cents": String(amount),
    reference: r.reference,
    "signature:integrity": signature,
    "redirect-url": frontendUrl("/examenes-virtuales/resultado/"),
  }).toString();
  // No document, names or contact details in checkout URL.
  r.payment = "pending";
  save(r);
  return { url: url.toString() };
}
type JsonObject = Record<string, unknown>;
function obj(x: unknown): JsonObject {
  if (!x || typeof x !== "object" || Array.isArray(x))
    throw new AppError("FORBIDDEN", 400);
  return x as JsonObject;
}
export function verifyEvent(
  input: unknown,
  secret: string,
): { transaction: JsonObject; checksum: string; environment: string } {
  const event = obj(input),
    signature = obj(event.signature),
    data = obj(event.data);
  if (
    event.event !== "transaction.updated" ||
    !Number.isSafeInteger(event.timestamp) ||
    !Array.isArray(signature.properties) ||
    signature.properties.length < 3 ||
    signature.properties.length > 20
  )
    throw new AppError("FORBIDDEN", 400);
  let concatenated = "";
  for (const path of signature.properties) {
    if (
      typeof path !== "string" ||
      !/^[a-zA-Z0-9_.]+$/.test(path) ||
      path
        .split(".")
        .some((k) => ["__proto__", "constructor", "prototype"].includes(k))
    )
      throw new AppError("FORBIDDEN", 400);
    let v: unknown = data;
    for (const k of path.split(".")) {
      const o = obj(v);
      if (!Object.hasOwn(o, k)) throw new AppError("FORBIDDEN", 400);
      v = o[k];
    }
    if (
      typeof v !== "string" &&
      typeof v !== "number" &&
      typeof v !== "boolean"
    )
      throw new AppError("FORBIDDEN", 400);
    concatenated += String(v);
  }
  if (
    typeof signature.checksum !== "string" ||
    !/^[a-f\d]{64}$/i.test(signature.checksum)
  )
    throw new AppError("FORBIDDEN", 400);
  const expected = createHash("sha256")
    .update(concatenated + String(event.timestamp) + secret)
    .digest();
  if (!timingSafeEqual(expected, Buffer.from(signature.checksum, "hex")))
    throw new AppError("FORBIDDEN", 400);
  return {
    transaction: obj(data.transaction),
    checksum: signature.checksum.toLowerCase(),
    environment: String(event.environment),
  };
}
export async function processEvent(input: unknown) {
  if (!paymentReady()) throw new AppError("PAYMENT");
  const event = verifyEvent(input, process.env.WOMPI_EVENTS_SECRET!);
  const expectedEnv =
    process.env.WOMPI_ENVIRONMENT === "production" ? "prod" : "test";
  if (
    event.environment !== expectedEnv ||
    typeof event.transaction.id !== "string" ||
    !/^[a-zA-Z0-9-]+$/.test(event.transaction.id)
  )
    throw new AppError("FORBIDDEN", 400);
  // Read back from Wompi: reference/currency may not be part of the signed properties.
  const host = expectedEnv === "prod" ? "production" : "sandbox";
  const response = await fetch(
    `https://${host}.wompi.co/v1/transactions/${encodeURIComponent(event.transaction.id)}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${process.env.WOMPI_PUBLIC_KEY}` },
    },
  );
  if (!response.ok) throw new AppError("PROVIDER");
  const t = obj(obj(await response.json()).data);
  if (t.id !== event.transaction.id || typeof t.reference !== "string")
    throw new AppError("FORBIDDEN", 400);
  const r = getByReference(t.reference);
  if (
    !r ||
    r.order !== "confirmed" ||
    t.currency !== "COP" ||
    t.amount_in_cents !== r.data.amount
  )
    throw new AppError("FORBIDDEN", 400);
  const states: Record<string, PaymentState> = {
    APPROVED: "approved",
    DECLINED: "declined",
    ERROR: "error",
    VOIDED: "voided",
    PENDING: "pending",
  };
  const state = states[String(t.status)];
  if (!state) throw new AppError("PROVIDER");
  const db = database();
  db.exec("BEGIN IMMEDIATE");
  try {
    if (
      db
        .prepare("SELECT key FROM payment_events WHERE key=?")
        .get(event.checksum)
    ) {
      db.exec("COMMIT");
      return;
    }
    if (
      r.payment !== "approved" ||
      (state === "voided" && r.data.transactionId === t.id)
    ) {
      r.payment = state;
      r.data.transactionId = String(t.id);
      save(r);
    }
    db.prepare("INSERT INTO payment_events VALUES(?,?)").run(
      event.checksum,
      Date.now(),
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
