
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeletePlatformDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  platformName: string;
}

const DeletePlatformDialog = ({ open, onClose, onDelete, platformName }: DeletePlatformDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Platform</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete platform "{platformName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePlatformDialog;
