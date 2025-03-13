
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecordsFilterProps {
  filterMonth: string;
  setFilterMonth: (month: string) => void;
  filterYear: string;
  setFilterYear: (year: string) => void;
  isFiltered: boolean;
  setIsFiltered: (isFiltered: boolean) => void;
  applyFilters: () => void;
  clearFilters: () => void;
}

const RecordsFilter = ({
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  isFiltered,
  setIsFiltered,
  applyFilters,
  clearFilters,
}: RecordsFilterProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Hosting Records</h2>
      <div className="flex items-center space-x-2">
        {showFilters ? (
          <>
            <div className="flex items-center space-x-2">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="default" size="sm" onClick={() => {
              applyFilters();
              setShowFilters(false);
            }}>
              Apply
            </Button>
          </>
        ) : (
          <div className="flex space-x-2">
            {isFiltered && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordsFilter;
