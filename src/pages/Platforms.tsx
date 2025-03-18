
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AddPlatformDialog from "@/components/AddPlatformDialog";
import EditPlatformDialog from "@/components/EditPlatformDialog";
import DeletePlatformDialog from "@/components/DeletePlatformDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Platform } from "@/types";
import { getStoredPlatforms, savePlatformsToStorage } from "@/utils/recordUtils";
import { supabase } from "@/integrations/supabase/client";

const Platforms = () => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlatforms = async () => {
      setIsLoading(true);
      try {
        const platformsData = await getStoredPlatforms();
        setPlatforms(platformsData);
      } catch (error) {
        console.error("Error fetching platforms:", error);
        toast({
          title: "Error loading platforms",
          description: "There was a problem loading your platforms. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlatforms();
  }, [toast]);

  const handleAddPlatform = async (newPlatform: Platform) => {
    const platformWithId = { ...newPlatform, id: crypto.randomUUID() };
    
    try {
      // Add to Supabase directly
      const { error } = await supabase
        .from('platforms')
        .insert({
          id: platformWithId.id,
          name: platformWithId.name
        });
        
      if (error) throw error;
      
      // Update local state
      const updatedPlatforms = [...platforms, platformWithId];
      setPlatforms(updatedPlatforms);
      
      // Also update localStorage as fallback
      await savePlatformsToStorage(updatedPlatforms);
      
      toast({
        title: "Platform added",
        description: "The platform has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding platform:", error);
      toast({
        title: "Error adding platform",
        description: "There was a problem adding the platform. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsAddDialogOpen(false);
  };

  const handleEditPlatform = async (updatedPlatform: Platform) => {
    try {
      // Update in Supabase directly
      const { error } = await supabase
        .from('platforms')
        .update({ name: updatedPlatform.name })
        .eq('id', updatedPlatform.id);
        
      if (error) throw error;
      
      // Update local state
      const updatedPlatforms = platforms.map(platform => 
        platform.id === updatedPlatform.id ? updatedPlatform : platform
      );
      setPlatforms(updatedPlatforms);
      
      // Also update localStorage as fallback
      await savePlatformsToStorage(updatedPlatforms);
      
      toast({
        title: "Platform updated",
        description: "The platform has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating platform:", error);
      toast({
        title: "Error updating platform",
        description: "There was a problem updating the platform. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsEditDialogOpen(false);
    setSelectedPlatform(null);
  };

  const handleDeletePlatform = async (platform: Platform) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', platform.id);
      
      if (error) throw error;
      
      // Update local state
      const updatedPlatforms = platforms.filter(p => p.id !== platform.id);
      setPlatforms(updatedPlatforms);
      
      // Also update localStorage as fallback
      await savePlatformsToStorage(updatedPlatforms);
      
      toast({
        title: "Platform deleted",
        description: "The platform has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting platform:", error);
      toast({
        title: "Error deleting platform",
        description: "There was a problem deleting the platform. Please try again.",
        variant: "destructive",
      });
    }
    
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
          <h1 className="text-2xl font-bold">Platforms</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Platform
          </Button>
        </div>

        <Card className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : platforms.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No platforms added yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                Add your first platform
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <Card key={platform.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{platform.name}</h3>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(platform)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(platform)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
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
          onDelete={handleDeletePlatform}
          platform={selectedPlatform}
        />
      )}
    </Layout>
  );
};

export default Platforms;
