import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@heho/ui/components/alert";
import { Button } from "@heho/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@heho/ui/components/card";
import { Skeleton } from "@heho/ui/components/skeleton";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { AlertTriangleIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { CreateChatDialog } from "@/components/dialogs/create-chatbot-dialog";
import { hasOwnerRole } from "@/lib/utils";
import { type Chatbot, chatbotsQueryOptions } from "@/queries/chatbot";
import {
  type LlmProvider,
  llmProvidersQueryOptions,
} from "@/queries/llm-provider";

export const Route = createFileRoute("/_app/_workspace/chatbots")({
  staticData: {
    breadcrumb: "Chatbots",
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        chatbotsQueryOptions(context.organization.id)
      ),
      context.queryClient.ensureQueryData(
        llmProvidersQueryOptions(context.organization.id)
      ),
    ]),
  pendingComponent: ChatbotsPending,
  errorComponent: ChatbotsError,
  component: ChatbotsPage,
});

function ChatbotsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { organization } = Route.useRouteContext();
  const {
    data: { chatbots },
  } = useSuspenseQuery(chatbotsQueryOptions(organization.id));
  const {
    data: { providers },
  } = useSuspenseQuery(llmProvidersQueryOptions(organization.id));

  const canCreate = hasOwnerRole(organization.role);

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-muted-foreground text-sm">
          Configure your chatbots.
        </p>
        {canCreate && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            Add chatbot
          </Button>
        )}
      </div>

      {chatbots.length === 0 ? (
        <ChatbotsEmptyAlert canCreate={canCreate} />
      ) : (
        <ChatbotList chatbots={chatbots} providers={providers} />
      )}

      {canCreate && (
        <CreateChatDialog
          onOpenChange={setCreateDialogOpen}
          open={createDialogOpen}
          organizationId={organization.id}
          providers={providers}
        />
      )}
    </>
  );
}

function ChatbotsEmptyAlert({ canCreate }: { canCreate: boolean }) {
  return (
    <Alert>
      <AlertTriangleIcon />
      <AlertTitle>No chatbots configured</AlertTitle>
      <AlertDescription>
        {canCreate
          ? "Create your first chatbot."
          : "The organization owner must create the first chatbot."}
      </AlertDescription>
    </Alert>
  );
}

type ChatbotListProps = {
  chatbots: Chatbot[];
  providers: LlmProvider[];
};

function ChatbotList({ chatbots, providers }: ChatbotListProps) {
  const providersById = new Map(
    providers.map((provider) => [provider.id, provider])
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {chatbots.map((chatbot) => (
        <ChatbotCard
          chatbot={chatbot}
          chatProvider={
            chatbot.chatProviderId
              ? providersById.get(chatbot.chatProviderId)
              : undefined
          }
          embeddingProvider={
            chatbot.embeddingProviderId
              ? providersById.get(chatbot.embeddingProviderId)
              : undefined
          }
          key={chatbot.id}
        />
      ))}
    </div>
  );
}

type ChatbotCardProps = {
  chatbot: Chatbot;
  chatProvider: LlmProvider | undefined;
  embeddingProvider: LlmProvider | undefined;
};

function ChatbotCard({
  chatbot,
  chatProvider,
  embeddingProvider,
}: ChatbotCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{chatbot.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {chatbot.systemInstructions}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-muted-foreground">Chat LLM provider</dt>
          <dd className="truncate text-right">
            {formatProvider(chatProvider)}
          </dd>

          <dt className="text-muted-foreground">Embedding LLM provider</dt>
          <dd className="truncate text-right">
            {formatProvider(embeddingProvider)}
          </dd>
        </dl>
      </CardContent>
    </Card>
  );
}

function formatProvider(provider?: LlmProvider) {
  if (!provider) {
    return "Provider missing";
  }

  return `${provider.name} · ${provider.provider} · ${provider.model}`;
}

function ChatbotsPending() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

function ChatbotsError({ error, reset }: ErrorComponentProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangleIcon />
      <AlertTitle>Unable to load chatbots</AlertTitle>
      <AlertDescription>
        {error instanceof Error
          ? error.message
          : "An unexpected error occurred."}
      </AlertDescription>
      <AlertAction>
        <Button onClick={reset} size="xs" type="button" variant="secondary">
          Try again
        </Button>
      </AlertAction>
    </Alert>
  );
}
