import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";

export const llmProviderCapability = pgEnum("llm_provider_capability", [
  "chat",
  "embedding",
]);

export const llmProvider = pgTable(
  "llm_provider",
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text().notNull(),
    provider: text().notNull(),
    capability: llmProviderCapability().notNull(),
    baseUrl: text(),
    encryptedApiKey: text().notNull(),
    model: text().notNull(),
    createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
    updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  },
  (table) => [
    index("llm_provider_organization_id_idx").on(table.organizationId),
    index("llm_provider_organization_capability_idx").on(
      table.organizationId,
      table.capability
    ),
  ]
);

export const chatbot = pgTable(
  "chatbot",
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    chatProviderId: text().references(() => llmProvider.id, {
      onDelete: "set null",
    }),
    embeddingProviderId: text().references(() => llmProvider.id, {
      onDelete: "set null",
    }),
    name: text().notNull(),
    systemInstructions: text().notNull(),
    themeSettings: jsonb().notNull().default({}),
    retrievalSettings: jsonb().notNull().default({}),
    createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
    updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  },
  (table) => [
    index("chatbot_organization_id_idx").on(table.organizationId),
    index("chatbot_chat_provider_id_idx").on(table.chatProviderId),
    index("chatbot_embedding_provider_id_idx").on(table.embeddingProviderId),
  ]
);

export const embedKey = pgTable(
  "embed_key",
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    chatbotId: text()
      .notNull()
      .references(() => chatbot.id, { onDelete: "cascade" }),
    keyPrefix: text().notNull(),
    keyHash: text().notNull(),
    allowedDomains: jsonb().$type<string[]>().notNull().default([]),
    createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  },
  (table) => [
    index("embed_key_organization_id_idx").on(table.organizationId),
    index("embed_key_chatbot_id_idx").on(table.chatbotId),
    uniqueIndex("embed_key_key_hash_unique").on(table.keyHash),
  ]
);
