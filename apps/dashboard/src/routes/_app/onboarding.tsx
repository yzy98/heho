import { Button } from "@heho/ui/components/button";
import { toast } from "@heho/ui/components/sonner";
import { Spinner } from "@heho/ui/components/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { currentOrganizationResultQueryOptions } from "@/lib/current-organization";

export const Route = createFileRoute("/_app/onboarding")({
  beforeLoad: async ({ context }) => {
    // Check current organization
    const organizationResult = await context.queryClient.ensureQueryData(
      currentOrganizationResultQueryOptions()
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
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { session, organizationStatus } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogOut = async () => {
    setIsSigningOut(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            queryClient.clear();
            navigate({ to: "/sign-in" });
          },
          onError: () => {
            toast.error("Unable to sign out. Please try again.");
          },
        },
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {organizationStatus === "membership_required" ? (
        <div className="space-y-6">
          <h2>Need invitation</h2>
          <p>
            You are not the member of current organization. Please contract the
            owner for invitation.
          </p>
        </div>
      ) : (
        <div>CREATE ORGANIZATION FORM</div>
      )}

      <div>
        <p>{session.user.name}</p>
        <p>{session.user.email}</p>
      </div>

      <Button disabled={isSigningOut} onClick={handleLogOut} type="button">
        {isSigningOut && <Spinner data-icon="inline-start" />}
        {isSigningOut ? "Signing out..." : "Log out"}
      </Button>
    </div>
  );
}
