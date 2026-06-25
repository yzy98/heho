import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { currentOrganizationResultQueryOptions } from "@/lib/current-organization";

export const Route = createFileRoute("/_app/_workspace")({
  beforeLoad: async ({ context }) => {
    // Check current organization
    const organizationResult = await context.queryClient.ensureQueryData(
      currentOrganizationResultQueryOptions()
    );

    // No organization for now, redirect to onboarding page
    if (
      organizationResult.status === "membership_required" ||
      organizationResult.status === "onboarding_required"
    ) {
      throw redirect({
        to: "/onboarding",
      });
    }

    if (organizationResult.status === "error") {
      throw organizationResult.error;
    }

    return {
      organization: organizationResult.organization,
    };
  },
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return <Outlet />;
}
