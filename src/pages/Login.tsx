
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LockIcon } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChangeCredentialsOpen, setIsChangeCredentialsOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get stored credentials or use defaults
  const getStoredCredentials = () => {
    const storedUsername = localStorage.getItem("adminUsername");
    const storedPassword = localStorage.getItem("adminPassword");
    
    return {
      username: storedUsername || "admin",
      password: storedPassword || "password123"
    };
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Get current credentials
    const credentials = getStoredCredentials();

    // Simple authentication check
    setTimeout(() => {
      if (username === credentials.username && password === credentials.password) {
        // Set authenticated status in localStorage
        localStorage.setItem("isAuthenticated", "true");
        toast({
          title: "Login successful",
          description: "Welcome to Host Manager",
        });
        navigate("/");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000); // Simulate network request
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
    
    // Reset form and close dialog
    setNewUsername("");
    setNewPassword("");
    setCurrentPassword("");
    setIsChangeCredentialsOpen(false);
  };

  // Check if user is already logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Host Manager</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            
            <Dialog open={isChangeCredentialsOpen} onOpenChange={setIsChangeCredentialsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" type="button" className="w-full mt-2">
                  <LockIcon className="mr-2 h-4 w-4" />
                  Change Admin Credentials
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Admin Credentials</DialogTitle>
                  <DialogDescription>
                    Update your admin username and password. You'll need to use these new credentials the next time you log in.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleChangeCredentials} className="space-y-4 py-4">
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
                  <DialogFooter>
                    <Button type="submit">Update Credentials</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
