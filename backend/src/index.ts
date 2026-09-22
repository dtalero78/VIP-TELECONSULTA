import { createVipServer } from "./server";

const port = Number(process.env.PORT || 10000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT inválido");

const server = createVipServer();
server.listen(port, "0.0.0.0", () => {
  console.info(JSON.stringify({ event: "server_started", port }));
});

function shutdown(signal: string) {
  console.info(JSON.stringify({ event: "server_stopping", signal }));
  server.close((error) => {
    if (error) {
      console.error(JSON.stringify({ event: "server_stop_error" }));
      process.exitCode = 1;
    }
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
