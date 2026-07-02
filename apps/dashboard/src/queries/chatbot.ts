import {
  mutationOptions,
  type QueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { createApiError } from "@/lib/api-error";

const chatbotsClient = apiClient.chatbots;

export const chatbotsQueryKey = (organizationId: string) =>
  ["chatbots", organizationId] as const;

export type CreateChatbotInput = Parameters<
  typeof chatbotsClient.$post
>[0]["json"];

const listChatbots = async (signal: AbortSignal) => {
  // [TODO] Manually slow down 3s in dev environment
  // if (import.meta.env.DEV) {
  //   await new Promise((resolve) => setTimeout(resolve, 3000));
  //   throw new Error("Simulated chatbots loading failure.");
  // }

  const response = await chatbotsClient.$get(undefined, {
    init: { signal },
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
};

const createChatbot = async (input: CreateChatbotInput) => {
  const response = await chatbotsClient.$post({
    json: input,
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json();
};

export const chatbotsQueryOptions = (organizationId: string) =>
  queryOptions({
    queryKey: chatbotsQueryKey(organizationId),
    queryFn: ({ signal }) => listChatbots(signal),
  });

export const createChatbotMutationOptions = (
  queryClient: QueryClient,
  organizationId: string
) =>
  mutationOptions({
    mutationFn: createChatbot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatbotsQueryKey(organizationId),
      });
    },
  });

export type Chatbot = Awaited<
  ReturnType<typeof listChatbots>
>["chatbots"][number];
