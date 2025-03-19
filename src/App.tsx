import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Clients from "./pages/Clients";
import Records from "./pages/Records";
import Platforms from "./pages/Platforms";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      // Check Supabase session
      const { data } = await supabase.auth.getSession();
      
      // Also check localStorage for backward compatibility
      const localAuth = localStorage.getItem("isAuthenticated") === "true";
      
      setIsAuthenticated(!!data.session || localAuth);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        localStorage.setItem("isAuthenticated", "true");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if this is the first time the app is being loaded
    const isFirstLoad = localStorage.getItem("appInitialized") !== "true";
    
    if (isFirstLoad) {
      // Initialize the app with default data to prevent reset on refresh
      const defaultClients = [
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
      
      const defaultPlatforms = [
        { id: "platform1", name: "Hostcode" },
        { id: "platform2", name: "Serverlize" }
      ];
      
      const defaultRecords = [
        {
          id: "1",
          clientId: "client1",
          date: new Date(2023, 9, 15).toISOString(),
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
          date: new Date(2023, 9, 18).toISOString(),
          renewalStatus: "Canceled",
          vendorInvoiceNumber: "INV-2023-002",
          receivedCost: 10500,
          vendorCost: 7000,
          totalProfit: 3500,
          paymentStatus: "Pending"
        }
      ];
      
      // Only set default data if none exists
      if (!localStorage.getItem('clients')) {
        localStorage.setItem('clients', JSON.stringify(defaultClients));
      }
      
      if (!localStorage.getItem('platforms')) {
        localStorage.setItem('platforms', JSON.stringify(defaultPlatforms));
      }
      
      if (!localStorage.getItem('records')) {
        localStorage.setItem('records', JSON.stringify(defaultRecords));
      }
      
      // Mark app as initialized
      localStorage.setItem("appInitialized", "true");
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
            <Route path="/platforms" element={<ProtectedRoute><Platforms /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
