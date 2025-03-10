
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { ArrowUpIcon, ArrowDownIcon, Users, IndianRupee, TrendingUp, Percent } from "lucide-react";
import { DashboardStats } from "@/types";

// Default stats if none are available
const defaultStats: DashboardStats = {
  activeClients: 0,
  monthlyRevenue: 0,
  monthlyProfit: 0,
  avgProfitPercentage: 0,
  growthPercentage: 0,
};

// Get stats from localStorage
const getStoredStats = (): DashboardStats => {
  const storedStats = localStorage.getItem('dashboardStats');
  if (storedStats) {
    return JSON.parse(storedStats);
  }
  return defaultStats;
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

const Index = () => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);

  useEffect(() => {
    // Load initial stats
    setStats(getStoredStats());

    // Set up event listener for localStorage changes (in case records are updated)
    const handleStorageChange = () => {
      setStats(getStoredStats());
    };

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to your hosting business dashboard</p>
        </div>

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

        <Card className="p-6">
          <div className="flex items-center space-x-2">
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
          <p className="text-muted-foreground mt-1">Compared to last month</p>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
