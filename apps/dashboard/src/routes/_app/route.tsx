import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/queries/session";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      sessionQueryOptions()
    );

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
