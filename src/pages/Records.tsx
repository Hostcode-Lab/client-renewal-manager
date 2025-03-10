
import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusIcon, Download, Filter, Edit, UserPlus } from "lucide-react";
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
import EditRecordDialog from "@/components/EditRecordDialog";
import AddClientDialog from "@/components/AddClientDialog";
import { Record, Client } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

// Sample clients data
const sampleClients: Client[] = [
  {
    id: "client1",
    name: "Client One",
    ipAddress: "192.168.1.1"
  },
  {
    id: "client2",
    name: "Client Two",
    ipAddress: "192.168.1.2"
  }
];

const Records = () => {
  const { toast } = useToast();
  const [records, setRecords] = useState<Record[]>(sampleRecords);
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [showFilters, setShowFilters] = useState(false);

  // Generate month options for select
  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  const getClientNameById = (clientId: string): string => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const getClientIpById = (clientId: string): string => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.ipAddress : "N/A";
  };

  const handleAddRecord = (newRecord: Record) => {
    setRecords([...records, { ...newRecord, id: Date.now().toString() }]);
    toast({
      title: "Record added",
      description: "The hosting record has been added successfully.",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditRecord = (updatedRecord: Record) => {
    setRecords(records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    ));
    toast({
      title: "Record updated",
      description: "The hosting record has been updated successfully.",
    });
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleAddClient = (newClient: Client) => {
    setClients([...clients, { ...newClient, id: Date.now().toString() }]);
    toast({
      title: "Client added",
      description: "The client has been added successfully.",
    });
    setIsAddClientDialogOpen(false);
  };

  const handleEditClick = (record: Record) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
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
      ...filteredRecords.map(record => [
        record.date.toLocaleDateString(),
        getClientNameById(record.clientId),
        getClientIpById(record.clientId),
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
    link.setAttribute("download", `hosting-records-${filterMonth}-${filterYear}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export complete",
      description: "Records have been exported to CSV successfully.",
    });
  };

  // Filter records by month and year
  const filteredRecords = records.filter(record => {
    if (!filterMonth && !filterYear) return true;
    
    const recordMonth = record.date.getMonth().toString();
    const recordYear = record.date.getFullYear().toString();
    
    return (
      (!filterMonth || recordMonth === filterMonth) && 
      (!filterYear || recordYear === filterYear)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Records</h1>
            <p className="text-muted-foreground mt-2">View and manage your hosting records</p>
          </div>
          <div className="space-x-2 flex items-center">
            <Button variant="outline" size="sm" onClick={() => setIsAddClientDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
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
            <div className="flex items-center space-x-2">
              {showFilters ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Select value={filterMonth} onValueChange={setFilterMonth}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterYear} onValueChange={setFilterYear}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    Apply
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Renewal Status</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead className="text-right">Received ($)</TableHead>
                  <TableHead className="text-right">Cost ($)</TableHead>
                  <TableHead className="text-right">Profit ($)</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date.toLocaleDateString()}</TableCell>
                      <TableCell>{getClientNameById(record.clientId)}</TableCell>
                      <TableCell>{getClientIpById(record.clientId)}</TableCell>
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
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
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
          clients={clients}
        />
      )}

      {isEditDialogOpen && selectedRecord && (
        <EditRecordDialog 
          open={isEditDialogOpen} 
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRecord(null);
          }} 
          onUpdate={handleEditRecord}
          record={selectedRecord}
          clients={clients}
        />
      )}

      {isAddClientDialogOpen && (
        <AddClientDialog 
          open={isAddClientDialogOpen} 
          onClose={() => setIsAddClientDialogOpen(false)} 
          onAdd={handleAddClient}
        />
      )}
    </Layout>
  );
};

export default Records;
