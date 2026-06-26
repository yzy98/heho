import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context }) => {
    const session = context.auth.data;

    if (session) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Outlet />
    </main>
  );
}
