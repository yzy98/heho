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
  input: CreateEmbedKeyInput;
  userId: string;
};

export type ListEmbedKeysOptions = {
  db: DbClient;
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

export type ListEmbedKeysResult =
  | {
      status: "success";
      embedKeys: EmbedKeyDto[];
    }
  | {
      status: "organization_membership_required";
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

export const createEmbedKey = async ({
  db,
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
  const chatbots = await db
    .select({
      id: chatbot.id,
    })
    .from(chatbot)
    .where(
      and(
        eq(chatbot.id, input.chatbotId),
        eq(chatbot.organizationId, organization.id)
      )
    )
    .limit(1);

  const selectedChatbot = chatbots[0];

  if (!selectedChatbot) {
    return {
      status: "invalid_chatbot",
    };
  }

  // Insert embed key
  const rawKey = generateEmbedKey();
  const keyPrefix = getEmbedKeyPrefix(rawKey);
  const keyHash = hashEmbedKey(rawKey);

  const now = new Date();

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

export const listEmbedKeys = async ({
  db,
  userId,
}: ListEmbedKeysOptions): Promise<ListEmbedKeysResult> => {
  // Get current organization
  const organization = await getCurrentOrganization(db, userId);

  // No organization for current user
  if (!organization) {
    return {
      status: "organization_membership_required",
    };
  }

  const embedKeys = await db
    .select(embedKeySelection)
    .from(embedKeyTable)
    .where(eq(embedKeyTable.organizationId, organization.id))
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
