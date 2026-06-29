import type { AuthServer } from "@heho/auth/server";
import type { DbClient } from "@heho/db";
import { Hono } from "hono";
import health from "./routes/health";
import { createLlmProvidersRoute } from "./routes/llm-providers";
import { createOrganizationsRoute } from "./routes/organizations";

export type CreateAppOptions = {
  auth: AuthServer;
  db: DbClient;
  encryptionKey: Uint8Array;
};

export function createApp({ auth, db, encryptionKey }: CreateAppOptions) {
  return (
    new Hono()
      // Auth route
      .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))

      // Public route
      .route("/health", health)

      // Protected routes
      .route("/organizations", createOrganizationsRoute({ auth, db }))
      .route(
        "/llm-providers",
        createLlmProvidersRoute({ auth, db, encryptionKey })
      )
  );
}

export type AppType = ReturnType<typeof createApp>;
