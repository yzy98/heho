import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_workspace/providers")({
  component: ProvidersPage,
});

function ProvidersPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-semibold text-2xl">Providers</h1>
      <p className="text-muted-foreground text-sm">
        Configure an OpenAI-compatible provider to power your chatbots.
      </p>
    </div>
  );
}
