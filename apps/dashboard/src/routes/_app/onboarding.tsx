import { createFileRoute, redirect } from "@tanstack/react-router";
import { CreateOrganizationForm } from "@/components/create-organization-form";
import { organizationQueryOptions } from "@/queries/organization";

export const Route = createFileRoute("/_app/onboarding")({
  beforeLoad: async ({ context }) => {
    // Check current organization
    const organizationResult = await context.queryClient.ensureQueryData(
      organizationQueryOptions()
    );

    // Have organization, redirect back to dashboard home page
    if (organizationResult.status === "ok") {
      throw redirect({
        to: "/",
      });
    }

    if (organizationResult.status === "error") {
      throw organizationResult.error;
    }

    return {
      organizationStatus: organizationResult.status,
    };
  },
  component: OnboardingPage,
});

function OnboardingPage() {
  const { organizationStatus } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-6">
      {organizationStatus === "membership_required" ? (
        <div className="flex flex-col gap-6">
          <h2>Need invitation</h2>
          <p>
            You are not the member of current organization. Please contract the
            owner for invitation.
          </p>
        </div>
      ) : (
        <div className="max-w-sm">
          <CreateOrganizationForm />
        </div>
      )}
    </div>
  );
}
