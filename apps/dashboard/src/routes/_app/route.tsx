import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context }) => {
    const session = context.auth.data;

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
