import { timingSafeEqual } from "node:crypto";
import { notificationPage } from "./store";
import { AppError } from "./errors";

export function notificationFeed(authorization: string | undefined, cursor: string) {
  const secret = process.env.NOTIFICATIONS_READ_TOKEN || "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const supplied = Buffer.from(authorization || "");
  if (!/^[a-f0-9]{64}$/i.test(secret) || supplied.length !== expected.length || !timingSafeEqual(supplied, expected))
    throw new AppError("FORBIDDEN", 403);
  if (cursor && !/^[a-zA-Z0-9_-]{1,100}$/.test(cursor)) throw new AppError("INVALID", 400);
  return notificationPage(cursor);
}
