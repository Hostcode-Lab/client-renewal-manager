
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { BarChart2, Users, Database, Server, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      // Logout from Supabase
      await supabase.auth.signOut();
      
      // Clear local auth state
      localStorage.setItem("isAuthenticated", "false");
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Host Manager</h1>
        </div>
        
        <nav className="space-y-2">
          <Link to="/">
            <div className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors ${isActive('/') ? 'bg-gray-800' : ''}`}>
              <BarChart2 className="mr-3 h-5 w-5" />
              <span>Dashboard</span>
            </div>
          </Link>
          
          <Link to="/records">
            <div className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors ${isActive('/records') ? 'bg-gray-800' : ''}`}>
              <Database className="mr-3 h-5 w-5" />
              <span>Records</span>
            </div>
          </Link>
          
          <Link to="/clients">
            <div className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors ${isActive('/clients') ? 'bg-gray-800' : ''}`}>
              <Users className="mr-3 h-5 w-5" />
              <span>Clients</span>
            </div>
          </Link>
          
          <Link to="/platforms">
            <div className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors ${isActive('/platforms') ? 'bg-gray-800' : ''}`}>
              <Server className="mr-3 h-5 w-5" />
              <span>Platforms</span>
            </div>
          </Link>
          
          <Link to="/settings">
            <div className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors ${isActive('/settings') ? 'bg-gray-800' : ''}`}>
              <Settings className="mr-3 h-5 w-5" />
              <span>Settings</span>
            </div>
          </Link>
        </nav>
        
        <div className="mt-auto pt-6">
          <Button variant="ghost" className="w-full justify-start text-white" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 bg-gray-50">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
