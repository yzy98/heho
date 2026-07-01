export const SUPPORTED_EMBEDDING_MODELS = [
  {
    id: "gemini-embedding-001",
    provider: "google",
  },
  {
    id: "gemini-embedding-2",
    provider: "google",
  },
  {
    id: "text-embedding-3-large",
    provider: "openai",
  },
  {
    id: "text-embedding-3-small",
    provider: "openai",
  },
] as const;

export type SupportedEmbeddingModel =
  (typeof SUPPORTED_EMBEDDING_MODELS)[number];

export type SupportedEmbeddingModelProvider =
  SupportedEmbeddingModel["provider"];

export type SupportedEmbeddingModelId = SupportedEmbeddingModel["id"];

export type SupportedEmbeddingModelIdFor<
  TProvider extends SupportedEmbeddingModelProvider,
> = Extract<SupportedEmbeddingModel, { provider: TProvider }>["id"];

export function findSupportedEmbeddingModel(input: {
  provider: string;
  id: string;
}): SupportedEmbeddingModel | undefined {
  return SUPPORTED_EMBEDDING_MODELS.find(
    (model) => model.id === input.id && model.provider === input.provider
  );
}

export const DEFAULT_EMBEDDING_MODEL_ID: SupportedEmbeddingModelId =
  "gemini-embedding-001";
