
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Record, Client } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { recordToDbRecord } from "@/utils/recordUtils";

interface EditRecordDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (record: Record) => void;
  record: Record;
  clients: Client[];
}

const EditRecordDialog = ({ open, onClose, onUpdate, record, clients }: EditRecordDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [renewalStatus, setRenewalStatus] = useState<"Renewed" | "Canceled">("Renewed");
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState<string>("");
  const [receivedCost, setReceivedCost] = useState<string>("");
  const [vendorCost, setVendorCost] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">("Pending");

  // Load record data when dialog opens
  useEffect(() => {
    if (record) {
      setDate(record.date.toISOString().split('T')[0]);
      setClientId(record.clientId);
      setRenewalStatus(record.renewalStatus);
      setVendorInvoiceNumber(record.vendorInvoiceNumber);
      setReceivedCost(record.receivedCost.toString());
      setVendorCost(record.vendorCost.toString());
      setPaymentStatus(record.paymentStatus);
    }
  }, [record]);

  const calculateProfit = () => {
    const received = parseFloat(receivedCost) || 0;
    const cost = parseFloat(vendorCost) || 0;
    return received - cost;
  };

  // Get platform info for the selected client
  const getClientPlatform = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.platform) return "";
    
    return client.platform;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const totalProfit = calculateProfit();
    
    const updatedRecord: Record = {
      ...record,
      clientId,
      date: new Date(date),
      renewalStatus,
      vendorInvoiceNumber,
      receivedCost: parseFloat(receivedCost) || 0,
      vendorCost: parseFloat(vendorCost) || 0,
      totalProfit,
      paymentStatus
    };
    
    try {
      // Update record directly in Supabase
      const { error } = await supabase
        .from('records')
        .update(recordToDbRecord(updatedRecord))
        .eq('id', record.id);
      
      if (error) {
        throw error;
      }
      
      // Call the parent's onUpdate function
      onUpdate(updatedRecord);
      
      toast({
        title: "Record updated",
        description: "The hosting record has been updated successfully.",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error updating record:", error);
      toast({
        title: "Error updating record",
        description: error.message || "There was a problem updating your record.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Hosting Record</DialogTitle>
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
                required
                disabled={isSubmitting}
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
              {isSubmitting ? "Updating..." : "Update Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecordDialog;
