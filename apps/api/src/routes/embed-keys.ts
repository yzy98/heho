import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { CreateAppOptions } from "../app";
import type { AppEnv } from "../context";
import { requireAuth } from "../middleware/require-auth";
import { createEmbedKeySchema } from "../schemas/embed-keys";
import { createEmbedKey, listEmbedKeys } from "../services/embed-keys";

type CreateEmbedKeysRouteOptions = Omit<CreateAppOptions, "encryptionKey">;

const createEmbedKeyValidator = zValidator(
  "json",
  createEmbedKeySchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid embed key input.",
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

const insufficientRoleResponse = {
  code: "INSUFFICIENT_ORGANIZATION_ROLE",
  message: "Only the organization owner can create embed keys.",
} as const;

const invalidChatbotResponse = {
  code: "INVALID_CHATBOT",
  message: "Selected chatbot is invalid.",
} as const;

export const createEmbedKeysRoute = ({
  auth,
  db,
}: CreateEmbedKeysRouteOptions) =>
  new Hono<AppEnv>()
    .use("*", requireAuth(auth))
    .get("/", async (c) => {
      const user = c.get("user");

      const result = await listEmbedKeys({
        db,
        userId: user.id,
      });

      if (result.status === "organization_membership_required") {
        return c.json(organizationMembershipRequiredResponse, 403);
      }

      return c.json({
        embedKeys: result.embedKeys,
      });
    })
    .post("/", createEmbedKeyValidator, async (c) => {
      const user = c.get("user");
      const input = c.req.valid("json");

      const result = await createEmbedKey({
        db,
        input,
        userId: user.id,
      });

      if (result.status === "organization_membership_required") {
        return c.json(organizationMembershipRequiredResponse, 403);
      }

      if (result.status === "insufficient_role") {
        return c.json(insufficientRoleResponse, 403);
      }

      if (result.status === "invalid_chatbot") {
        return c.json(invalidChatbotResponse, 400);
      }

      return c.json(
        {
          embedKey: result.embedKey,
          key: result.key,
        },
        201
      );
    });
