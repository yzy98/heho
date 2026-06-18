import type { AuthServer } from "@heho/auth/server";
import { Hono } from "hono";
import health from "./routes/health";

export interface CreateAppOptions {
  auth: AuthServer;
}

export function createApp({ auth }: CreateAppOptions) {
  return new Hono()
    .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))
    .route("/health", health);
}

export type AppType = ReturnType<typeof createApp>;
