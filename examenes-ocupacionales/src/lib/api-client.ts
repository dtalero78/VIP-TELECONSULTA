import type { FieldErrors } from "./booking";

const SESSION_KEY = "vip_booking_session";

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public fields?: FieldErrors,
  ) {
    super(message);
  }
}

let mutationQueue: Promise<unknown> = Promise.resolve();

function apiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!configured) {
    throw new ApiError(
      "La agenda en línea aún no tiene configurado el servidor de solicitudes.",
      "CONFIG",
    );
  }
  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new ApiError("La dirección del servidor de solicitudes no es válida.", "CONFIG");
  }
  if (url.protocol !== "https:" && url.hostname !== "localhost")
    throw new ApiError("La conexión con la agenda debe usar HTTPS.", "CONFIG");
  return url.origin;
}

function currentToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SESSION_KEY);
}

function saveToken(token: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, token);
}

export function clearBookingSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function api<T>(action: string, data?: unknown): Promise<T> {
  if (data === undefined) return request<T>(action, data);
  const result = mutationQueue.then(() => request<T>(action, data));
  mutationQueue = result.catch(() => undefined);
  return result;
}

async function request<T>(action: string, data?: unknown): Promise<T> {
  const token = currentToken();
  const headers: Record<string, string> = {};
  if (data !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${apiBase()}/api/booking/${action}`, {
      method: data === undefined ? "GET" : "POST",
      cache: "no-store",
      credentials: "omit",
      headers,
      body: data === undefined ? undefined : JSON.stringify(data),
      signal: AbortSignal.timeout(25_000),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Se interrumpió la conexión. Tus datos guardados permanecen en esta sesión. Si estabas confirmando, consulta el estado antes de intentarlo otra vez.",
      "CONNECTION",
    );
  }

  let result: Record<string, unknown>;
  try {
    result = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new ApiError("El servidor respondió de forma inesperada.", "PROVIDER");
  }

  if (!response.ok) {
    if (result.code === "SESSION") clearBookingSession();
    throw new ApiError(
      typeof result.message === "string"
        ? result.message
        : "No pudimos completar la operación.",
      typeof result.code === "string" ? result.code : "PROVIDER",
      result.fields as FieldErrors | undefined,
    );
  }

  if (typeof result.sessionToken === "string") {
    saveToken(result.sessionToken);
    delete result.sessionToken;
  }
  return result as T;
}
