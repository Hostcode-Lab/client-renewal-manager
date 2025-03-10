
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Platform } from "@/types";

interface EditPlatformDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (platform: Platform) => void;
  platform: Platform;
}

const EditPlatformDialog = ({ open, onClose, onUpdate, platform }: EditPlatformDialogProps) => {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (platform) {
      setName(platform.name);
    }
  }, [platform, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedPlatform: Platform = {
      ...platform,
      name
    };
    
    onUpdate(updatedPlatform);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Platform</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Platform Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hostcode"
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit">Update Platform</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlatformDialog;
