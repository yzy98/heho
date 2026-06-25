import type { AuthServer } from "@heho/auth/server";
import type { DbClient } from "@heho/db";
import { Hono } from "hono";
import health from "./routes/health";
import { createOrganizationsRoute } from "./routes/organizations";

export interface CreateAppOptions {
  auth: AuthServer;
  db: DbClient;
}

export function createApp({ auth, db }: CreateAppOptions) {
  return (
    new Hono()
      // Auth route
      .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))

      // Public route
      .route("/health", health)

      // Protected routes
      .route("/organizations", createOrganizationsRoute({ auth, db }))
  );
}

export type AppType = ReturnType<typeof createApp>;
