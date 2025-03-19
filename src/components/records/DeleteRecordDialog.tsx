
import { Record } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteRecordDialogProps {
  open: boolean;
  record: Record | null;
  onClose: () => void;
  onDelete: (record: Record) => void;
}

const DeleteRecordDialog = ({
  open,
  record,
  onClose,
  onDelete,
}: DeleteRecordDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const handleDelete = async () => {
    if (!record) return;
    
    setIsDeleting(true);
    try {
      // Delete directly from Supabase
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', record.id);
        
      if (error) {
        console.error("Error deleting record:", error);
        toast({
          title: "Error deleting record",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Call the parent callback to update local state
      onDelete(record);
      
      toast({
        title: "Record deleted",
        description: "The hosting record has been deleted successfully.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error deleting record",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the record. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-500 hover:bg-red-600"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRecordDialog;
