import { Record, Client, Platform, DashboardStats } from "@/types";
import { DbClient, DbPlatform, DbRecord } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";

// Convert database record to app record
export const dbRecordToRecord = (dbRecord: DbRecord): Record => ({
  id: dbRecord.id,
  clientId: dbRecord.client_id,
  date: new Date(dbRecord.date),
  renewalStatus: dbRecord.renewal_status as "Renewed" | "Canceled",
  vendorInvoiceNumber: dbRecord.vendor_invoice_number,
  receivedCost: Number(dbRecord.received_cost),
  vendorCost: Number(dbRecord.vendor_cost),
  totalProfit: Number(dbRecord.total_profit),
  paymentStatus: dbRecord.payment_status as "Paid" | "Pending"
});

// Convert app record to database record
export const recordToDbRecord = (record: Record): Omit<DbRecord, 'id' | 'created_at'> => ({
  client_id: record.clientId,
  date: record.date.toISOString(),
  renewal_status: record.renewalStatus,
  vendor_invoice_number: record.vendorInvoiceNumber,
  received_cost: record.receivedCost,
  vendor_cost: record.vendorCost,
  total_profit: record.totalProfit,
  payment_status: record.paymentStatus
});

// Convert database client to app client
export const dbClientToClient = (dbClient: DbClient): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  ipAddress: dbClient.ip_address || "",
  platform: dbClient.platform || ""
});

// Convert app client to database client
export const clientToDbClient = (client: Client): Omit<DbClient, 'id' | 'created_at'> => ({
  name: client.name,
  ip_address: client.ipAddress,
  platform: client.platform
});

// Convert database platform to app platform
export const dbPlatformToPlatform = (dbPlatform: DbPlatform): Platform => ({
  id: dbPlatform.id,
  name: dbPlatform.name
});

// Convert app platform to database platform
export const platformToDbPlatform = (platform: Platform): Omit<DbPlatform, 'id' | 'created_at'> => ({
  name: platform.name
});

export const getStoredClients = async (): Promise<Client[]> => {
  try {
    const { data: dbClients, error } = await supabase.from('clients').select('*');
    
    if (error) {
      console.error("Error fetching clients:", error);
      // Fallback to localStorage if supabase fetch fails
      const storedClients = localStorage.getItem('clients');
      if (storedClients) {
        return JSON.parse(storedClients);
      }
      return [];
    }
    
    return dbClients.map(dbClientToClient);
  } catch (error) {
    console.error("Error in getStoredClients:", error);
    return [];
  }
};

export const getStoredPlatforms = async (): Promise<Platform[]> => {
  try {
    const { data: dbPlatforms, error } = await supabase.from('platforms').select('*');
    
    if (error) {
      console.error("Error fetching platforms:", error);
      // Fallback to localStorage if supabase fetch fails
      const storedPlatforms = localStorage.getItem('platforms');
      if (storedPlatforms) {
        return JSON.parse(storedPlatforms);
      }
      return [];
    }
    
    return dbPlatforms.map(dbPlatformToPlatform);
  } catch (error) {
    console.error("Error in getStoredPlatforms:", error);
    return [];
  }
};

export const getStoredRecords = async (): Promise<Record[]> => {
  try {
    const { data: dbRecords, error } = await supabase.from('records').select('*');
    
    if (error) {
      console.error("Error fetching records:", error);
      // Fallback to localStorage if supabase fetch fails
      const storedRecords = localStorage.getItem('records');
      if (storedRecords) {
        return JSON.parse(storedRecords).map((record: any) => ({
          ...record,
          date: new Date(record.date)
        }));
      }
      return [];
    }
    
    return dbRecords.map(dbRecordToRecord);
  } catch (error) {
    console.error("Error in getStoredRecords:", error);
    return [];
  }
};

export const saveRecordsToStorage = async (records: Record[]): Promise<void> => {
  try {
    // First save to localStorage as backup
    localStorage.setItem('records', JSON.stringify(records));
    
    // Then try to save to Supabase
    for (const record of records) {
      // Check if record already exists in Supabase
      const { data: existingRecord } = await supabase
        .from('records')
        .select('id')
        .eq('id', record.id)
        .single();
      
      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('records')
          .update(recordToDbRecord(record))
          .eq('id', record.id);
          
        if (error) console.error("Error updating record:", error);
      } else {
        // Insert new record
        const { error } = await supabase
          .from('records')
          .insert({
            id: record.id,
            ...recordToDbRecord(record)
          });
          
        if (error) console.error("Error inserting record:", error);
      }
    }
  } catch (error) {
    console.error("Error in saveRecordsToStorage:", error);
  }
};

export const saveClientsToStorage = async (clients: Client[]): Promise<void> => {
  try {
    // First save to localStorage as backup
    localStorage.setItem('clients', JSON.stringify(clients));
    
    // Then try to save to Supabase
    for (const client of clients) {
      // Check if client already exists in Supabase
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('id', client.id)
        .single();
      
      if (existingClient) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update(clientToDbClient(client))
          .eq('id', client.id);
          
        if (error) console.error("Error updating client:", error);
      } else {
        // Insert new client
        const { error } = await supabase
          .from('clients')
          .insert({
            id: client.id,
            ...clientToDbClient(client)
          });
          
        if (error) console.error("Error inserting client:", error);
      }
    }
  } catch (error) {
    console.error("Error in saveClientsToStorage:", error);
  }
};

export const savePlatformsToStorage = async (platforms: Platform[]): Promise<void> => {
  try {
    // First save to localStorage as backup
    localStorage.setItem('platforms', JSON.stringify(platforms));
    
    // Then try to save to Supabase
    for (const platform of platforms) {
      // Check if platform already exists in Supabase
      const { data: existingPlatform } = await supabase
        .from('platforms')
        .select('id')
        .eq('id', platform.id)
        .single();
      
      if (existingPlatform) {
        // Update existing platform
        const { error } = await supabase
          .from('platforms')
          .update(platformToDbPlatform(platform))
          .eq('id', platform.id);
          
        if (error) console.error("Error updating platform:", error);
      } else {
        // Insert new platform
        const { error } = await supabase
          .from('platforms')
          .insert({
            id: platform.id,
            ...platformToDbPlatform(platform)
          });
          
        if (error) console.error("Error inserting platform:", error);
      }
    }
  } catch (error) {
    console.error("Error in savePlatformsToStorage:", error);
  }
};

export const calculateDashboardStats = (records: Record[], clients: Client[]): DashboardStats => {
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
