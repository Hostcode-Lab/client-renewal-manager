
export type Client = {
  id: string;
  name: string;
  ipAddress: string;
  platform: string;
};

export type Platform = {
  id: string;
  name: string;
};

export type Record = {
  id: string;
  clientId: string;
  date: Date;
  renewalStatus: "Renewed" | "Canceled";
  vendorInvoiceNumber: string;
  receivedCost: number;
  vendorCost: number;
  totalProfit: number;
  paymentStatus: "Paid" | "Pending";
};

export type DashboardStats = {
  activeClients: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  avgProfitPercentage: number;
  growthPercentage: number;
};
