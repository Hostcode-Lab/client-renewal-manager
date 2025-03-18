
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { ArrowUpIcon, ArrowDownIcon, Users, IndianRupee, TrendingUp, Percent, AlertCircle } from "lucide-react";
import { DashboardStats, Record, Client } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { dbRecordToRecord, dbClientToClient } from "@/utils/recordUtils";

// Default stats if none are available
const defaultStats: DashboardStats = {
  activeClients: 0,
  monthlyRevenue: 0,
  monthlyProfit: 0,
  avgProfitPercentage: 0,
  growthPercentage: 0,
};

// Calculate stats based on records and selected period
const calculateDashboardStats = (records: Record[], period: { year: string, month: string }): DashboardStats => {
  const selectedYear = parseInt(period.year);
  const selectedMonth = parseInt(period.month);
  
  // Filter records for selected month
  const selectedMonthRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === selectedYear && recordDate.getMonth() === selectedMonth;
  });
  
  // Filter records for previous month
  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  const prevMonthRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === prevYear && recordDate.getMonth() === prevMonth;
  });
  
  // Count active clients with records
  const clientsWithRecords = new Set();
  records.forEach(record => {
    if (record.renewalStatus === "Renewed") {
      clientsWithRecords.add(record.clientId);
    }
  });
  
  // Calculate monthly revenue, profit, etc.
  const monthlyRevenue = selectedMonthRecords.reduce((sum, record) => sum + record.receivedCost, 0);
  const monthlyProfit = selectedMonthRecords.reduce((sum, record) => sum + record.totalProfit, 0);
  
  let avgProfitPercentage = 0;
  if (monthlyRevenue > 0) {
    avgProfitPercentage = (monthlyProfit / monthlyRevenue) * 100;
  }
  
  // Calculate growth percentage
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

// Get pending payments - updated to check renewalStatus and show vendorCost
const getPendingPayments = (records: Record[]): Record[] => {
  return records.filter(record => 
    record.paymentStatus === "Pending" && record.renewalStatus === "Renewed"
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  prefix = "", 
  suffix = "" 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  prefix?: string; 
  suffix?: string;
}) => (
  <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold mt-2">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </h3>
      </div>
      <div className="p-3 bg-primary/10 rounded-full">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  </Card>
);

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

const Index = () => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [records, setRecords] = useState<Record[]>([]);
  const [pendingPayments, setPendingPayments] = useState<Record[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Function to get client name by ID
  const getClientNameById = (clientId: string): string => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch records from Supabase
        const { data: dbRecords, error: recordsError } = await supabase
          .from('records')
          .select('*');
        
        if (recordsError) {
          console.error("Error fetching records:", recordsError);
          toast({
            title: "Error",
            description: "Failed to load records data",
            variant: "destructive",
          });
          return;
        }
        
        // Fetch clients from Supabase
        const { data: dbClients, error: clientsError } = await supabase
          .from('clients')
          .select('*');
        
        if (clientsError) {
          console.error("Error fetching clients:", clientsError);
          toast({
            title: "Error",
            description: "Failed to load clients data",
            variant: "destructive",
          });
          return;
        }
        
        // Convert DB records to app records
        const appRecords = dbRecords.map(dbRecordToRecord);
        const appClients = dbClients.map(dbClientToClient);
        
        setRecords(appRecords);
        setClients(appClients);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to records changes
    const recordsChannel = supabase
      .channel('records-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'records' }, 
        async (payload) => {
          console.log('Records change received:', payload);
          
          // Refresh all records when any change happens
          const { data: dbRecords, error } = await supabase
            .from('records')
            .select('*');
          
          if (!error && dbRecords) {
            const appRecords = dbRecords.map(dbRecordToRecord);
            setRecords(appRecords);
          }
        }
      )
      .subscribe();
      
    // Subscribe to clients changes
    const clientsChannel = supabase
      .channel('clients-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'clients' }, 
        async (payload) => {
          console.log('Clients change received:', payload);
          
          // Refresh all clients when any change happens
          const { data: dbClients, error } = await supabase
            .from('clients')
            .select('*');
          
          if (!error && dbClients) {
            const appClients = dbClients.map(dbClientToClient);
            setClients(appClients);
          }
        }
      )
      .subscribe();
    
    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(recordsChannel);
      supabase.removeChannel(clientsChannel);
    };
  }, []);

  // Update stats when filters or records change
  useEffect(() => {
    if (records.length > 0) {
      const calculatedStats = calculateDashboardStats(records, { year: filterYear, month: filterMonth });
      setStats(calculatedStats);
      setPendingPayments(getPendingPayments(records));
    }
  }, [records, filterYear, filterMonth]);

  // Total pending amount - updated to show vendorCost instead of receivedCost
  const totalPendingAmount = pendingPayments.reduce((sum, record) => sum + record.vendorCost, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome to your hosting business dashboard</p>
          </div>
          <div className="flex items-center space-x-3">
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
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-20 animate-pulse bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Clients"
              value={stats.activeClients}
              icon={Users}
            />
            <StatCard
              title="Monthly Revenue"
              value={stats.monthlyRevenue}
              icon={IndianRupee}
              prefix="₹"
            />
            <StatCard
              title="Monthly Profit"
              value={stats.monthlyProfit}
              icon={TrendingUp}
              prefix="₹"
            />
            <StatCard
              title="Avg Profit Margin"
              value={stats.avgProfitPercentage}
              icon={Percent}
              suffix="%"
            />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h2 className="text-xl font-semibold">Business Growth</h2>
              {stats.growthPercentage > 0 ? (
                <div className="flex items-center text-green-600">
                  <ArrowUpIcon className="w-4 h-4" />
                  <span className="font-medium">{stats.growthPercentage}%</span>
                </div>
              ) : stats.growthPercentage < 0 ? (
                <div className="flex items-center text-red-600">
                  <ArrowDownIcon className="w-4 h-4" />
                  <span className="font-medium">{Math.abs(stats.growthPercentage)}%</span>
                </div>
              ) : (
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">0%</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground">Compared to {months.find(m => m.value === (parseInt(filterMonth) === 0 ? "11" : (parseInt(filterMonth) - 1).toString()))?.label} {parseInt(filterMonth) === 0 ? parseInt(filterYear) - 1 : filterYear}</p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                Pending Vendor Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPayments.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-lg font-bold">Total: ₹{totalPendingAmount.toLocaleString()}</p>
                  <div className="max-h-[150px] overflow-y-auto">
                    {pendingPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center py-2 border-b">
                        <span>{getClientNameById(payment.clientId)}</span>
                        <span className="font-medium">₹{payment.vendorCost.toLocaleString()}</span>
                      </div>
                    ))}
                    {pendingPayments.length > 5 && (
                      <div className="text-center mt-2 text-sm text-muted-foreground">
                        + {pendingPayments.length - 5} more payments
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No pending payments</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
