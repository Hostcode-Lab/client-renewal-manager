
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

  useEffect(() => {
    setClients(getStoredClients());
    setPlatforms(getStoredPlatforms());
    setRecords(getStoredRecords());
  }, []);

  useEffect(() => {
    const stats = calculateDashboardStats(records, clients);
    localStorage.setItem('dashboardStats', JSON.stringify(stats));
  }, [records, clients]);

  const handleAddRecord = (newRecord: Record) => {
    const updatedRecords = [...records, { ...newRecord, id: Date.now().toString() }];
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    toast({
      title: "Record added",
      description: "The hosting record has been added successfully.",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditRecord = (updatedRecord: Record) => {
    const updatedRecords = records.map(record => 
      record.id === updatedRecord.id ? updatedRecord : record
    );
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    toast({
      title: "Record updated",
      description: "The hosting record has been updated successfully.",
    });
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleDeleteRecord = (record: Record) => {
    const updatedRecords = records.filter(r => r.id !== record.id);
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);
    toast({
      title: "Record deleted",
      description: "The hosting record has been deleted successfully.",
    });
    setRecordToDelete(null);
  };

  const handleAddClient = (newClient: Client) => {
    const updatedClients = [...clients, { ...newClient, id: Date.now().toString() }];
    setClients(updatedClients);
    saveClientsToStorage(updatedClients);
    toast({
      title: "Client added",
      description: "The client has been added successfully.",
    });
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
