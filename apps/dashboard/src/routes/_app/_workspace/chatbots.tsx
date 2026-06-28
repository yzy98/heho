import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_workspace/chatbots")({
  staticData: {
    breadcrumb: "Chatbots",
  },
  component: ChatbotsPage,
});

function ChatbotsPage() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Create a chatbot after configuring a provider.
      </p>
    </div>
  );
}
