import {
  documentTypes,
  validDocument,
  type DocumentType,
} from "./booking-options";
export const exams = [
  {
    id: "osteomuscular",
    label: "Valoración médica ocupacional",
    provider: "EXAMEN MÉDICO OCUPACIONAL OSTEOMUSCULAR",
  },
  { id: "audiometria", label: "Audiometría", provider: "AUDIOMETRÍA" },
  { id: "visiometria", label: "Visiometría", provider: "VISIOMETRÍA" },
] as const;
export type ExamId = (typeof exams)[number]["id"];
export type DuplicateKind = "none" | "pendiente" | "expirado" | "atendido";
export type OrderState =
  | "draft"
  | "creating"
  | "confirmed"
  | "uncertain"
  | "rescheduling";
export type PaymentState =
  | "not_configured"
  | "not_required"
  | "manual_pending"
  | "pending"
  | "approved"
  | "declined"
  | "error"
  | "voided"
  | "abandoned";
export interface Patient {
  documentType: DocumentType;
  document: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  phone: string;
  account: "particular" | "empresa";
  company: string;
  job: string;
  city: string;
  exams: ExamId[];
  date: string;
  time: string;
  consent: boolean;
}
export const emptyPatient: Patient = {
  documentType: "CC",
  document: "",
  firstName: "",
  middleName: "",
  lastName: "",
  secondLastName: "",
  phone: "",
  account: "particular",
  company: "",
  job: "",
  city: "",
  exams: ["osteomuscular"],
  date: "",
  time: "",
  consent: false,
};
export interface BookingView {
  patient: Patient | null;
  order: OrderState;
  payment: PaymentState;
  attention: "not_started" | "pending" | "completed";
  reference: string;
  duplicate: DuplicateKind;
  hasOrder: boolean;
  amount: number | null;
}
export interface BookingConfig {
  demo: boolean;
  privacyUrl: string | null;
  paymentPolicy: "unconfigured" | "order-only" | "required";
  paymentReady: boolean;
  writesEnabled: boolean;
}
export type FieldErrors = Partial<Record<keyof Patient, string>>;
export function colombiaToday(now = new Date()): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return `${p.find((v) => v.type === "year")!.value}-${p.find((v) => v.type === "month")!.value}-${p.find((v) => v.type === "day")!.value}`;
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00-05:00`);
  if (Number.isNaN(date.getTime()) || colombiaToday(date) !== value)
    return false;
  const days =
    (date.getTime() - new Date(`${colombiaToday()}T12:00:00-05:00`).getTime()) /
    86400000;
  return days >= 0 && days <= 90;
}
export function validatePatient(p: Patient): FieldErrors {
  const e: FieldErrors = {};
  if (!documentTypes.some((d) => d.value === p.documentType))
    e.documentType = "Selecciona un tipo de documento válido.";
  if (!validDocument(p.documentType, p.document))
    e.document =
      p.documentType === "PASS" || p.documentType === "CE"
        ? "Escribe entre 3 y 20 letras mayúsculas o números, sin espacios."
        : "Escribe entre 5 y 15 dígitos, sin puntos.";
  for (const k of ["firstName", "lastName"] as const)
    if (!/^[\p{L}\p{M} '\-]{2,60}$/u.test(p[k]))
      e[k] = "Escribe un nombre válido (2 a 60 caracteres).";
  for (const k of ["middleName", "secondLastName"] as const)
    if (p[k] && !/^[\p{L}\p{M} '\-]{1,60}$/u.test(p[k]))
      e[k] = "Revisa este nombre.";
  if (!/^3\d{9}$/.test(p.phone))
    e.phone = "Escribe un celular colombiano de 10 dígitos.";
  if (!["particular", "empresa"].includes(p.account))
    e.account = "Selecciona a nombre de quién solicitas la cita.";
  if (
    p.account === "empresa" &&
    (p.company.trim().length < 2 || p.company.length > 120)
  )
    e.company = "Escribe el nombre de la empresa.";
  if (p.job.length > 100) e.job = "Usa máximo 100 caracteres.";
  if (p.city.trim().length < 2 || p.city.length > 80)
    e.city = "Escribe tu ciudad de residencia.";
  if (
    !p.exams.includes("osteomuscular") ||
    p.exams.length > exams.length ||
    p.exams.some((x) => !exams.some((v) => v.id === x)) ||
    new Set(p.exams).size !== p.exams.length
  )
    e.exams =
      "El examen médico es obligatorio. Revisa los servicios seleccionados.";
  if (!validDate(p.date))
    e.date = "Elige una fecha válida dentro de los próximos 90 días.";
  if (
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(p.time) ||
    (validDate(p.date) &&
      new Date(`${p.date}T${p.time}:00-05:00`).getTime() <= Date.now())
  )
    e.time = "Selecciona un horario futuro disponible.";
  if (p.consent !== true)
    e.consent = "Debes autorizar el tratamiento de datos para continuar.";
  return e;
}
export function parsePatient(value: unknown): Patient | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  for (const k of Object.keys(emptyPatient)) {
    if (k === "consent") {
      if (typeof v[k] !== "boolean") return null;
    } else if (k === "exams") {
      if (!Array.isArray(v[k]) || v[k].some((x) => typeof x !== "string"))
        return null;
    } else if (typeof v[k] !== "string" || (v[k] as string).length > 200)
      return null;
  }
  return Object.fromEntries(
    Object.keys(emptyPatient).map((k) => [
      k,
      typeof v[k] === "string" ? (v[k] as string).trim() : v[k],
    ]),
  ) as unknown as Patient;
}
