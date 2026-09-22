import {
  parsePatient,
  validatePatient,
  type BookingView,
  type BookingConfig,
} from "../lib/booking";
import * as provider from "./mediconecta";
import { PRIVACY_PATH } from "../lib/privacy";
import { AppError } from "./errors";
import {
  acquire,
  save,
  saveDraft,
  database,
  privateDigest,
  type BookingRecord,
} from "./store";
import { paymentPolicy, paymentReady, price } from "./payments";
import { validDocument } from "../lib/booking-options";
import { serviceTotal } from "../lib/service-pricing";

export function publicView(r: BookingRecord): BookingView {
  return {
    patient: r.data.patient,
    order: r.order,
    payment: r.payment,
    attention:
      r.data.attention || (r.data.externalId ? "pending" : "not_started"),
    reference: r.reference,
    duplicate: r.data.duplicate,
    hasOrder: !!r.data.externalId,
    amount: r.data.amount,
  };
}
export async function publicConfig(): Promise<BookingConfig> {
  await provider.configuration();
  const demo = provider.isDemo(),
    url = process.env.PRIVACY_POLICY_URL || PRIVACY_PATH;
  if (url !== PRIVACY_PATH && !url.startsWith("https://")) throw new AppError("CONFIG");
  return {
    demo,
    privacyUrl: url,
    paymentPolicy: paymentPolicy(),
    paymentReady: paymentReady(),
    writesEnabled: demo || process.env.MEDICONNECTA_WRITES_ENABLED === "true",
  };
}
export async function updateDraft(r: BookingRecord, value: unknown) {
  if (r.order !== "draft") throw new AppError("LOCKED", 409);
  const p = parsePatient(value);
  if (!p) throw new AppError("INVALID", 400);
  // Drafts may be incomplete, but never persist without consent.
  if (!p.consent)
    throw new AppError("INVALID", 400, {
      consent: "Autoriza el tratamiento antes de guardar.",
    });
  const config = await publicConfig();
  if (
    r.data.patient?.document !== p.document ||
    r.data.patient?.documentType !== p.documentType
  ) {
    r.data.duplicate = "none";
    r.data.duplicateId = null;
    r.data.allowNew = false;
  }
  r.data.patient = p;
  r.data.consentAt ||= new Date().toISOString();
  r.data.policyUrl = config.privacyUrl;
  saveDraft(r);
}
export async function checkDuplicate(r: BookingRecord) {
  if (
    r.order !== "draft" ||
    !r.data.patient ||
    !validDocument(r.data.patient.documentType, r.data.patient.document)
  )
    throw new AppError("INVALID", 400);
  const existing = await provider.duplicate(r.data.patient.document);
  r.data.duplicate = existing.kind;
  r.data.duplicateId = existing.id;
  saveDraft(r);
  return { kind: existing.kind };
}
export async function create(r: BookingRecord): Promise<void> {
  if (r.order === "confirmed") return;
  if (r.order !== "draft") throw new AppError("UNCERTAIN", 409);
  const p = r.data.patient;
  if (!p) throw new AppError("INVALID", 400);
  const errors = validatePatient(p);
  if (Object.keys(errors).length) throw new AppError("INVALID", 400, errors);
  const cfg = await publicConfig();
  if (!cfg.writesEnabled) throw new AppError("CONFIG");
  if (
    !cfg.demo &&
    (cfg.paymentPolicy === "unconfigured" ||
      (cfg.paymentPolicy === "required" && !cfg.paymentReady))
  )
    throw new AppError("PAYMENT");
  const duplicate = await provider.duplicate(p.document);
  if (
    duplicate.kind !== "none" &&
    (!r.data.allowNew || duplicate.id !== r.data.duplicateId)
  ) {
    r.data.duplicate = duplicate.kind;
    r.data.duplicateId = duplicate.id;
    saveDraft(r);
    throw new AppError("DUPLICATE", 409);
  }
  if (!(await provider.availability(p.date)).includes(p.time))
    throw new AppError("SLOT", 409);
  r.data.amount =
    cfg.paymentPolicy === "required" && !cfg.demo
      ? price(p)
      : serviceTotal(p.exams) === null
        ? null
        : serviceTotal(p.exams)! * 100;
  r.payment = cfg.demo
    ? "not_configured"
    : cfg.paymentPolicy === "required"
      ? "pending"
      : "manual_pending";
  if (!acquire(r, p.document, "create")) throw new AppError("LOCKED", 409);
  try {
    r.data.externalId = await provider.createOrder(p);
    r.data.attention = "pending";
    r.order = "confirmed";
    save(r);
  } catch {
    r.order = "uncertain";
    save(r);
    throw new AppError("UNCERTAIN", 409);
  }
}
export async function reconcile(r: BookingRecord) {
  if (
    !["uncertain", "creating", "rescheduling"].includes(r.order) ||
    !r.data.patient
  )
    return;
  if (r.order !== "uncertain" && Date.now() - r.updated < 20000) return;
  // Never retry creation after an ambiguous response. Only mock records can be
  // reconciled by document without an authenticated provider operation reference.
  if (provider.isDemo() && r.data.operation === "create") {
    const result = await provider.duplicate(r.data.patient.document);
    if (result.id && result.id !== r.data.duplicateId) {
      r.data.externalId = result.id;
      r.data.attention = "pending";
      r.order = "confirmed";
      save(r);
      return;
    }
  }
  if (r.data.operation === "reschedule" && r.data.externalId) {
    const result = await provider.checkOwnedOrder(
      r.data.externalId,
      r.data.patient.document,
    );
    if (
      result?.date === r.data.patient.date &&
      result?.time === r.data.patient.time
    ) {
      r.order = "confirmed";
      save(r);
      return;
    }
  }
  r.order = "uncertain";
  save(r);
}
export async function changeDate(r: BookingRecord, date: string, time: string) {
  if (r.order !== "confirmed" || !r.data.externalId || !r.data.patient)
    throw new AppError("IDENTITY", 403);
  const updated = { ...r.data.patient, date, time };
  const errors = validatePatient(updated);
  if (errors.date || errors.time) throw new AppError("INVALID", 400, errors);
  if (!(await provider.checkOwnedOrder(r.data.externalId, updated.document)))
    throw new AppError("IDENTITY", 403);
  if (!(await provider.availability(date)).includes(time))
    throw new AppError("SLOT", 409);
  if (!acquire(r, updated.document, "reschedule"))
    throw new AppError("LOCKED", 409);
  r.data.patient = updated;
  save(r);
  try {
    await provider.reschedule(r.data.externalId, date, time);
    r.order = "confirmed";
    save(r);
  } catch {
    r.order = "uncertain";
    save(r);
    throw new AppError("UNCERTAIN", 409);
  }
}
export function allowNew(r: BookingRecord) {
  if (r.order !== "draft" || r.data.duplicate === "none")
    throw new AppError("INVALID", 400);
  r.data.allowNew = true;
  saveDraft(r);
}
export function adoptDemoExisting(r: BookingRecord) {
  if (
    !provider.isDemo() ||
    !r.data.duplicateId ||
    r.data.duplicate === "none" ||
    r.order !== "draft"
  )
    throw new AppError("IDENTITY", 403);
  if (!r.data.patient) throw new AppError("INVALID", 400);
  database()
    .prepare("INSERT OR IGNORE INTO mock_orders VALUES(?,?,?,?,?)")
    .run(
      privateDigest(r.data.patient.document),
      r.data.duplicateId,
      r.data.duplicate,
      r.data.patient.date,
      r.data.patient.time,
    );
  r.data.externalId = r.data.duplicateId;
  r.data.attention = r.data.duplicate === "atendido" ? "completed" : "pending";
  r.order = "confirmed";
  save(r);
}
