import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusIcon, Download, Filter, Edit, UserPlus, Trash2 } from "lucide-react";
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
import { Record, Client, Platform } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const sampleRecords: Record[] = [
  {
    id: "1",
    clientId: "client1",
    date: new Date(2023, 9, 15),
    renewalStatus: "Renewed",
    vendorInvoiceNumber: "INV-2023-001",
    receivedCost: 8400,
    vendorCost: 5600,
    totalProfit: 2800,
    paymentStatus: "Paid"
  },
  {
    id: "2",
    clientId: "client2",
    date: new Date(2023, 9, 18),
    renewalStatus: "Canceled",
    vendorInvoiceNumber: "INV-2023-002",
    receivedCost: 10500,
    vendorCost: 7000,
    totalProfit: 3500,
    paymentStatus: "Pending"
  }
];

const getStoredClients = (): Client[] => {
  const storedClients = localStorage.getItem('clients');
  if (storedClients) {
    return JSON.parse(storedClients);
  }
  return [
    {
      id: "client1",
      name: "Client One",
      ipAddress: "192.168.1.1",
      platform: "platform1"
    },
    {
      id: "client2",
      name: "Client Two",
      ipAddress: "192.168.1.2",
      platform: "platform2"
    }
  ];
};

const getStoredPlatforms = (): Platform[] => {
  const storedPlatforms = localStorage.getItem('platforms');
  if (storedPlatforms) {
    return JSON.parse(storedPlatforms);
  }
  return [
    { id: "platform1", name: "Hostcode" },
    { id: "platform2", name: "Serverlize" }
  ];
};

const getStoredRecords = (): Record[] => {
  const storedRecords = localStorage.getItem('records');
  if (storedRecords) {
    return JSON.parse(storedRecords).map((record: any) => ({
      ...record,
      date: new Date(record.date)
    }));
  }
  return sampleRecords;
};

const saveRecordsToStorage = (records: Record[]) => {
  localStorage.setItem('records', JSON.stringify(records));
};

const saveClientsToStorage = (clients: Client[]) => {
  localStorage.setItem('clients', JSON.stringify(clients));
};

