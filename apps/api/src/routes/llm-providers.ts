import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { CreateAppOptions } from "../app";
import type { AppEnv } from "../context";
import { requireAuth } from "../middleware/require-auth";
import { createLlmProviderSchema } from "../schemas/llm-providers";
import { createLlmProvider, listLlmProviders } from "../services/llm-providers";

type CreateLlmProvidersRouteOptions = CreateAppOptions;

const createLlmProviderValidator = zValidator(
  "json",
  createLlmProviderSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid llm provider input.",
          issues: result.error.issues,
        },
        400
      );
    }
  }
);

const organizationMembershipRequiredResponse = {
  code: "ORGANIZATION_MEMBERSHIP_REQUIRED",
  message: "Current user does not belong to an organization.",
} as const;

export const createLlmProvidersRoute = ({
  auth,
  db,
  encryptionKey,
}: CreateLlmProvidersRouteOptions) =>
  new Hono<AppEnv>()
    .use("*", requireAuth(auth))
    .get("/", async (c) => {
      const user = c.get("user");

      const result = await listLlmProviders({
        db,
        userId: user.id,
      });

      if (result.status === "organization_membership_required") {
        return c.json(organizationMembershipRequiredResponse, 403);
      }

      return c.json({
        providers: result.providers,
      });
    })
    .post("/", createLlmProviderValidator, async (c) => {
      const user = c.get("user");
      const input = c.req.valid("json");

      const result = await createLlmProvider({
        db,
        encryptionKey,
        input,
        userId: user.id,
      });

      if (result.status === "organization_membership_required") {
        return c.json(organizationMembershipRequiredResponse, 403);
      }

      if (result.status === "insufficient_role") {
        return c.json(
          {
            code: "INSUFFICIENT_ORGANIZATION_ROLE",
            message: "Only organization owner can create LLM providers.",
          },
          403
        );
      }

      return c.json(
        {
          provider: result.provider,
        },
        201
      );
    });
