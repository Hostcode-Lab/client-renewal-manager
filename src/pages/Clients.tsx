
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

// Sample clients data
const sampleClients: Client[] = [
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

// Get clients from localStorage or use sample data
const getStoredClients = (): Client[] => {
  const storedClients = localStorage.getItem('clients');
  if (storedClients) {
    return JSON.parse(storedClients);
  }
  return sampleClients;
};

// Get platforms from localStorage or use sample data
const getStoredPlatforms = (): Platform[] => {
  const storedPlatforms = localStorage.getItem('platforms');
  if (storedPlatforms) {
    return JSON.parse(storedPlatforms);
  }
  return [
    { id: "platform1", name: "Hostcode" },
    { id: "platform2", name: "Serverlize" }
  ];
};

// Save clients to localStorage
const saveClientsToStorage = (clients: Client[]) => {
  localStorage.setItem('clients', JSON.stringify(clients));
};

const Clients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Load clients and platforms from localStorage on component mount
  useEffect(() => {
    setClients(getStoredClients());
    setPlatforms(getStoredPlatforms());
  }, []);

  const getPlatformNameById = (platformId: string): string => {
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.name : "Unknown Platform";
  };

  const handleAddClient = (newClient: Client) => {
    const updatedClients = [...clients, { ...newClient, id: Date.now().toString() }];
    setClients(updatedClients);
    saveClientsToStorage(updatedClients);
    toast({
      title: "Client added",
      description: "The client has been added successfully.",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditClient = (updatedClient: Client) => {
    const updatedClients = clients.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    );
    setClients(updatedClients);
    saveClientsToStorage(updatedClients);
    toast({
      title: "Client updated",
      description: "The client has been updated successfully.",
    });
    setIsEditDialogOpen(false);
    setSelectedClient(null);
  };

  const handleDeleteClient = (clientId: string) => {
    const updatedClients = clients.filter(client => client.id !== clientId);
    setClients(updatedClients);
    saveClientsToStorage(updatedClients);
    toast({
      title: "Client deleted",
      description: "The client has been deleted successfully.",
    });
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