const calculateDashboardStats = (records: Record[], clients: Client[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthRecords = records.filter(record => {
    const recordMonth = record.date.getMonth();
    const recordYear = record.date.getFullYear();
    return recordMonth === currentMonth && recordYear === currentYear;
  });
  
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonthRecords = records.filter(record => {
    const recordMonth = record.date.getMonth();
    const recordYear = record.date.getFullYear();
    return recordMonth === prevMonth && recordYear === prevYear;
  });
  
  const clientsWithRecords = new Set();
  records.forEach(record => {
    if (record.renewalStatus === "Renewed") {
      clientsWithRecords.add(record.clientId);
    }
  });
  
  const monthlyRevenue = currentMonthRecords.reduce((sum, record) => sum + record.receivedCost, 0);
  const monthlyProfit = currentMonthRecords.reduce((sum, record) => sum + record.totalProfit, 0);
  
  let avgProfitPercentage = 0;
  if (monthlyRevenue > 0) {
    avgProfitPercentage = (monthlyProfit / monthlyRevenue) * 100;
  }
  
  const prevMonthRevenue = prevMonthRecords.reduce((sum, record) => sum + record.receivedCost, 0);
  let growthPercentage = 0;
  if (prevMonthRevenue > 0) {
    growthPercentage = ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
  }
  
  return {
    activeClients: clientsWithRecords.size,
    monthlyRevenue,
    monthlyProfit,
    avgProfitPercentage: Math.round(avgProfitPercentage * 100) / 100,
    growthPercentage: Math.round(growthPercentage * 100) / 100
  };
};

const Records = () => {
  const { toast } = useToast();
  const [records, setRecords] = useState<Record[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [showFilters, setShowFilters] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    setClients(getStoredClients());
    setPlatforms(getStoredPlatforms());
    setRecords(getStoredRecords());
  }, []);

  useEffect(() => {
    const stats = calculateDashboardStats(records, clients);
    localStorage.setItem('dashboardStats', JSON.stringify(stats));
  }, [records, clients]);

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

  const getClientPlatformById = (clientId: string): string => {
    const client = clients.find(client => client.id === clientId);
    if (!client || !client.platform) return "N/A";
    
    const platform = platforms.find(p => p.id === client.platform);
    return platform ? platform.name : "Unknown Platform";
  };

  const handleAddRecord = (newRecord: Record) => {
    const updatedRecords = [...records, { ...newRecord, id: Date.now().toString() }];
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    toast({
      title: "Record added",
      description: "The hosting record has been added successfully.",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditRecord = (updatedRecord: Record) => {
    const updatedRecords = records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    toast({
      title: "Record updated",
      description: "The hosting record has been updated successfully.",
    });
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleDeleteRecord = (record: Record) => {
    const updatedRecords = records.filter(r => r.id !== record.id);
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    toast({
      title: "Record deleted",
      description: "The hosting record has been deleted successfully.",
    });
    setRecordToDelete(null);
  };

  const handleAddClient = (newClient: Client) => {
    const updatedClients = [...clients, { ...newClient, id: Date.now().toString() }];
    setClients(updatedClients);
    saveClientsToStorage(updatedClients);
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

  const handleDeleteClick = (record: Record) => {
    setRecordToDelete(record);
  };

  const applyFilters = () => {
    setShowFilters(false);
    setIsFiltered(true);
  };

  const clearFilters = () => {
    setFilterMonth(new Date().getMonth().toString());
    setFilterYear(new Date().getFullYear().toString());
    setIsFiltered(false);
  };

  const exportToCSV = () => {
    const headers = [
      "Date", 
      "Client", 
      "IP Address",
      "Platform",
      "Renewal Status", 
      "Invoice #", 
      "Received (₹)", 
      "Cost (₹)", 
      "Profit (₹)", 
      "Payment Status"
    ];
    
    const csvContent = [
      headers.join(","),
      ...filteredRecords.map(record => [
        record.date.toLocaleDateString(),
        getClientNameById(record.clientId),
        getClientIpById(record.clientId),
        getClientPlatformById(record.clientId),
        record.renewalStatus,
        record.vendorInvoiceNumber,
        record.receivedCost.toFixed(2),
        record.vendorCost.toFixed(2),
        record.totalProfit.toFixed(2),
        record.paymentStatus
      ].join(","))
    ].join("\n");
    
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

  const filteredRecords = records.filter(record => {
    if (!isFiltered) return true;
    
    const recordMonth = record.date.getMonth().toString();
    const recordYear = record.date.getFullYear().toString();
    
    return (
      recordMonth === filterMonth && 
      recordYear === filterYear
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
            <Button variant="outline" size="sm" asChild>
              <Link to="/platforms">
                Manage Platforms
              </Link>
            </Button>
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
                  <Button variant="default" size="sm" onClick={applyFilters}>
                    Apply
                  </Button>
                </>
              ) : (
                <div className="flex space-x-2">
                  {isFiltered && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
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
                  <TableHead>Platform</TableHead>
                  <TableHead>Renewal Status</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead className="text-right">Received (₹)</TableHead>
                  <TableHead className="text-right">Cost (₹)</TableHead>
                  <TableHead className="text-right">Profit (₹)</TableHead>
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
                      <TableCell>{getClientPlatformById(record.clientId)}</TableCell>
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
                        <div className="flex justify-end space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(record)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                      {isFiltered 
                        ? `No records found for ${months.find(m => m.value === filterMonth)?.label} ${filterYear}. Add your first record!`
                        : "No records found. Add your first record!"}
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
          platforms={platforms}
        />
      )}

      <AlertDialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => recordToDelete && handleDeleteRecord(recordToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Records;
