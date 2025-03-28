
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Record, Client } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { recordToDbRecord } from "@/utils/recordUtils";

interface AddRecordDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (record: Record) => void;
  clients: Client[];
}

const AddRecordDialog = ({ open, onClose, onAdd, clients }: AddRecordDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [clientId, setClientId] = useState<string>("");
  const [renewalStatus, setRenewalStatus] = useState<"Renewed" | "Canceled">("Renewed");
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState<string>("");
  const [receivedCost, setReceivedCost] = useState<string>("");
  const [vendorCost, setVendorCost] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">("Pending");

  const calculateProfit = () => {
    const received = parseFloat(receivedCost) || 0;
    const cost = parseFloat(vendorCost) || 0;
    return received - cost;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const recordId = crypto.randomUUID();
    const totalProfit = calculateProfit();
    
    const newRecord: Record = {
      id: recordId,
      clientId,
      date: new Date(date),
      renewalStatus,
      vendorInvoiceNumber,
      receivedCost: parseFloat(receivedCost) || 0,
      vendorCost: parseFloat(vendorCost) || 0,
      totalProfit,
      paymentStatus
    };
    
    setIsSubmitting(true);
    
    try {
      // Add record directly to Supabase
      const { error } = await supabase
        .from('records')
        .insert({
          id: recordId,
          ...recordToDbRecord(newRecord)
        });
      
      if (error) {
        throw error;
      }
      
      // Call the parent's onAdd function
      onAdd(newRecord);
      
      toast({
        title: "Record added",
        description: "The hosting record has been added successfully.",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error adding record:", error);
      toast({
        title: "Error adding record",
        description: error.message || "There was a problem adding your record.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get platform info for the selected client
  const getClientPlatform = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.platform) return "";
    
    return client.platform;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Hosting Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select 
                value={clientId} 
                onValueChange={setClientId}
                disabled={isSubmitting}
                required
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.platform ? `(${getClientPlatform(client.id)})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="renewal-status">Renewal Status</Label>
              <Select 
                value={renewalStatus} 
                onValueChange={(value) => setRenewalStatus(value as "Renewed" | "Canceled")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="renewal-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Renewed">Renewed</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice">Vendor Invoice #</Label>
              <Input
                id="invoice"
                value={vendorInvoiceNumber}
                onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-2023-001"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="received">Received Amount (₹)</Label>
              <Input
                id="received"
                type="number"
                step="0.01"
                min="0"
                value={receivedCost}
                onChange={(e) => setReceivedCost(e.target.value)}
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Vendor Cost (₹)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={vendorCost}
                onChange={(e) => setVendorCost(e.target.value)}
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profit">Total Profit (₹)</Label>
              <Input
                id="profit"
                type="number"
                value={calculateProfit()}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-status">Payment Status</Label>
              <Select 
                value={paymentStatus} 
                onValueChange={(value) => setPaymentStatus(value as "Paid" | "Pending")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="payment-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecordDialog;
