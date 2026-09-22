export class AppError extends Error {
  constructor(
    public code: string,
    public status = 503,
    public fields?: Record<string, string>,
  ) {
    super(code);
  }
}
export const messages: Record<string, string> = {
  CONFIG:
    "El servicio de solicitudes no está disponible en este momento. Puedes contactar al equipo VIP.",
  PROVIDER:
    "No pudimos comunicarnos con la agenda. Intenta nuevamente en unos momentos.",
  INVALID: "Revisa los campos señalados antes de continuar.",
  SESSION: "Tu sesión venció. Inicia nuevamente la solicitud.",
  FORBIDDEN:
    "No se pudo validar esta solicitud. Recarga la página e intenta nuevamente.",
  RATE: "Has realizado varios intentos. Espera un minuto antes de continuar.",
  SLOT: "Ese horario ya no está disponible. Selecciona otro para continuar.",
  DUPLICATE:
    "Existe un proceso anterior. Revisa las opciones antes de continuar.",
  UNCERTAIN:
    "Estamos verificando si la solicitud quedó registrada. No vuelvas a crear otra; revisa el estado o contacta al equipo VIP.",
  PREVIOUS_REQUEST:
    "Ya existe una solicitud registrada anteriormente con este documento. No enviamos una nueva cita. Usa «Necesito ayuda» para que el equipo VIP revise la solicitud anterior antes de agendar otra.",
  LOCKED: "Hay una operación en curso. Consulta su estado antes de continuar.",
  PAYMENT: "El pago en línea aún no está habilitado para esta solicitud.",
  IDENTITY:
    "Para gestionar una cita anterior, continúa en la plataforma de atención de VIP.",
  NOT_FOUND: "No encontramos esa operación.",
};
