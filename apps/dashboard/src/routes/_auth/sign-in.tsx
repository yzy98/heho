import { createFileRoute } from "@tanstack/react-router";
import { SignInForm } from "@/components/forms/sign-in-form";

export const Route = createFileRoute("/_auth/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="w-full max-w-sm">
      <SignInForm />
    </div>
  );
}
