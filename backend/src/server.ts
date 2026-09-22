import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { AppError, messages } from "./server/errors";
import { createSession, getSession, rateLimit, save } from "./server/store";
import {
  publicConfig,
  publicView,
  updateDraft,
  checkDuplicate,
  create,
  reconcile,
  changeDate,
  allowNew,
  adoptDemoExisting,
} from "./server/booking-service";
import { availability, isDemo, baseUrl } from "./server/mediconecta";
import { checkout, processEvent, paymentPolicy } from "./server/payments";
import { validDate } from "./lib/booking";
import { allowedOrigins, frontendUrl } from "./config";

const MAX_BODY = 16_384;

type JsonObject = Record<string, unknown>;

type SessionView = ReturnType<typeof publicView> & { sessionToken: string };

function withToken(token: string, record: ReturnType<typeof getSession> extends infer R ? NonNullable<R> : never): SessionView {
  return { sessionToken: token, ...publicView(record) };
}

function sendJson(res: ServerResponse, status: number, value: unknown) {
  const payload = JSON.stringify(value);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Content-Length", Buffer.byteLength(payload));
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(payload);
}

function sendEmpty(res: ServerResponse, status: number) {
  res.statusCode = status;
  res.setHeader("Cache-Control", "no-store");
  res.end();
}

function requestOrigin(req: IncomingMessage): string | null {
  const value = req.headers.origin;
  return typeof value === "string" ? value : null;
}

function cors(req: IncomingMessage, res: ServerResponse): boolean {
  const origin = requestOrigin(req);
  if (!origin) return true;
  const allowed = allowedOrigins();
  if (!allowed.has(origin)) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "600");
  return true;
}

async function body(req: IncomingMessage): Promise<JsonObject> {
  if (!String(req.headers["content-type"] || "").startsWith("application/json"))
    throw new AppError("INVALID", 400);
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY) throw new AppError("INVALID", 413);
    chunks.push(buffer);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as JsonObject;
  } catch {
    throw new AppError("INVALID", 400);
  }
}

function bearer(req: IncomingMessage): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const match = /^Bearer ([a-f0-9]{64})$/i.exec(header);
  return match?.[1] || null;
}

function identity(req: IncomingMessage): string {
  if (process.env.TRUST_PROXY === "true") {
    const value = req.headers["x-real-ip"];
    if (typeof value === "string" && value.length <= 100) return value;
  }
  return req.socket.remoteAddress || "global";
}

function browserPostAllowed(req: IncomingMessage): boolean {
  if (req.method !== "POST") return true;
  const origin = requestOrigin(req);
  return !!origin && allowedOrigins().has(origin);
}

async function handleApi(req: IncomingMessage, res: ServerResponse, action: string) {
  if (action === "wompi-events" && req.method === "POST") {
    await processEvent(await body(req));
    return sendJson(res, 200, { ok: true });
  }

  if (!cors(req, res)) throw new AppError("FORBIDDEN", 403);
  if (req.method === "OPTIONS") return sendEmpty(res, 204);
  if (!browserPostAllowed(req)) throw new AppError("FORBIDDEN", 403);

  if (req.method === "GET" && action === "config")
    return sendJson(res, 200, await publicConfig());

  const suppliedToken = bearer(req);
  if (action === "session" && req.method === "POST") {
    rateLimit(`sessions:${identity(req)}`, 30);
    const existing = suppliedToken ? getSession(suppliedToken) : null;
    if (existing) return sendJson(res, 200, withToken(suppliedToken!, existing));
    const session = createSession();
    return sendJson(res, 200, withToken(session.token, session.record));
  }

  const record = suppliedToken ? getSession(suppliedToken) : null;
  if (!record || !suppliedToken) throw new AppError("SESSION", 401);
  rateLimit(`session:${record.id}`);

  if (req.method === "GET" && action === "status")
    return sendJson(res, 200, publicView(record));
  if (req.method !== "POST") throw new AppError("NOT_FOUND", 404);

  const input = await body(req);
  switch (action) {
    case "new-session": {
      rateLimit(`sessions:${identity(req)}`, 30);
      if (["creating", "uncertain", "rescheduling"].includes(record.order))
        throw new AppError("UNCERTAIN", 409);
      const fresh = createSession();
      return sendJson(res, 200, withToken(fresh.token, fresh.record));
    }
    case "draft":
      await updateDraft(record, input.patient);
      break;
    case "duplicate":
      rateLimit(`duplicate:${identity(req)}`, 20);
      return sendJson(res, 200, await checkDuplicate(record));
    case "availability":
      if (typeof input.date !== "string" || !validDate(input.date))
        throw new AppError("INVALID", 400);
      return sendJson(res, 200, { slots: await availability(input.date) });
    case "confirm":
      await create(record);
      break;
    case "reconcile":
      await reconcile(record);
      break;
    case "allow-new":
      allowNew(record);
      break;
    case "demo-existing":
      adoptDemoExisting(record);
      break;
    case "reschedule":
      if (typeof input.date !== "string" || typeof input.time !== "string")
        throw new AppError("INVALID", 400);
      await changeDate(record, input.date, input.time);
      break;
    case "checkout":
      return sendJson(res, 200, checkout(record));
    case "abandon-payment":
      if (record.payment === "pending") {
        record.payment = "abandoned";
        save(record);
      }
      break;
    case "continue": {
      if (!record.data.externalId) {
        return sendJson(res, 200, {
          url: isDemo()
            ? frontendUrl("/examenes-virtuales/resultado/")
            : `${baseUrl()}/nuevaorden1.html`,
        });
      }
      if (paymentPolicy() === "required" && record.payment !== "approved")
        throw new AppError("PAYMENT", 409);
      return sendJson(res, 200, {
        url: isDemo()
          ? frontendUrl("/examenes-virtuales/resultado/")
          : `${baseUrl()}/?_id=${encodeURIComponent(record.data.externalId)}`,
      });
    }
    default:
      throw new AppError("NOT_FOUND", 404);
  }

  const latest = getSession(suppliedToken);
  if (!latest) throw new AppError("SESSION", 401);
  return sendJson(res, 200, publicView(latest));
}

export function createVipServer() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://localhost");
      if (url.pathname === "/health") {
  if (req.method === "HEAD") {
    return sendEmpty(res, 200);
  }

  if (req.method === "GET") {
    return sendJson(res, 200, {
      ok: true,
      service: "vip-teleconsulta-api",
      status: "healthy",
    });
  }

  throw new AppError("NOT_FOUND", 404);
}
      const match = /^\/api\/booking\/([a-z0-9-]+)$/.exec(url.pathname);
      if (!match) throw new AppError("NOT_FOUND", 404);
      return await handleApi(req, res, match[1]!);
    } catch (error) {
      const e = error instanceof AppError ? error : new AppError("PROVIDER");
      if (e.status >= 500)
        console.error(JSON.stringify({ event: "booking_error", code: e.code }));
      return sendJson(res, e.status, {
        code: e.code,
        message: messages[e.code] || messages.PROVIDER,
        fields: e.fields,
      });
    }
  });
}
