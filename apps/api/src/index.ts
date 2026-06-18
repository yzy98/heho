import { serve } from "@hono/node-server";
import { Hono } from "hono";
import health from "./routes/health";

const app = new Hono();

const routes = app.route("/health", health);

serve(
  {
    fetch: app.fetch,
    port: 4000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

export type AppType = typeof routes;
