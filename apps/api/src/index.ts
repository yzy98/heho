import { createAuthServer } from "@heho/auth/server";
import { createDb } from "@heho/db";
import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { env } from "./env";

// Create db instance
const database = createDb(env.DATABASE_URL);

// Create auth server instance
const auth = createAuthServer({
  db: database.db,
  baseURL: env.API_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.APP_URL],
});

// Create Hono instance
const app = createApp({ auth });

const server = serve(
  {
    fetch: app.fetch,
    port: env.API_PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

async function shutdown() {
  server.close();
  await database.close();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
