
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LockIcon, UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser(data.user);
        setNewEmail(data.user.email || "");
      }
    };
    
    getUser();
  }, []);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (newPassword) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (error) throw error;
      }
      
      if (newEmail && newEmail !== currentUser?.email) {
        const { error } = await supabase.auth.updateUser({
          email: newEmail
        });
        
        if (error) throw error;
      }
      
      toast({
        title: "Settings updated",
        description: "Your account settings have been updated successfully",
      });
      
      // Update localStorage for backward compatibility
      if (newEmail) localStorage.setItem("adminUsername", newEmail);
      if (newPassword) localStorage.setItem("adminPassword", newPassword);
      
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings</p>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Account Settings</CardTitle>
            <CardDescription>
              Update your email and password. You'll need to use these new credentials the next time you log in.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateSettings}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={!currentUser}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading || !currentUser}>
                <LockIcon className="mr-2 h-4 w-4" />
                {isLoading ? "Updating..." : "Update Settings"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Create an Account</CardTitle>
            <CardDescription>
              Don't have an account yet? Create one to access your data from any device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => {
                window.location.href = "https://hc-renewal.netlify.app/signup";
              }}
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
