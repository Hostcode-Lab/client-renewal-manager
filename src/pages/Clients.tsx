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
import { getStoredClients, getStoredPlatforms, saveClientsToStorage } from "@/utils/recordUtils";
import { supabase } from "@/integrations/supabase/client";

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
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [clientsData, platformsData] = await Promise.all([
          getStoredClients(),
          getStoredPlatforms()
        ]);
        setClients(clientsData);
        setPlatforms(platformsData);
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

    loadData();

    const platformsChannel = supabase
      .channel('platform-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'platforms' },
        async () => {
          const updatedPlatforms = await getStoredPlatforms();
          setPlatforms(updatedPlatforms);
        }
      )
      .subscribe();

    const clientsChannel = supabase
      .channel('client-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        async () => {
          const updatedClients = await getStoredClients();
          setClients(updatedClients);
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
    try {
      const clientWithId = { ...newClient, id: Date.now().toString() };
      const updatedClients = [...clients, clientWithId];
      setClients(updatedClients);
      await saveClientsToStorage(updatedClients);
      
      toast({
        title: "Client added",
        description: "The client has been added successfully.",
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Error adding client",
        description: "There was a problem adding the client.",
        variant: "destructive"
      });
    }
  };

  const handleEditClient = async (updatedClient: Client) => {
    try {
      const updatedClients = clients.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      );
      setClients(updatedClients);
      await saveClientsToStorage(updatedClients);
      
      toast({
        title: "Client updated",
        description: "The client has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error updating client",
        description: "There was a problem updating the client.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const updatedClients = clients.filter(client => client.id !== clientId);
      setClients(updatedClients);
      await saveClientsToStorage(updatedClients);
      
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error("Error deleting client:", error);
      toast({
        title: "Error deleting client",
        description: "There was a problem deleting the client.",
        variant: "destructive"
      });
    }
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
          onDelete={() => handleDeleteClient(selectedClient.id)}
          clientName={selectedClient.name}
        />
      )}
    </Layout>
  );
};

export default Clients;
