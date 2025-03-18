
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { BarChart2, Users, Database, Server, Settings, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerClose, DrawerTrigger } from "@/components/ui/drawer";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Check authentication status when layout mounts
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const localAuth = localStorage.getItem("isAuthenticated") === "true";
        if (!localAuth) {
          navigate("/login");
        }
      }
    };
    
    checkAuth();
  }, [navigate]);
  
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Host Manager</h1>
      </div>
      
      <nav className="space-y-2">
        <Link to="/" onClick={() => isMobile && setSidebarOpen(false)}>
          <div className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors ${isActive('/') ? 'bg-gray-800' : ''}`}>
            <BarChart2 className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </div>
        </Link>
        
        <Link to="/records" onClick={() => isMobile && setSidebarOpen(false)}>
          <div className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors ${isActive('/records') ? 'bg-gray-800' : ''}`}>
            <Database className="mr-3 h-5 w-5" />
            <span>Records</span>
          </div>
        </Link>
        
        <Link to="/clients" onClick={() => isMobile && setSidebarOpen(false)}>
          <div className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors ${isActive('/clients') ? 'bg-gray-800' : ''}`}>
            <Users className="mr-3 h-5 w-5" />
            <span>Clients</span>
          </div>
        </Link>
        
        <Link to="/platforms" onClick={() => isMobile && setSidebarOpen(false)}>
          <div className={`flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors ${isActive('/platforms') ? 'bg-gray-800' : ''}`}>
            <Server className="mr-3 h-5 w-5" />
            <span>Platforms</span>
          </div>
        </Link>
        
        <Link to="/settings" onClick={() => isMobile && setSidebarOpen(false)}>
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
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 bg-gray-900 text-white p-6">
          <SidebarContent />
        </div>
      )}
      
      {/* Mobile Top Bar and Drawer */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white p-3 flex items-center justify-between shadow-md">
          <h1 className="text-lg font-bold">Host Manager</h1>
          <Drawer open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu size={24} />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="bg-gray-900 text-white p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">Menu</h2>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                      <X size={24} />
                    </Button>
                  </DrawerClose>
                </div>
                <SidebarContent />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 bg-gray-50">
        {isMobile && <div className="h-16"></div>} {/* Space for fixed top bar */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
