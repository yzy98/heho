import { Toaster } from "@heho/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <Outlet />
      {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
    </div>
  );
}
