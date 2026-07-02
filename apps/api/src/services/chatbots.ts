import { randomUUID } from "node:crypto";
import type { DbClient } from "@heho/db";
import { and, desc, eq, inArray } from "@heho/db/helper";
import { chatbot, llmProvider } from "@heho/db/schema";
import { hasOwnerRole } from "../lib/helpers";
import type { CreateChatbotInput } from "../schemas/chatbots";
import { getCurrentOrganization } from "./organizations";

export type ChatbotDto = Omit<
  typeof chatbot.$inferSelect,
  "organizationId" | "themeSettings" | "retrievalSettings"
>;

export type CreateChatbotOptions = {
  db: DbClient;
  input: CreateChatbotInput;
  userId: string;
};

export type ListChatbotsOptions = {
  db: DbClient;
  userId: string;
};

export type CreateChatbotResult =
  | {
      status: "created";
      chatbot: ChatbotDto;
    }
  | {
      status: "organization_membership_required";
    }
  | {
      status: "insufficient_role";
    }
  | {
      status: "invalid_chat_provider";
    }
  | {
      status: "invalid_embedding_provider";
    };

export type ListChatbotsResult =
  | {
      status: "success";
      chatbots: ChatbotDto[];
    }
  | {
      status: "organization_membership_required";
    };

const chatbotSelection = {
  id: chatbot.id,
  name: chatbot.name,
  systemInstructions: chatbot.systemInstructions,
  chatProviderId: chatbot.chatProviderId,
  embeddingProviderId: chatbot.embeddingProviderId,
  createdAt: chatbot.createdAt,
  updatedAt: chatbot.updatedAt,
};

export const createChatbot = async ({
  db,
  input,
  userId,
}: CreateChatbotOptions): Promise<CreateChatbotResult> => {
  // Get current organization
  const organization = await getCurrentOrganization(db, userId);

  // No organization for current user
  if (!organization) {
    return {
      status: "organization_membership_required",
    };
  }

  // Only the organization owner can create chatbot
  if (!hasOwnerRole(organization.role)) {
    return {
      status: "insufficient_role",
    };
  }

  // Get llm-providers within current organization
  // Need to be either matched with input chatProvider or embeddingProvider
  const llmProviders = await db
    .select({
      id: llmProvider.id,
      capability: llmProvider.capability,
    })
    .from(llmProvider)
    .where(
      and(
        eq(llmProvider.organizationId, organization.id),
        inArray(llmProvider.id, [
          input.chatProviderId,
          input.embeddingProviderId,
        ])
      )
    );

  // Get chat provider
  const chatProvider = llmProviders.find(
    (provider) =>
      provider.id === input.chatProviderId && provider.capability === "chat"
  );

  if (!chatProvider) {
    return {
      status: "invalid_chat_provider",
    };
  }

  // Get embedding provider
  const embeddingProvider = llmProviders.find(
    (provider) =>
      provider.id === input.embeddingProviderId &&
      provider.capability === "embedding"
  );

  if (!embeddingProvider) {
    return {
      status: "invalid_embedding_provider",
    };
  }

  // Insert db
  const now = new Date();

  const rows = await db
    .insert(chatbot)
    .values({
      id: randomUUID(),
      organizationId: organization.id,
      name: input.name,
      systemInstructions: input.systemInstructions,
      chatProviderId: chatProvider.id,
      embeddingProviderId: embeddingProvider.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning(chatbotSelection);

  const createdChatbot = rows[0];

  if (!createdChatbot) {
    throw new Error("Chatbot insert returned no record");
  }

  return {
    status: "created",
    chatbot: createdChatbot,
  };
};

export const listChatbots = async ({
  db,
  userId,
}: ListChatbotsOptions): Promise<ListChatbotsResult> => {
  // Get current organization
  const organization = await getCurrentOrganization(db, userId);

  // No organization for current user
  if (!organization) {
    return {
      status: "organization_membership_required",
    };
  }

  const chatbots = await db
    .select(chatbotSelection)
    .from(chatbot)
    .where(eq(chatbot.organizationId, organization.id))
    .orderBy(desc(chatbot.createdAt));

  return {
    status: "success",
    chatbots,
  };
};
