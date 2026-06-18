import { Button } from "@heho/ui/components/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="space-y-4 text-center">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl">Heho</h1>
          <p className="text-muted-foreground text-sm">
            Dashboard scaffold is ready.
          </p>
        </div>

        <Button type="button">Get started</Button>
      </section>
    </main>
  );
}
