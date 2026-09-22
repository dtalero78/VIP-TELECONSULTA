import { exams } from "../lib/booking";
import type { BookingRecord } from "./store";

type BookingNotificationKind = "created" | "rescheduled";

type PreviousSchedule = {
  date: string;
  time: string;
};

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function enabled(): boolean {
  return process.env.EMAIL_NOTIFICATIONS_ENABLED === "true";
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`EMAIL_CONFIG_${name}`);
  return value;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("es-CO", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "long",
      day: "2-digit",
    }).format(new Date(`${value}T12:00:00-05:00`));
  } catch {
    return value;
  }
}

function formatTime(value: string): string {
  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return value;
  const period = hour >= 12 ? "p. m." : "a. m.";
  const normalized = hour % 12 || 12;
  return `${normalized}:${String(minute).padStart(2, "0")} ${period}`;
}

function recipients(): Array<{ email: string }> {
  const values = required("BOOKING_NOTIFICATION_TO")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!values.length || values.some((email) => !EMAIL_RE.test(email)))
    throw new Error("EMAIL_CONFIG_BOOKING_NOTIFICATION_TO");
  return values.map((email) => ({ email }));
}

function fullName(record: BookingRecord): string {
  const patient = record.data.patient;
  if (!patient) return "Paciente sin nombre";
  return [
    patient.firstName,
    patient.middleName,
    patient.lastName,
    patient.secondLastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function examLabels(record: BookingRecord): string[] {
  const selected = new Set(record.data.patient?.exams ?? []);
  return exams.filter((exam) => selected.has(exam.id)).map((exam) => exam.label);
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#52657a;vertical-align:top">${escapeHtml(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#10253f;font-weight:600">${escapeHtml(value)}</td>
  </tr>`;
}

function buildMessage(
  kind: BookingNotificationKind,
  record: BookingRecord,
  previous?: PreviousSchedule,
): { subject: string; htmlContent: string; textContent: string } {
  const patient = record.data.patient;
  if (!patient) throw new Error("EMAIL_BOOKING_WITHOUT_PATIENT");

  const name = fullName(record);
  const date = formatDate(patient.date);
  const time = formatTime(patient.time);
  const title =
    kind === "created" ? "Nueva cita virtual agendada" : "Cita virtual reprogramada";
  const subject =
    kind === "created"
      ? `Nueva cita virtual - ${date} ${time}`
      : `Cita reprogramada - ${date} ${time}`;

  const selectedExams = examLabels(record);
  const examList = selectedExams.length ? selectedExams.join(", ") : "No especificados";
  const account = patient.account === "empresa" ? "Empresa" : "Particular";
  const company = patient.account === "empresa" && patient.company ? patient.company : "No aplica";

  const previousRows =
    kind === "rescheduled" && previous
      ? row("Fecha anterior", formatDate(previous.date)) + row("Hora anterior", formatTime(previous.time))
      : "";

  const htmlContent = `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#10253f">
    <div style="max-width:680px;margin:0 auto;padding:28px 16px">
      <div style="background:#ffffff;border:1px solid #dbe5ef;border-radius:14px;overflow:hidden">
        <div style="padding:22px 24px;background:#0f2a44;color:#ffffff">
          <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.8">VIP Salud Ocupacional</div>
          <h1 style="font-size:22px;margin:8px 0 0">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:20px 24px">
          <p style="margin:0 0 18px;line-height:1.5">Se registró correctamente un movimiento en la agenda de teleconsulta.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            ${row("Paciente", name)}
            ${row("Referencia", record.reference)}
            ${row("Celular", patient.phone)}
            ${previousRows}
            ${row(kind === "created" ? "Fecha" : "Nueva fecha", date)}
            ${row(kind === "created" ? "Hora" : "Nueva hora", time)}
            ${row("Solicitud", account)}
            ${row("Empresa", company)}
            ${row("Cargo", patient.job)}
            ${row("Ciudad", patient.city)}
            ${row("Exámenes", examList)}
          </table>
          <p style="margin:18px 0 0;color:#52657a;font-size:12px;line-height:1.5">Este correo es una notificación operativa automática. Por seguridad, no incluye el número de documento del paciente.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

  const previousText =
    kind === "rescheduled" && previous
      ? `\nFecha anterior: ${formatDate(previous.date)}\nHora anterior: ${formatTime(previous.time)}`
      : "";

  const textContent = `${title}\n\nPaciente: ${name}\nReferencia: ${record.reference}\nCelular: ${patient.phone}${previousText}\n${kind === "created" ? "Fecha" : "Nueva fecha"}: ${date}\n${kind === "created" ? "Hora" : "Nueva hora"}: ${time}\nSolicitud: ${account}\nEmpresa: ${company}\nCargo: ${patient.job}\nCiudad: ${patient.city}\nExámenes: ${examList}\n\nNotificación automática de VIP Salud Ocupacional.`;

  return { subject, htmlContent, textContent };
}

async function send(
  kind: BookingNotificationKind,
  record: BookingRecord,
  previous?: PreviousSchedule,
): Promise<void> {
  if (!enabled()) return;

  const apiKey = required("BREVO_API_KEY");
  const senderEmail = required("EMAIL_FROM_ADDRESS");
  if (!EMAIL_RE.test(senderEmail)) throw new Error("EMAIL_CONFIG_EMAIL_FROM_ADDRESS");
  const senderName = process.env.EMAIL_FROM_NAME?.trim() || "VIP Salud Ocupacional";
  const content = buildMessage(kind, record, previous);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: recipients(),
        subject: content.subject,
        htmlContent: content.htmlContent,
        textContent: content.textContent,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`BREVO_EMAIL_${response.status}`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function notifyBookingCreated(record: BookingRecord): Promise<void> {
  await send("created", record);
}

export async function notifyBookingRescheduled(
  record: BookingRecord,
  previous: PreviousSchedule,
): Promise<void> {
  await send("rescheduled", record, previous);
}
