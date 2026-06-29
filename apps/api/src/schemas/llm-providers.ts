import {
  findSupportedChatModel,
  findSupportedEmbeddingModel,
} from "@heho/shared";
import { z } from "zod";

const baseSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    baseUrl: z.url().nullable().optional(),
    apiKey: z
      .string()
      .min(1)
      .refine((value) => value.trim().length > 0, {
        message: "API key is required",
      }),
  })
  .strict();

const chatProviderSchema = baseSchema
  .extend({
    capability: z.literal("chat"),
    provider: z.string().min(1),
    model: z.string().min(1),
  })
  .refine(
    ({ provider, model }) =>
      findSupportedChatModel({
        id: model,
        provider,
      }) !== undefined,
    {
      message: "Chat model is not supported by this provider",
      path: ["model"],
    }
  );

const embeddingProviderSchema = baseSchema
  .extend({
    capability: z.literal("embedding"),
    provider: z.string().min(1),
    model: z.string().min(1),
  })
  .refine(
    ({ provider, model }) =>
      findSupportedEmbeddingModel({
        id: model,
        provider,
      }) !== undefined,
    {
      message: "Embedding model is not supported by this provider",
      path: ["model"],
    }
  );

export const createLlmProviderSchema = z.discriminatedUnion("capability", [
  chatProviderSchema,
  embeddingProviderSchema,
]);

export type CreateLlmProviderInput = z.infer<typeof createLlmProviderSchema>;
