import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_workspace/providers")({
  staticData: {
    breadcrumb: "Providers",
  },
  component: ProvidersPage,
});

function ProvidersPage() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-sm">
        Configure an OpenAI-compatible provider to power your chatbots.
      </p>
    </div>
  );
}
