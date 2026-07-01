import { ResponsiveDialog } from "@heho/ui/components/responsive-dialog";
import { useIsMobile } from "@heho/ui/hooks/use-mobile";
import { CreateChatbotForm } from "@/components/forms/create-chatbot-form";
import type { LlmProvider } from "@/queries/llm-provider";

type CreateChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  providers: LlmProvider[];
};

export const CreateChatDialog = ({
  open,
  onOpenChange,
  organizationId,
  providers,
}: CreateChatDialogProps) => {
  const isMobile = useIsMobile();

  return (
    <ResponsiveDialog
      description="Configure a chatbot for your organization."
      onOpenChange={onOpenChange}
      open={open}
      title="Add chatbot"
    >
      <CreateChatbotForm
        className={isMobile ? "px-4" : undefined}
        onSuccess={() => onOpenChange(false)}
        organizationId={organizationId}
        providers={providers}
      />
    </ResponsiveDialog>
  );
};
