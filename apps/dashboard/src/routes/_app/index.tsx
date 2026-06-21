import { Button } from "@heho/ui/components/button";
import { toast } from "@heho/ui/components/sonner";
import { Spinner } from "@heho/ui/components/spinner";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();

  const { session } = Route.useRouteContext();

  const handleLogOut = async () => {
    setIsSigningOut(true);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
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
    <div>
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
