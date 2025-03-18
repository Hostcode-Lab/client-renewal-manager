
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, Platform } from "@/types";
import { getStoredPlatforms } from "@/utils/recordUtils";

interface AddClientDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (client: Client) => void;
  platforms?: Platform[];
}

const AddClientDialog = ({ open, onClose, onAdd, platforms = [] }: AddClientDialogProps) => {
  const [name, setName] = useState<string>("");
  const [ipAddress, setIpAddress] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [localPlatforms, setLocalPlatforms] = useState<Platform[]>(platforms);
  const [isLoading, setIsLoading] = useState(false);

  // Ensure we always have the latest platforms
  useEffect(() => {
    const fetchLatestPlatforms = async () => {
      if (open) {
        setIsLoading(true);
        try {
          const latestPlatforms = await getStoredPlatforms();
          setLocalPlatforms(latestPlatforms);
        } catch (error) {
          console.error("Error fetching platforms:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLatestPlatforms();
  }, [open]);

  // Update local platforms when prop changes
  useEffect(() => {
    if (platforms.length > 0) {
      setLocalPlatforms(platforms);
    }
  }, [platforms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClient: Client = {
      id: "", // This will be set by the parent component
      name,
      ipAddress,
      platform
    };
    
    onAdd(newClient);
    setName("");
    setIpAddress("");
    setPlatform("");
  };

  const handleDialogClose = () => {
    setName("");
    setIpAddress("");
    setPlatform("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
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

          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground py-2">Loading platforms...</div>
            ) : (
              <Select value={platform} onValueChange={setPlatform} required>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {localPlatforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>Add Client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
