import { Hono } from "hono";

const app = new Hono().get("/", (c) =>
  c.json({
    ok: true,
    service: "server",
  })
);

export default app;
