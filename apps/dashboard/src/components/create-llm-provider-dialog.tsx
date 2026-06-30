import { Button } from "@heho/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@heho/ui/components/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@heho/ui/components/drawer";
import { useIsMobile } from "@heho/ui/hooks/use-mobile";
import { CreateLlmProviderForm } from "./create-llm-provider-form";

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

  if (isMobile) {
    return (
      <Drawer onOpenChange={onOpenChange} open={open}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Add llm provider</DrawerTitle>
            <DrawerDescription>
              Add credentials for one model capability.
            </DrawerDescription>
          </DrawerHeader>
          <CreateLlmProviderForm
            className="px-4"
            onSuccess={() => onOpenChange(false)}
            organizationId={organizationId}
          />
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add llm provider</DialogTitle>
          <DialogDescription>
            Add credentials for one model capability.
          </DialogDescription>
        </DialogHeader>
        <CreateLlmProviderForm
          onSuccess={() => onOpenChange(false)}
          organizationId={organizationId}
        />
      </DialogContent>
    </Dialog>
  );
};
