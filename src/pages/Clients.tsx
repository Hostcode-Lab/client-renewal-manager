
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusIcon, Edit, Trash2, Server } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Client, Platform } from "@/types";
import AddClientDialog from "@/components/AddClientDialog";
import EditClientDialog from "@/components/EditClientDialog";
import DeleteClientDialog from "@/components/DeleteClientDialog";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { dbClientToClient, dbPlatformToPlatform } from "@/utils/recordUtils";

const Clients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch clients directly from Supabase
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*');
        
        if (clientsError) {
          throw clientsError;
        }
        
        const formattedClients = clientsData.map(dbClientToClient);
        setClients(formattedClients);
        
        // Fetch platforms
        const { data: platformsData, error: platformsError } = await supabase
          .from('platforms')
          .select('*');
        
        if (platformsError) {
          throw platformsError;
        }
        
        const formattedPlatforms = platformsData.map(dbPlatformToPlatform);
        setPlatforms(formattedPlatforms);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error loading data",
          description: "There was a problem loading clients and platforms.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription for platforms
    const platformsChannel = supabase
      .channel('platforms-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platforms' },
        async (payload) => {
          console.log('Platform change received:', payload);
          // Fetch updated platforms
          const { data } = await supabase.from('platforms').select('*');
          if (data) {
            const formattedPlatforms = data.map(dbPlatformToPlatform);
            setPlatforms(formattedPlatforms);
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for clients
    const clientsChannel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        async (payload) => {
          console.log('Client change received:', payload);
          // Fetch updated clients
          const { data } = await supabase.from('clients').select('*');
          if (data) {
            const formattedClients = data.map(dbClientToClient);
            setClients(formattedClients);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(platformsChannel);
      supabase.removeChannel(clientsChannel);
    };
  }, [toast]);

  const getPlatformNameById = (platformId: string): string => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.name : "Unknown Platform";
  };

  const handleAddClient = async (newClient: Client) => {
    // The database operation is already done in the AddClientDialog component
    // Here we just update the local state
    setClients(prev => [...prev, newClient]);
    setIsAddDialogOpen(false);
  };

  const handleEditClient = async (updatedClient: Client) => {
    // The database operation is already done in the EditClientDialog component
    // Here we just update the local state
    setClients(prev => 
      prev.map(client => client.id === updatedClient.id ? updatedClient : client)
    );
    setIsEditDialogOpen(false);
    setSelectedClient(null);
  };

  const handleDeleteClient = async () => {
    // The database operation is already done in the DeleteClientDialog component
    // Here we just update the local state if needed
    if (selectedClient) {
      setClients(prev => prev.filter(client => client.id !== selectedClient.id));
    }
    setIsDeleteDialogOpen(false);
    setSelectedClient(null);
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clients</h1>
            <p className="text-muted-foreground mt-2">Manage your hosting clients</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/platforms">
                <Server className="mr-2 h-4 w-4" />
                Manage Platforms
              </Link>
            </Button>
            <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>

        <Card className="p-4">
          {isLoading ? (
            <div className="text-center py-6">Loading clients...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.length > 0 ? (
                    clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.ipAddress}</TableCell>
                        <TableCell>{getPlatformNameById(client.platform || "")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(client)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(client)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                        No clients found. Add your first client!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {isAddDialogOpen && (
        <AddClientDialog 
          open={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
          onAdd={handleAddClient}
          platforms={platforms}
        />
      )}

      {isEditDialogOpen && selectedClient && (
        <EditClientDialog 
          open={isEditDialogOpen} 
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedClient(null);
          }} 
          onUpdate={handleEditClient}
          client={selectedClient}
          platforms={platforms}
        />
      )}

      {isDeleteDialogOpen && selectedClient && (
        <DeleteClientDialog 
          open={isDeleteDialogOpen} 
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedClient(null);
          }} 
          onDelete={handleDeleteClient}
          clientName={selectedClient.name}
          clientId={selectedClient.id}
        />
      )}
    </Layout>
  );
};

export default Clients;
