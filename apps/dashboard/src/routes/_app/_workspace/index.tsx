import { Button } from "@heho/ui/components/button";
import { toast } from "@heho/ui/components/sonner";
import { Spinner } from "@heho/ui/components/spinner";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_app/_workspace/")({
  component: HomePage,
});

function HomePage() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { session, organization, auth } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();

  const handleLogOut = async () => {
    setIsSigningOut(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: async () => {
            // Clear query cache(e.g. organizationQuery)
            queryClient.clear();
            // Refetch auth state
            await auth.refetch();
            // Invalidate the beforeLoad data, as it is out of date
            await router.invalidate();
            // Redirect to sign-in
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
      <div>
        <p>{session.user.name}</p>
        <p>{session.user.email}</p>
      </div>

      <div className="space-y-3">
        <pre className="rounded-md bg-muted p-4 text-sm">
          {JSON.stringify(organization, null, 2)}
        </pre>
      </div>

      <Button disabled={isSigningOut} onClick={handleLogOut} type="button">
        {isSigningOut && <Spinner data-icon="inline-start" />}
        {isSigningOut ? "Signing out..." : "Log out"}
      </Button>
    </div>
  );
}
