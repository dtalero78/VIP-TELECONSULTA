import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AddressInfo } from "node:net";
import { createVipServer } from "../src/server";

process.env.DATA_DIR = mkdtempSync(join(tmpdir(), "vip-route-tests-"));
process.env.MEDICONNECTA_MODE = "mock";
process.env.FRONTEND_ORIGIN = "http://localhost:3001";
process.env.ALLOWED_ORIGINS = "http://localhost:3001";

const server = createVipServer();
let base = "";
const origin = "http://localhost:3001";

before(async () => {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address() as AddressInfo;
  base = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

async function call(
  action: string,
  options: { method?: "GET" | "POST"; data?: unknown; token?: string; requestOrigin?: string } = {},
) {
  const method = options.method || (options.data === undefined ? "GET" : "POST");
  return fetch(`${base}/api/booking/${action}`, {
    method,
    headers: {
      Origin: options.requestOrigin ?? origin,
      ...(options.data === undefined ? {} : { "Content-Type": "application/json" }),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.data === undefined ? undefined : JSON.stringify(options.data),
  });
}

test("sesión Bearer y protección CORS", async () => {
  assert.equal(
    (await call("session", { method: "POST", data: {}, requestOrigin: "https://other.example" })).status,
    403,
  );
  assert.equal((await call("status")).status, 401);

  const response = await call("session", { method: "POST", data: {} });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.match(response.headers.get("cache-control") || "", /no-store/);
  const session = (await response.json()) as { sessionToken: string };
  assert.match(session.sessionToken, /^[a-f0-9]{64}$/i);

  assert.equal((await call("status", { token: session.sessionToken })).status, 200);
  assert.equal(
    (
      await call("draft", {
        method: "POST",
        data: { patient: {} },
        token: session.sessionToken,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("reschedule", {
        method: "POST",
        data: { date: "2026-09-22", time: "10:30" },
        token: session.sessionToken,
      })
    ).status,
    403,
  );
});

test("datos sobredimensionados se rechazan", async () => {
  const sessionResponse = await call("session", { method: "POST", data: {} });
  const session = (await sessionResponse.json()) as { sessionToken: string };
  const response = await call("draft", {
    method: "POST",
    data: { payload: "x".repeat(20_000) },
    token: session.sessionToken,
  });
  assert.equal(response.status, 413);
});
