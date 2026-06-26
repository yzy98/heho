import { resolve } from "node:path";
import { config } from "dotenv";
import z from "zod";

// Config from root .env
config({
  path: resolve(process.cwd(), "../../.env"),
  quiet: true,
});

const envSchema = z.object({
  API_PORT: z.coerce.number().int().min(1).max(65_535),
  API_URL: z.url(),
  APP_URL: z.url(),
  DATABASE_URL: z.url({
    protocol: /^postgres(?:ql)?$/,
  }),
  BETTER_AUTH_SECRET: z.string().min(32),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(z.prettifyError(result.error));
  throw new Error("Invalid API environment variables");
}

export const env = result.data;
export type ENV = z.infer<typeof envSchema>;
