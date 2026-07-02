import { randomUUID } from "node:crypto";
import type { DbClient } from "@heho/db";
import { and, desc, eq } from "@heho/db/helper";
import { chatbot, embedKey as embedKeyTable } from "@heho/db/schema";
import {
  generateEmbedKey,
  getEmbedKeyPrefix,
  hashEmbedKey,
  isEmbedKey,
} from "../lib/embed-key";
import { hasOwnerRole } from "../lib/helpers";
import type { CreateEmbedKeyInput } from "../schemas/embed-keys";
import { getCurrentOrganization } from "./organizations";

export type EmbedKeyDto = Omit<
  typeof embedKeyTable.$inferSelect,
  "organizationId" | "keyHash"
>;

export type CreateEmbedKeyOptions = {
  db: DbClient;
  chatbotId: string;
  input: CreateEmbedKeyInput;
  userId: string;
};

export type ListChatbotEmbedKeysOptions = {
  db: DbClient;
  chatbotId: string;
  userId: string;
};

export type ResolveEmbedKeyOptions = {
  db: DbClient;
  rawKey: string;
};

export type CreateEmbedKeyResult =
  | {
      status: "created";
      embedKey: EmbedKeyDto;
      key: string;
    }
  | {
      status: "organization_membership_required";
    }
  | {
      status: "insufficient_role";
    }
  | {
      status: "invalid_chatbot";
    };

export type ListChatbotEmbedKeysResult =
  | {
      status: "success";
      embedKeys: EmbedKeyDto[];
    }
  | {
      status: "organization_membership_required";
    }
  | {
      status: "invalid_chatbot";
    };

export type ResolvedEmbedKey = {
  embedKeyId: string;
  organizationId: string;
  chatbotId: string;
  allowedDomains: string[];
};

const embedKeySelection = {
  id: embedKeyTable.id,
  chatbotId: embedKeyTable.chatbotId,
  keyPrefix: embedKeyTable.keyPrefix,
  allowedDomains: embedKeyTable.allowedDomains,
  createdAt: embedKeyTable.createdAt,
};

const findChatbotInOrganization = async ({
  db,
  chatbotId,
  organizationId,
}: {
  db: DbClient;
  chatbotId: string;
  organizationId: string;
}) => {
  const rows = await db
    .select({
      id: chatbot.id,
    })
    .from(chatbot)
    .where(
      and(eq(chatbot.id, chatbotId), eq(chatbot.organizationId, organizationId))
    )
    .limit(1);

  return rows[0] ?? null;
};

export const createEmbedKey = async ({
  db,
  chatbotId,
  input,
  userId,
}: CreateEmbedKeyOptions): Promise<CreateEmbedKeyResult> => {
  // Get current organization
  const organization = await getCurrentOrganization(db, userId);

  // No organization for current user
  if (!organization) {
    return {
      status: "organization_membership_required",
    };
  }

  // Only the organization owner can create embed key
  if (!hasOwnerRole(organization.role)) {
    return {
      status: "insufficient_role",
    };
  }

  // Check if the chatbot provided exists or not
  const selectedChatbot = await findChatbotInOrganization({
    db,
    chatbotId,
    organizationId: organization.id,
  });

  if (!selectedChatbot) {
    return {
      status: "invalid_chatbot",
    };
  }

  // Generate raw key and its hash
  const rawKey = generateEmbedKey();
  const keyPrefix = getEmbedKeyPrefix(rawKey);
  const keyHash = hashEmbedKey(rawKey);

  const now = new Date();

  // Insert into db
  const rows = await db
    .insert(embedKeyTable)
    .values({
      id: randomUUID(),
      organizationId: organization.id,
      chatbotId: selectedChatbot.id,
      keyPrefix,
      keyHash,
      allowedDomains: input.allowedDomains,
      createdAt: now,
    })
    .returning(embedKeySelection);

  const createdEmbedKey = rows[0];

  if (!createdEmbedKey) {
    throw new Error("Embed key insert returned no record");
  }

  return {
    key: rawKey,
    embedKey: createdEmbedKey,
    status: "created",
  };
};

export const listChatbotEmbedKeys = async ({
  db,
  chatbotId,
  userId,
}: ListChatbotEmbedKeysOptions): Promise<ListChatbotEmbedKeysResult> => {
  // Get current organization
  const organization = await getCurrentOrganization(db, userId);

  // No organization for current user
  if (!organization) {
    return {
      status: "organization_membership_required",
    };
  }

  // Check if the chatbot provided exists or not
  const selectedChatbot = await findChatbotInOrganization({
    db,
    chatbotId,
    organizationId: organization.id,
  });

  if (!selectedChatbot) {
    return {
      status: "invalid_chatbot",
    };
  }

  const embedKeys = await db
    .select(embedKeySelection)
    .from(embedKeyTable)
    .where(
      and(
        eq(embedKeyTable.organizationId, organization.id),
        eq(embedKeyTable.chatbotId, selectedChatbot.id)
      )
    )
    .orderBy(desc(embedKeyTable.createdAt));

  return {
    status: "success",
    embedKeys,
  };
};

export const resolveEmbedKey = async ({
  db,
  rawKey,
}: ResolveEmbedKeyOptions): Promise<ResolvedEmbedKey | null> => {
  // Check if the rawKey is embed key
  if (!isEmbedKey(rawKey)) {
    return null;
  }

  const keyHash = hashEmbedKey(rawKey);

  const rows = await db
    .select({
      embedKeyId: embedKeyTable.id,
      organizationId: embedKeyTable.organizationId,
      chatbotId: embedKeyTable.chatbotId,
      allowedDomains: embedKeyTable.allowedDomains,
    })
    .from(embedKeyTable)
    .innerJoin(
      chatbot,
      and(
        eq(chatbot.id, embedKeyTable.chatbotId),
        eq(chatbot.organizationId, embedKeyTable.organizationId)
      )
    )
    .where(eq(embedKeyTable.keyHash, keyHash))
    .limit(1);

  return rows[0] ?? null;
};
