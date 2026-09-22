import { randomUUID } from "node:crypto";
import { exams, type Patient, type DuplicateKind } from "../lib/booking";
import { database, privateDigest } from "./store";
import { AppError } from "./errors";

export function isDemo(): boolean {
  const mode = process.env.MEDICONNECTA_MODE || "mock";
  if (!["mock", "live"].includes(mode)) throw new AppError("CONFIG");
  if (
    mode === "mock" &&
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DEMO !== "true"
  )
    throw new AppError("CONFIG");
  return mode === "mock";
}
export function baseUrl(): string {
  const url = new URL(
    process.env.MEDICONNECTA_BASE_URL || "https://vip-mediconecta.app",
  );
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.pathname !== "/"
  )
    throw new AppError("CONFIG");
  return url.origin;
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new AppError("PROVIDER");
  return value as Record<string, unknown>;
}
async function request(
  path: string,
  method = "GET",
  data?: unknown,
): Promise<Record<string, unknown>> {
  try {
    const r = await fetch(`${baseUrl()}${path}`, {
      method,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(12000),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    if (!r.ok) throw new AppError("PROVIDER");
    return object(await r.json());
  } catch {
    throw new AppError("PROVIDER");
  }
}
export async function configuration(): Promise<{
  tenant: string;
  company: string;
}> {
  if (isDemo()) return { tenant: "ipsVip", company: "PARTICULAR" };
  if (
    process.env.MEDICONNECTA_TENANT !== "ipsVip" ||
    !process.env.MEDICONNECTA_BASE_URL
  )
    throw new AppError("CONFIG");
  const cfg = object((await request("/api/tenants/config")).tenant);
  const defaults = object(cfg.orden_virtual);
  if (
    cfg.id !== "ipsVip" ||
    typeof defaults.codEmpresa !== "string" ||
    !defaults.codEmpresa
  )
    throw new AppError("CONFIG");
  return { tenant: "ipsVip", company: defaults.codEmpresa };
}
export async function availability(date: string): Promise<string[]> {
  await configuration();
  if (isDemo()) {
    // Explicit fixture schedule, never used in live mode.
    return ["09:00", "10:30", "14:00", "15:30"].filter(
      (t) => new Date(`${date}T${t}:00-05:00`).getTime() > Date.now(),
    );
  }
  const body = await request(
    `/api/turnos-disponibles?fecha=${encodeURIComponent(date)}&modalidad=virtual&codEmpresa=`,
  );
  if (!Array.isArray(body.turnos)) throw new AppError("PROVIDER");
  const slots = body.turnos.map(object);
  if (
    slots.some(
      (s) =>
        typeof s.disponible !== "boolean" ||
        typeof s.hora !== "string" ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.hora),
    )
  )
    throw new AppError("PROVIDER");
  return [
    ...new Set(slots.filter((s) => s.disponible).map((s) => s.hora as string)),
  ]
    .filter((t) => new Date(`${date}T${t}:00-05:00`).getTime() > Date.now())
    .sort();
}
export interface Existing {
  kind: DuplicateKind;
  id: string | null;
}
export async function duplicate(document: string): Promise<Existing> {
  await configuration();
  if (isDemo()) {
    const row = database()
      .prepare("SELECT id,state FROM mock_orders WHERE document=?")
      .get(privateDigest(document)) as
      | { id: string; state: DuplicateKind }
      | undefined;
    if (row) return { kind: row.state, id: row.id };
    const fixtures: Record<string, DuplicateKind> = {
      "900000001": "pendiente",
      "900000002": "expirado",
      "900000003": "atendido",
    };
    return {
      kind: fixtures[document] || "none",
      id: fixtures[document] ? `demo-existing-${document.slice(-1)}` : null,
    };
  }
  const result = await request(
    `/api/ordenes/verificar-duplicado/${encodeURIComponent(document)}`,
  );
  if (result.success !== true || typeof result.hayDuplicado !== "boolean")
    throw new AppError("PROVIDER");
  if (!result.hayDuplicado) return { kind: "none", id: null };
  if (!["pendiente", "expirado", "atendido"].includes(result.tipo as string))
    throw new AppError("PROVIDER");
  const id = object(result.ordenExistente)._id;
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id))
    throw new AppError("PROVIDER");
  return { kind: result.tipo as DuplicateKind, id };
}
function assertWrites() {
  if (!isDemo() && process.env.MEDICONNECTA_WRITES_ENABLED !== "true")
    throw new AppError("CONFIG");
}
export async function createOrder(p: Patient): Promise<string> {
  assertWrites();
  const cfg = await configuration();
  if (isDemo()) {
    if (p.document === "900000004") throw new AppError("PROVIDER");
    const id = `demo-${randomUUID()}`;
    database()
      .prepare(
        "INSERT INTO mock_orders VALUES(?,?,?,?,?) ON CONFLICT(document) DO UPDATE SET id=excluded.id,state=excluded.state,date=excluded.date,time=excluded.time",
      )
      .run(privateDigest(p.document), id, "pendiente", p.date, p.time);
    // The provider accepted this fixture but its response was lost.
    if (p.document === "900000005") throw new AppError("PROVIDER");
    return id;
  }
  const result = await request("/api/ordenes", "POST", {
    numeroId: p.document,
    primerNombre: p.firstName,
    segundoNombre: p.middleName || null,
    primerApellido: p.lastName,
    segundoApellido: p.secondLastName || null,
    celular: p.phone,
    tipoConsulta: "Telemedicina",
    codEmpresa: p.account === "particular" ? "PARTICULAR" : cfg.company,
    empresa: p.account === "particular" ? "PARTICULAR" : p.company,
    cargo: p.job || null,
    ciudad: p.city,
    fechaAtencion: p.date,
    horaAtencion: p.time,
    examenes: p.exams
      .map((id) => exams.find((e) => e.id === id)!.provider)
      .join(", "),
    tipoExamen: "Ingreso",
    atendido: "PENDIENTE",
    medico: null,
    asignarMedicoAuto: true,
    modalidad: "virtual",
  });
  const id = result.success === true ? object(result.data)._id : null;
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(id))
    throw new AppError("PROVIDER");
  return id;
}
export async function reschedule(
  id: string,
  date: string,
  time: string,
): Promise<void> {
  assertWrites();
  await configuration();
  if (isDemo()) {
    database()
      .prepare("UPDATE mock_orders SET date=?,time=? WHERE id=?")
      .run(date, time, id);
    return;
  }
  const result = await request(
    `/api/ordenes/${encodeURIComponent(id)}/fecha-atencion`,
    "PATCH",
    { fechaAtencion: date, horaAtencion: time },
  );
  if (result.success !== true) throw new AppError("PROVIDER");
}
export async function checkOwnedOrder(
  id: string,
  document: string,
): Promise<{ date: string; time: string } | null> {
  if (isDemo()) {
    const row = database()
      .prepare("SELECT date,time FROM mock_orders WHERE id=? AND document=?")
      .get(id, privateDigest(document)) as
      | { date: string; time: string }
      | undefined;
    return row || null;
  }
  const result = await request(`/api/ordenes/${encodeURIComponent(id)}`);
  const data = object(result.data);
  if (
    result.success !== true ||
    data._id !== id ||
    String(data.numeroId) !== document ||
    typeof data.fechaAtencion !== "string"
  )
    throw new AppError("PROVIDER");
  const d = new Date(data.fechaAtencion);
  if (Number.isNaN(d.getTime())) throw new AppError("PROVIDER");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}
