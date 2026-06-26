import { toast } from "@heho/ui/components/sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useNavigate,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export const useSignOut = () => {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const { auth } = useRouteContext({ from: "__root__" });
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();

  const signOut = async () => {
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

  return {
    isSigningOut,
    signOut,
  };
};
