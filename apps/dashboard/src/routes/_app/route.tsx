import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (!session) {
      throw redirect({
        to: "/sign-in",
      });
    }

    return { session };
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <Outlet />
    </main>
  );
}
