
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { ArrowUpIcon, ArrowDownIcon, Users, DollarSign, TrendingUp, Percent } from "lucide-react";

// Temporary mock data - replace with real data later
const stats = {
  activeClients: 24,
  monthlyRevenue: 4800,
  monthlyProfit: 1200,
  avgProfitPercentage: 25,
  growthPercentage: 12.5,
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
            icon={DollarSign}
            prefix="$"
          />
          <StatCard
            title="Monthly Profit"
            value={stats.monthlyProfit}
            icon={TrendingUp}
            prefix="$"
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
            ) : (
              <div className="flex items-center text-red-600">
                <ArrowDownIcon className="w-4 h-4" />
                <span className="font-medium">{Math.abs(stats.growthPercentage)}%</span>
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
