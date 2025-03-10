
import { useState, useEffect } from "react";
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
import { Platform } from "@/types";
import AddPlatformDialog from "@/components/AddPlatformDialog";
import EditPlatformDialog from "@/components/EditPlatformDialog";
import DeletePlatformDialog from "@/components/DeletePlatformDialog";

// Sample platforms data
const samplePlatforms: Platform[] = [
  {
    id: "platform1",
    name: "Hostcode"
  },
  {
    id: "platform2",
    name: "Serverlize"
  }
];

// Get platforms from localStorage or use sample data
const getStoredPlatforms = (): Platform[] => {
  const storedPlatforms = localStorage.getItem('platforms');
  if (storedPlatforms) {
    return JSON.parse(storedPlatforms);
  }
  return samplePlatforms;
};

// Save platforms to localStorage
const savePlatformsToStorage = (platforms: Platform[]) => {
  localStorage.setItem('platforms', JSON.stringify(platforms));
};

const Platforms = () => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  // Load platforms from localStorage on component mount
  useEffect(() => {
    setPlatforms(getStoredPlatforms());
  }, []);

  const handleAddPlatform = (newPlatform: Platform) => {
    const updatedPlatforms = [...platforms, { ...newPlatform, id: Date.now().toString() }];
    setPlatforms(updatedPlatforms);
    savePlatformsToStorage(updatedPlatforms);
    toast({
      title: "Platform added",
      description: "The platform has been added successfully.",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditPlatform = (updatedPlatform: Platform) => {
    const updatedPlatforms = platforms.map(platform => 
      platform.id === updatedPlatform.id ? updatedPlatform : platform
    );
    setPlatforms(updatedPlatforms);
    savePlatformsToStorage(updatedPlatforms);
    toast({
      title: "Platform updated",
      description: "The platform has been updated successfully.",
    });
    setIsEditDialogOpen(false);
    setSelectedPlatform(null);
  };

  const handleDeletePlatform = (platformId: string) => {
    const updatedPlatforms = platforms.filter(platform => platform.id !== platformId);
    setPlatforms(updatedPlatforms);
    savePlatformsToStorage(updatedPlatforms);
    toast({
      title: "Platform deleted",
      description: "The platform has been deleted successfully.",
    });
    setIsDeleteDialogOpen(false);
    setSelectedPlatform(null);
  };

  const handleEditClick = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (platform: Platform) => {
    setSelectedPlatform(platform);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platforms</h1>
            <p className="text-muted-foreground mt-2">Manage your hosting platforms</p>
          </div>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Platform
          </Button>
        </div>

        <Card className="p-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platforms.length > 0 ? (
                  platforms.map((platform) => (
                    <TableRow key={platform.id}>
                      <TableCell className="font-medium">{platform.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(platform)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(platform)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-muted-foreground">
                      No platforms found. Add your first platform!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {isAddDialogOpen && (
        <AddPlatformDialog 
          open={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
          onAdd={handleAddPlatform}
        />
      )}

      {isEditDialogOpen && selectedPlatform && (
        <EditPlatformDialog 
          open={isEditDialogOpen} 
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedPlatform(null);
          }} 
          onUpdate={handleEditPlatform}
          platform={selectedPlatform}
        />
      )}

      {isDeleteDialogOpen && selectedPlatform && (
        <DeletePlatformDialog 
          open={isDeleteDialogOpen} 
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedPlatform(null);
          }} 
          onDelete={() => handleDeletePlatform(selectedPlatform.id)}
          platformName={selectedPlatform.name}
        />
      )}
    </Layout>
  );
};

export default Platforms;
