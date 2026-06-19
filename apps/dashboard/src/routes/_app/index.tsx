import { Button } from "@heho/ui/components/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_app/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();

  const handleLogOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: "/sign-in" });
        },
      },
    });
  };

  return (
    <div>
      Hello Dashboard{" "}
      <Button onClick={handleLogOut} type="button">
        Log out
      </Button>
    </div>
  );
}
