import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
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
    llmProviderId: text().references(() => llmProvider.id, {
      onDelete: "set null",
    }),
    name: text().notNull(),
    systemInstructions: text().notNull(),
    chatModel: text(),
    embeddingModel: text(),
    themeSettings: jsonb().notNull().default({}),
    retrievalSettings: jsonb().notNull().default({}),
    createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
    updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  },
  (table) => [
    index("chatbot_organization_id_idx").on(table.organizationId),
    index("chatbot_llm_provider_id_idx").on(table.llmProviderId),
  ]
);
