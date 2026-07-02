import { randomUUID } from "node:crypto";
import type { DbClient } from "@heho/db";
import { desc, eq } from "@heho/db/helper";
import { llmProvider } from "@heho/db/schema";
import { encryptApiKey } from "../lib/api-key-encryption";
import { hasOwnerRole } from "../lib/helpers";
import type { CreateLlmProviderInput } from "../schemas/llm-providers";
import { getCurrentOrganization } from "./organizations";

export type LlmProviderDto = Omit<
  typeof llmProvider.$inferSelect,
  "organizationId" | "encryptedApiKey"
>;

export type CreateLlmProviderOptions = {
  db: DbClient;
  encryptionKey: Uint8Array;
  input: CreateLlmProviderInput;
  userId: string;
};

export type ListLlmProviderOptions = {
  db: DbClient;
  userId: string;
};

export type CreateLlmProviderResult =
  | {
      status: "created";
      provider: LlmProviderDto;
    }
  | {
      status: "organization_membership_required";
    }
  | {
      status: "insufficient_role";
    };

export type ListLlmProviderResult =
  | {
      status: "success";
      providers: LlmProviderDto[];
    }
  | {
      status: "organization_membership_required";
    };

const providerSelection = {
  id: llmProvider.id,
  name: llmProvider.name,
  provider: llmProvider.provider,
  capability: llmProvider.capability,
  baseUrl: llmProvider.baseUrl,
  model: llmProvider.model,
  createdAt: llmProvider.createdAt,
  updatedAt: llmProvider.updatedAt,
};

export const createLlmProvider = async ({
  db,
  encryptionKey,
  input,
  userId,
}: CreateLlmProviderOptions): Promise<CreateLlmProviderResult> => {
  // Get current organization
  const organization = await getCurrentOrganization(db, userId);

  // No organization for current user
  if (!organization) {
    return {
      status: "organization_membership_required",
    };
  }

  // Only the organization owner can create llm provider
  if (!hasOwnerRole(organization.role)) {
    return {
      status: "insufficient_role",
    };
  }

  // Encrypt the input llm api key
  const encryptedApiKey = await encryptApiKey({
    apiKey: input.apiKey,
    encryptionKey,
  });

  const now = new Date();

  const rows = await db
    .insert(llmProvider)
    .values({
      id: randomUUID(),
      organizationId: organization.id,
      name: input.name,
      provider: input.provider,
      capability: input.capability,
      baseUrl: input.baseUrl ?? null,
      encryptedApiKey,
      model: input.model,
      createdAt: now,
      updatedAt: now,
    })
    .returning(providerSelection);

  const provider = rows[0];

  if (!provider) {
    throw new Error("LLM provider insert returned no record");
  }

  return {
    status: "created",
    provider,
  };
};

export const listLlmProviders = async ({
  db,
  userId,
}: ListLlmProviderOptions): Promise<ListLlmProviderResult> => {
  // Get current organization
  const organization = await getCurrentOrganization(db, userId);

  // No organization for current user
  if (!organization) {
    return {
      status: "organization_membership_required",
    };
  }

  const providers = await db
    .select(providerSelection)
    .from(llmProvider)
    .where(eq(llmProvider.organizationId, organization.id))
    .orderBy(desc(llmProvider.createdAt));

  return {
    status: "success",
    providers,
  };
};
