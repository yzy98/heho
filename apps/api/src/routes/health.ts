import { Hono } from "hono";

const healthRoute = new Hono().get("/", (c) =>
  c.json({
    ok: true,
    service: "server",
  })
);

export default healthRoute;
