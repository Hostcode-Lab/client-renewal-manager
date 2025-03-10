
import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { PlusIcon, Edit, Trash2 } from "lucide-react";
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
import { Client } from "@/types";
import AddClientDialog from "@/components/AddClientDialog";
import EditClientDialog from "@/components/EditClientDialog";
import DeleteClientDialog from "@/components/DeleteClientDialog";

// Sample clients data
const sampleClients: Client[] = [
  {
    id: "client1",
    name: "Client One",
    ipAddress: "192.168.1.1"
  },
  {
    id: "client2",
    name: "Client Two",
    ipAddress: "192.168.1.2"
  }
];

const Clients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleAddClient = (newClient: Client) => {
    setClients([...clients, { ...newClient, id: Date.now().toString() }]);
    toast({
      title: "Client added",
      description: "The client has been added successfully.",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditClient = (updatedClient: Client) => {
    setClients(clients.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    ));
    toast({
      title: "Client updated",
      description: "The client has been updated successfully.",
    });
    setIsEditDialogOpen(false);
    setSelectedClient(null);
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(client => client.id !== clientId));
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
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        <Card className="p-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length > 0 ? (
                  clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.ipAddress}</TableCell>
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
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
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
