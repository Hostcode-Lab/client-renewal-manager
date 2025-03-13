
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Record, Client, Platform } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface RecordsTableProps {
  records: Record[];
  isFiltered: boolean;
  filterMonth: string;
  filterYear: string;
  clients: Client[];
  platforms: Platform[];
  onEditClick: (record: Record) => void;
  onDeleteClick: (record: Record) => void;
}

const RecordsTable = ({
  records,
  isFiltered,
  filterMonth,
  filterYear,
  clients,
  platforms,
  onEditClick,
  onDeleteClick,
}: RecordsTableProps) => {
  
  const getClientNameById = (clientId: string): string => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const getClientIpById = (clientId: string): string => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.ipAddress : "N/A";
  };

  const getClientPlatformById = (clientId: string): string => {
    const client = clients.find(client => client.id === clientId);
    if (!client || !client.platform) return "N/A";
    
    const platform = platforms.find(p => p.id === client.platform);
    return platform ? platform.name : "Unknown Platform";
  };

  const filteredRecords = records.filter(record => {
    if (!isFiltered) return true;
    
    const recordMonth = record.date.getMonth().toString();
    const recordYear = record.date.getFullYear().toString();
    
    return (
      recordMonth === filterMonth && 
      recordYear === filterYear
    );
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Renewal Status</TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead className="text-right">Received (₹)</TableHead>
            <TableHead className="text-right">Cost (₹)</TableHead>
            <TableHead className="text-right">Profit (₹)</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.date.toLocaleDateString()}</TableCell>
                <TableCell>{getClientNameById(record.clientId)}</TableCell>
                <TableCell>{getClientIpById(record.clientId)}</TableCell>
                <TableCell>{getClientPlatformById(record.clientId)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    record.renewalStatus === "Renewed" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {record.renewalStatus}
                  </span>
                </TableCell>
                <TableCell>{record.vendorInvoiceNumber}</TableCell>
                <TableCell className="text-right">{record.receivedCost.toFixed(2)}</TableCell>
                <TableCell className="text-right">{record.vendorCost.toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold">
                  {record.totalProfit.toFixed(2)}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    record.paymentStatus === "Paid" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {record.paymentStatus}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => onEditClick(record)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteClick(record)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                {isFiltered 
                  ? `No records found for ${filterMonth} ${filterYear}. Add your first record!`
                  : "No records found. Add your first record!"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default RecordsTable;
