import {
  mutationOptions,
  type QueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { createApiError } from "@/lib/api-error";

const chatbotEmbedKeysClient = apiClient.chatbots[":chatbotId"]["embed-keys"];

export type CreateEmbedKeyInput = Parameters<
  typeof chatbotEmbedKeysClient.$post
>[0]["json"];

const listChatbotEmbedKeys = async (chatbotId: string, signal: AbortSignal) => {
  // [TODO] Manually slow down 3s in dev environment
  // if (import.meta.env.DEV) {
  //   await new Promise((resolve) => setTimeout(resolve, 3000));
  //   throw new Error("Simulated chatbots loading failure.");
  // }

  const response = await chatbotEmbedKeysClient.$get(
    {
      param: {
        chatbotId,
      },
    },
    {
      init: {
        signal,
      },
    }
  );

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
};

const createChatbotEmbedKey = async (
  chatbotId: string,
  input: CreateEmbedKeyInput
) => {
  const response = await chatbotEmbedKeysClient.$post({
    param: {
      chatbotId,
    },
    json: input,
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
};

type ChatbotEmbedKeysScope = {
  organizationId: string;
  chatbotId: string;
};

export const chatbotEmbedKeysQueryKey = ({
  organizationId,
  chatbotId,
}: ChatbotEmbedKeysScope) => ["embed-keys", organizationId, chatbotId] as const;

export const chatbotEmbedKeysQueryOptions = ({
  organizationId,
  chatbotId,
}: ChatbotEmbedKeysScope) =>
  queryOptions({
    queryKey: chatbotEmbedKeysQueryKey({ organizationId, chatbotId }),
    queryFn: ({ signal }) => listChatbotEmbedKeys(chatbotId, signal),
  });

export const createChatbotEmbedKeyMutationOptions = ({
  queryClient,
  organizationId,
  chatbotId,
}: ChatbotEmbedKeysScope & {
  queryClient: QueryClient;
}) =>
  mutationOptions({
    mutationFn: (input: CreateEmbedKeyInput) =>
      createChatbotEmbedKey(chatbotId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        exact: true,
        queryKey: chatbotEmbedKeysQueryKey({ organizationId, chatbotId }),
      });
    },
  });

export type EmbedKey = Awaited<
  ReturnType<typeof listChatbotEmbedKeys>
>["embedKeys"][number];

export type CreateEmbedKeyResult = Awaited<
  ReturnType<typeof createChatbotEmbedKey>
>;
