export const SUPPORTED_CHAT_MODELS = [
  {
    provider: "openai",
    id: "gpt-5.5",
  },
  {
    provider: "openai",
    id: "gpt-5.4",
  },
  {
    provider: "anthropic",
    id: "claude-fable-5",
  },
  {
    provider: "anthropic",
    id: "claude-opus-4-8",
  },
  {
    provider: "deepseek",
    id: "deepseek-chat",
  },
  {
    provider: "deepseek",
    id: "deepseek-reasoner",
  },
] as const;

export type SupportedChatModel = (typeof SUPPORTED_CHAT_MODELS)[number];

export type SupportedChatModelProvider = SupportedChatModel["provider"];

export type SupportedChatModelId = SupportedChatModel["id"];

export type SupportedChatModelIdFor<
  TProvider extends SupportedChatModelProvider,
> = Extract<SupportedChatModel, { provider: TProvider }>["id"];

export function findSupportedChatModel(input: {
  provider: string;
  id: string;
}): SupportedChatModel | undefined {
  return SUPPORTED_CHAT_MODELS.find(
    (model) => model.id === input.id && model.provider === input.provider
  );
}

export const DEFAULT_CHAT_MODEL: SupportedChatModel = {
  id: "deepseek-chat",
  provider: "deepseek",
};
