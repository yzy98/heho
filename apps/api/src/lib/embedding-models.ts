import { createGoogle } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import {
  findSupportedEmbeddingModel,
  type SupportedEmbeddingModel,
  type SupportedEmbeddingModelIdFor,
  type SupportedEmbeddingModelProvider,
} from "@heho/shared";
import type { EmbeddingModel } from "ai";

type ResolvedEmbeddingModelFor<
  TProvider extends SupportedEmbeddingModelProvider,
> = {
  model: EmbeddingModel;
  modelId: SupportedEmbeddingModelIdFor<TProvider>;
  provider: TProvider;
};

export type ResolvedEmbeddingModel = {
  [TProvider in SupportedEmbeddingModelProvider]: ResolvedEmbeddingModelFor<TProvider>;
}[SupportedEmbeddingModelProvider];

const assertUnsupportedProvider = (provider: never): never => {
  throw new Error(`Unsupported provider: ${provider}`);
};

const resolveOpenAIEmbeddingModel = ({
  apiKey,
  modelId,
}: {
  apiKey: string;
  modelId: SupportedEmbeddingModelIdFor<"openai">;
}): ResolvedEmbeddingModelFor<"openai"> => {
  const openai = createOpenAI({
    apiKey,
  });

  return {
    model: openai.embedding(modelId),
    provider: "openai",
    modelId,
  };
};

const resolveGoogleEmbeddingModel = ({
  apiKey,
  modelId,
}: {
  apiKey: string;
  modelId: SupportedEmbeddingModelIdFor<"google">;
}): ResolvedEmbeddingModelFor<"google"> => {
  const google = createGoogle({
    apiKey,
  });

  return {
    model: google.embedding(modelId),
    provider: "google",
    modelId,
  };
};

const resolveSupportedEmbeddingModel = ({
  apiKey,
  model,
}: {
  apiKey: string;
  model: SupportedEmbeddingModel;
}): ResolvedEmbeddingModel => {
  const { id, provider } = model;
  switch (provider) {
    case "google":
      return resolveGoogleEmbeddingModel({
        apiKey,
        modelId: id,
      });
    case "openai":
      return resolveOpenAIEmbeddingModel({
        apiKey,
        modelId: id,
      });
    default:
      return assertUnsupportedProvider(provider);
  }
};

export const resolveEmbeddingModel = ({
  apiKey,
  modelId,
  provider,
}: {
  apiKey: string;
  modelId: string;
  provider: string;
}): ResolvedEmbeddingModel => {
  const model = findSupportedEmbeddingModel({
    id: modelId,
    provider,
  });
  if (!model) {
    throw new Error(`Unsupported embedding model: ${modelId}`);
  }

  return resolveSupportedEmbeddingModel({
    apiKey,
    model,
  });
};
