
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Client } from "@/types";

interface EditClientDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (client: Client) => void;
  client: Client;
}

const EditClientDialog = ({ open, onClose, onUpdate, client }: EditClientDialogProps) => {
  const [name, setName] = useState<string>("");
  const [ipAddress, setIpAddress] = useState<string>("");

  // Load client data when dialog opens
  useEffect(() => {
    if (client) {
      setName(client.name);
      setIpAddress(client.ipAddress);
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedClient: Client = {
      ...client,
      name,
      ipAddress
    };
    
    onUpdate(updatedClient);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter client name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ipAddress">IP Address</Label>
            <Input
              id="ipAddress"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit">Update Client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
