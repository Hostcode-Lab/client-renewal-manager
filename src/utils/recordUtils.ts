
import { Record, Client } from "@/types";

export const getStoredClients = (): Client[] => {
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

export const getStoredPlatforms = () => {
  const storedPlatforms = localStorage.getItem('platforms');
  if (storedPlatforms) {
    return JSON.parse(storedPlatforms);
  }
  return [
    { id: "platform1", name: "Hostcode" },
    { id: "platform2", name: "Serverlize" }
  ];
};

export const getStoredRecords = (): Record[] => {
  const storedRecords = localStorage.getItem('records');
  if (storedRecords) {
    return JSON.parse(storedRecords).map((record: any) => ({
      ...record,
      date: new Date(record.date)
    }));
  }
  return [
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
};

export const saveRecordsToStorage = (records: Record[]) => {
  localStorage.setItem('records', JSON.stringify(records));
};

export const saveClientsToStorage = (clients: Client[]) => {
  localStorage.setItem('clients', JSON.stringify(clients));
};

export const calculateDashboardStats = (records: Record[], clients: Client[]) => {
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

export const exportToCSV = (records: Record[], clients: any[], platforms: any[], filterMonth: string, filterYear: string, onSuccess: () => void) => {
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
    
    const platform = platforms.find((p: any) => p.id === client.platform);
    return platform ? platform.name : "Unknown Platform";
  };

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
    ...records.map(record => [
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
  
  onSuccess();
};
