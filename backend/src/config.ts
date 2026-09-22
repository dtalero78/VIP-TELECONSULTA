import { AppError } from "./server/errors";

function normalizedOrigin(value: string, allowHttpLocal = false): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AppError("CONFIG");
  }
  const local = ["localhost", "127.0.0.1"].includes(url.hostname);
  if (
    (url.protocol !== "https:" && !(allowHttpLocal && local && url.protocol === "http:")) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new AppError("CONFIG");
  return url.origin;
}

export function frontendOrigin(): string {
  const raw = process.env.FRONTEND_ORIGIN || process.env.APP_ORIGIN;
  if (!raw) {
    if (process.env.NODE_ENV === "production") throw new AppError("CONFIG");
    return "http://localhost:3000";
  }
  return normalizedOrigin(raw, process.env.NODE_ENV !== "production");
}

export function allowedOrigins(): Set<string> {
  const configured = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!configured.length) configured.push(frontendOrigin());
  const allowHttpLocal = process.env.NODE_ENV !== "production";
  return new Set(configured.map((value) => normalizedOrigin(value, allowHttpLocal)));
}

export function frontendUrl(path: string): string {
  return new URL(path.replace(/^\//, ""), `${frontendOrigin()}/`).toString();
}
