
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LockIcon } from "lucide-react";

const Settings = () => {
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const { toast } = useToast();

  // Get stored credentials or use defaults
  const getStoredCredentials = () => {
    const storedUsername = localStorage.getItem("adminUsername");
    const storedPassword = localStorage.getItem("adminPassword");
    
    return {
      username: storedUsername || "admin",
      password: storedPassword || "password123"
    };
  };

  const handleChangeCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get current credentials
    const credentials = getStoredCredentials();
    
    // Verify current password
    if (currentPassword !== credentials.password) {
      toast({
        title: "Verification failed",
        description: "Current password is incorrect",
        variant: "destructive",
      });
      return;
    }
    
    // Update credentials in localStorage
    localStorage.setItem("adminUsername", newUsername);
    localStorage.setItem("adminPassword", newPassword);
    
    toast({
      title: "Credentials updated",
      description: "Your login credentials have been changed successfully",
    });
    
    // Reset form
    setNewUsername("");
    setNewPassword("");
    setCurrentPassword("");
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
            <CardTitle className="text-xl">Admin Credentials</CardTitle>
            <CardDescription>
              Update your admin username and password. You'll need to use these new credentials the next time you log in.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleChangeCredentials}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-username">New Username</Label>
                <Input
                  id="new-username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  required
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
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                <LockIcon className="mr-2 h-4 w-4" />
                Update Credentials
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
