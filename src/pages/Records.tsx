
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusIcon, Download, Filter } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AddRecordDialog from "@/components/AddRecordDialog";
import { Record } from "@/types";

// Sample data - would be replaced with actual database data
const sampleRecords: Record[] = [
  {
    id: "1",
    clientId: "client1",
    date: new Date(2023, 9, 15),
    renewalStatus: "Renewed",
    vendorInvoiceNumber: "INV-2023-001",
    receivedCost: 120,
    vendorCost: 80,
    totalProfit: 40,
    paymentStatus: "Paid"
  },
  {
    id: "2",
    clientId: "client2",
    date: new Date(2023, 9, 18),
    renewalStatus: "Canceled",
    vendorInvoiceNumber: "INV-2023-002",
    receivedCost: 150,
    vendorCost: 100,
    totalProfit: 50,
    paymentStatus: "Pending"
  }
];

const Records = () => {
  const { toast } = useToast();
  const [records, setRecords] = useState<Record[]>(sampleRecords);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handleAddRecord = (newRecord: Record) => {
    setRecords([...records, { ...newRecord, id: Date.now().toString() }]);
    toast({
      title: "Record added",
      description: "The hosting record has been added successfully.",
    });
    setIsAddDialogOpen(false);
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Date", 
      "Client", 
      "IP Address", 
      "Renewal Status", 
      "Invoice #", 
      "Received", 
      "Cost", 
      "Profit", 
      "Payment Status"
    ];
    
    const csvContent = [
      headers.join(","),
      ...records.map(record => [
        record.date.toLocaleDateString(),
        "Client Name", // This would come from a client lookup
        "IP Address", // This would come from a client lookup
        record.renewalStatus,
        record.vendorInvoiceNumber,
        record.receivedCost,
        record.vendorCost,
        record.totalProfit,
        record.paymentStatus
      ].join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hosting-records-${currentMonth+1}-${currentYear}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export complete",
      description: "Records have been exported to CSV successfully.",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Records</h1>
            <p className="text-muted-foreground mt-2">View and manage your hosting records</p>
          </div>
          <div className="space-x-2 flex items-center">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </div>

        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Hosting Records</h2>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Renewal Status</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead className="text-right">Received ($)</TableHead>
                  <TableHead className="text-right">Cost ($)</TableHead>
                  <TableHead className="text-right">Profit ($)</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length > 0 ? (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date.toLocaleDateString()}</TableCell>
                      <TableCell>Client Name</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.renewalStatus === "Renewed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {record.renewalStatus}
                        </span>
                      </TableCell>
                      <TableCell>{record.vendorInvoiceNumber}</TableCell>
                      <TableCell className="text-right">{record.receivedCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{record.vendorCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {record.totalProfit.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.paymentStatus === "Paid" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {record.paymentStatus}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                      No records found for this period. Add your first record!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {isAddDialogOpen && (
        <AddRecordDialog 
          open={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
          onAdd={handleAddRecord}
        />
      )}
    </Layout>
  );
};

export default Records;
