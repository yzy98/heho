import { ResponsiveDialog } from "@heho/ui/components/responsive-dialog";
import { useIsMobile } from "@heho/ui/hooks/use-mobile";
import { CreateLlmProviderForm } from "@/components/forms/create-llm-provider-form";

type CreateLlmProviderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
};

export const CreateLlmProviderDialog = ({
  open,
  onOpenChange,
  organizationId,
}: CreateLlmProviderDialogProps) => {
  const isMobile = useIsMobile();

  return (
    <ResponsiveDialog
      description="Add credentials for one model capability."
      onOpenChange={onOpenChange}
      open={open}
      title="Add LLM provider"
    >
      <CreateLlmProviderForm
        className={isMobile ? "px-4" : undefined}
        onSuccess={() => onOpenChange(false)}
        organizationId={organizationId}
      />
    </ResponsiveDialog>
  );
};
