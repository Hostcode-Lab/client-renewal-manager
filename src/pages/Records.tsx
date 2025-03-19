
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AddRecordDialog from "@/components/AddRecordDialog";
import EditRecordDialog from "@/components/EditRecordDialog";
import AddClientDialog from "@/components/AddClientDialog";
import { Record, Client, Platform } from "@/types";
import RecordsHeader from "@/components/records/RecordsHeader";
import RecordsFilter from "@/components/records/RecordsFilter";
import RecordsTable from "@/components/records/RecordsTable";
import DeleteRecordDialog from "@/components/records/DeleteRecordDialog";
import {
  getStoredClients,
  getStoredPlatforms,
  calculateDashboardStats,
  exportToCSV,
  dbRecordToRecord
} from "@/utils/recordUtils";
import { supabase } from "@/integrations/supabase/client";

const Records = () => {
  const { toast } = useToast();
  const [records, setRecords] = useState<Record[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [isFiltered, setIsFiltered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch records, clients and platforms
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const clientsData = await getStoredClients();
        const platformsData = await getStoredPlatforms();
        
        // Fetch records directly from Supabase
        const { data: recordsData, error } = await supabase
          .from('records')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Convert Supabase records to app records
        const appRecords = recordsData.map(dbRecordToRecord);
        
        setClients(clientsData);
        setPlatforms(platformsData);
        setRecords(appRecords);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error loading data",
          description: "There was a problem loading your data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up real-time subscription for records
    const subscription = supabase
      .channel('record-changes')
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'records'
      }, async (payload) => {
        console.log('Real-time update:', payload);
        
        // Refresh the records when any change happens
        const { data: recordsData, error } = await supabase
          .from('records')
          .select('*')
          .order('date', { ascending: false });
          
        if (error) {
          console.error("Error fetching updated records:", error);
          return;
        }
        
        // Convert and update records state
        const appRecords = recordsData.map(dbRecordToRecord);
        setRecords(appRecords);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [toast]);

  // Update dashboard stats when records or clients change
  useEffect(() => {
    const stats = calculateDashboardStats(records, clients);
    localStorage.setItem('dashboardStats', JSON.stringify(stats));
  }, [records, clients]);

  const handleAddRecord = async (newRecord: Record) => {
    const recordWithId = { ...newRecord, id: crypto.randomUUID() };
    
    // Add to Supabase directly (handled in AddRecordDialog)
    // Realtime subscription will update the UI
    setIsAddDialogOpen(false);
  };

  const handleEditRecord = async (updatedRecord: Record) => {
    // Update handled in EditRecordDialog
    // Realtime subscription will update the UI
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleDeleteRecord = async (record: Record) => {
    // Delete is now handled in DeleteRecordDialog component
    // Just update local state to close dialog
    setRecordToDelete(null);
  };

  const handleAddClient = async (newClient: Client) => {
    // Client add is handled in AddClientDialog
    setIsAddClientDialogOpen(false);
  };

  const handleEditClick = (record: Record) => {
    setSelectedRecord(record);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (record: Record) => {
    setRecordToDelete(record);
  };

  const applyFilters = () => {
    setIsFiltered(true);
  };

  const clearFilters = () => {
    setFilterMonth(new Date().getMonth().toString());
    setFilterYear(new Date().getFullYear().toString());
    setIsFiltered(false);
  };

  const handleExportToCSV = () => {
    const filteredRecords = records.filter(record => {
      if (!isFiltered) return true;
      
      const recordMonth = record.date.getMonth().toString();
      const recordYear = record.date.getFullYear().toString();
      
      return (
        recordMonth === filterMonth && 
        recordYear === filterYear
      );
    });

    exportToCSV(
      filteredRecords, 
      clients, 
      platforms, 
      filterMonth, 
      filterYear, 
      () => {
        toast({
          title: "Export complete",
          description: "Records have been exported to CSV successfully.",
        });
      }
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <RecordsHeader 
          onAddClick={() => setIsAddDialogOpen(true)}
          onAddClientClick={() => setIsAddClientDialogOpen(true)}
          onExportClick={handleExportToCSV}
        />

        <Card className="p-4">
          <RecordsFilter 
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            isFiltered={isFiltered}
            setIsFiltered={setIsFiltered}
            applyFilters={applyFilters}
            clearFilters={clearFilters}
          />

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : (
            <RecordsTable 
              records={records}
              isFiltered={isFiltered}
              filterMonth={filterMonth}
              filterYear={filterYear}
              clients={clients}
              platforms={platforms}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          )}
        </Card>
      </div>

      {isAddDialogOpen && (
        <AddRecordDialog 
          open={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
          onAdd={handleAddRecord}
          clients={clients}
        />
      )}

      {isEditDialogOpen && selectedRecord && (
        <EditRecordDialog 
          open={isEditDialogOpen} 
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRecord(null);
          }} 
          onUpdate={handleEditRecord}
          record={selectedRecord}
          clients={clients}
        />
      )}

      {isAddClientDialogOpen && (
        <AddClientDialog 
          open={isAddClientDialogOpen} 
          onClose={() => setIsAddClientDialogOpen(false)} 
          onAdd={handleAddClient}
          platforms={platforms}
        />
      )}

      <DeleteRecordDialog
        open={!!recordToDelete}
        record={recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onDelete={handleDeleteRecord}
      />
    </Layout>
  );
};

export default Records;
