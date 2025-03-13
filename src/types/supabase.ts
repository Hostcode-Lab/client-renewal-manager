
export type DbPlatform = {
  id: string;
  name: string;
  created_at: string;
};

export type DbClient = {
  id: string;
  name: string;
  ip_address: string | null;
  platform: string | null;
  created_at: string;
};

export type DbRecord = {
  id: string;
  client_id: string;
  date: string;
  renewal_status: string;
  vendor_invoice_number: string;
  received_cost: number;
  vendor_cost: number;
  total_profit: number;
  payment_status: string;
  created_at: string;
};
