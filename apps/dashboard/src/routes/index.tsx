import { Button } from "@heho/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";
import { apiClient } from "@/lib/api-client";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const checkHealth = async () => {
    const res = await apiClient.health.$get();

    if (res.ok) {
      const data = await res.json();
      console.log(JSON.stringify(data));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="space-y-4 text-center">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl">Heho</h1>
          <p className="text-muted-foreground text-sm">
            Dashboard scaffold is ready.
          </p>
        </div>

        <Button onClick={checkHealth} type="button">
          Check health
        </Button>
      </section>
    </main>
  );
}
