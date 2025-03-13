
import { Button } from "@/components/ui/button";
import { PlusIcon, Download, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

interface RecordsHeaderProps {
  onAddClick: () => void;
  onAddClientClick: () => void;
  onExportClick: () => void;
}

const RecordsHeader = ({
  onAddClick,
  onAddClientClick,
  onExportClick,
}: RecordsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Records</h1>
        <p className="text-muted-foreground mt-2">View and manage your hosting records</p>
      </div>
      <div className="space-x-2 flex items-center">
        <Button variant="outline" size="sm" asChild>
          <Link to="/platforms">
            Manage Platforms
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={onAddClientClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
        <Button variant="outline" size="sm" onClick={onExportClick}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button size="sm" onClick={onAddClick}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>
    </div>
  );
};

export default RecordsHeader;
