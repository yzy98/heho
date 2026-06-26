import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@heho/ui/components/sidebar";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

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
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <main>
          <SidebarTrigger />
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
