import { createFileRoute } from "@tanstack/react-router";
import { SignUpForm } from "@/components/forms/sign-up-form";

export const Route = createFileRoute("/_auth/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="w-full max-w-sm">
      <SignUpForm />
    </div>
  );
}
