
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
  getStoredRecords,
  saveRecordsToStorage,
  saveClientsToStorage,
  calculateDashboardStats,
  exportToCSV
} from "@/utils/recordUtils";

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const clientsData = await getStoredClients();
        const platformsData = await getStoredPlatforms();
        const recordsData = await getStoredRecords();
        
        setClients(clientsData);
        setPlatforms(platformsData);
        setRecords(recordsData);
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
  }, [toast]);

  useEffect(() => {
    const stats = calculateDashboardStats(records, clients);
    localStorage.setItem('dashboardStats', JSON.stringify(stats));
  }, [records, clients]);

  const handleAddRecord = async (newRecord: Record) => {
    const recordWithId = { ...newRecord, id: crypto.randomUUID() };
    const updatedRecords = [...records, recordWithId];
    setRecords(updatedRecords);
    
    try {
      await saveRecordsToStorage(updatedRecords);
      toast({
        title: "Record added",
        description: "The hosting record has been added successfully.",
      });
    } catch (error) {
      console.error("Error saving record:", error);
      toast({
        title: "Error saving record",
        description: "There was a problem saving your record. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsAddDialogOpen(false);
  };

  const handleEditRecord = async (updatedRecord: Record) => {
    const updatedRecords = records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    setRecords(updatedRecords);
    
    try {
      await saveRecordsToStorage(updatedRecords);
      toast({
        title: "Record updated",
        description: "The hosting record has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating record:", error);
      toast({
        title: "Error updating record",
        description: "There was a problem updating your record. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleDeleteRecord = async (record: Record) => {
    const updatedRecords = records.filter(r => r.id !== record.id);
    setRecords(updatedRecords);
    
    try {
      await saveRecordsToStorage(updatedRecords);
      toast({
        title: "Record deleted",
        description: "The hosting record has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Error deleting record",
        description: "There was a problem deleting your record. Please try again.",
        variant: "destructive",
      });
    }
    
    setRecordToDelete(null);
  };

  const handleAddClient = async (newClient: Client) => {
    const clientWithId = { ...newClient, id: crypto.randomUUID() };
    const updatedClients = [...clients, clientWithId];
    setClients(updatedClients);
    
    try {
      await saveClientsToStorage(updatedClients);
      toast({
        title: "Client added",
        description: "The client has been added successfully.",
      });
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Error adding client",
        description: "There was a problem adding your client. Please try again.",
        variant: "destructive",
      });
    }
    
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
