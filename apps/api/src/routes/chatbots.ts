import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { CreateAppOptions } from "../app";
import type { AppEnv } from "../context";
import { requireAuth } from "../middleware/require-auth";
import { createChatbotSchema } from "../schemas/chatbots";
import { createChatbot, listChatbots } from "../services/chatbots";

type CreateChatbotsRouteOptions = Omit<CreateAppOptions, "encryptionKey">;

const createChatbotValidator = zValidator(
  "json",
  createChatbotSchema,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid chatbot input.",
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
  message: "Only the organization owner can create chatbots.",
} as const;

const invalidChatProviderResponse = {
  code: "INVALID_CHAT_PROVIDER",
  message: "Selected chat provider is invalid.",
} as const;

const invalidEmbeddingProviderResponse = {
  code: "INVALID_EMBEDDING_PROVIDER",
  message: "Selected embedding provider is invalid.",
} as const;

export const createChatbotsRoute = ({ auth, db }: CreateChatbotsRouteOptions) =>
  new Hono<AppEnv>()
    .use("*", requireAuth(auth))
    .get("/", async (c) => {
      const user = c.get("user");

      const result = await listChatbots({
        db,
        userId: user.id,
      });

      if (result.status === "organization_membership_required") {
        return c.json(organizationMembershipRequiredResponse, 403);
      }

      return c.json({
        chatbots: result.chatbots,
      });
    })
    .post("/", createChatbotValidator, async (c) => {
      const user = c.get("user");
      const input = c.req.valid("json");

      const result = await createChatbot({
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

      if (result.status === "invalid_chat_provider") {
        return c.json(invalidChatProviderResponse, 400);
      }

      if (result.status === "invalid_embedding_provider") {
        return c.json(invalidEmbeddingProviderResponse, 400);
      }

      return c.json(
        {
          chatbot: result.chatbot,
        },
        201
      );
    });
