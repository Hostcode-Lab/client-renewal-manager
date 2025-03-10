
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Platform } from "@/types";

interface AddPlatformDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (platform: Platform) => void;
}

const AddPlatformDialog = ({ open, onClose, onAdd }: AddPlatformDialogProps) => {
  const [name, setName] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPlatform: Platform = {
      id: "", // This will be set by the parent component
      name
    };
    
    onAdd(newPlatform);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Platform</DialogTitle>
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
            <Button type="submit">Add Platform</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlatformDialog;
