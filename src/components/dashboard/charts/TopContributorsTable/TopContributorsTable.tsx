
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { TopContributorsTableProps, columnLabels } from './types';
import { useContributorData } from './dataProcessing';
import { useSortedContributors } from './sorting';
import { useTableSorting, useDisplaySettings } from './hooks';
import { SortableTableHead } from './components/SortableTableHead';
import { ContributorRow } from './components/ContributorRow';
import { TableHoverProvider } from './components/TableHoverContext';
import { useSettings } from "@/contexts/SettingsContext";

export const TopContributorsTable = ({ data, isFiltered = false }: TopContributorsTableProps) => {
  const { showAll, toggleShowAll } = useDisplaySettings();
  const { sortConfig, handleSort } = useTableSorting();
  const { settings } = useSettings();
  
  const allContributors = useContributorData(
    data, 
    settings.linesPerMinute, 
    settings.pricePerHour, 
    settings.copilotPricePerUser
  );
  const sortedContributors = useSortedContributors(allContributors, sortConfig);

  if (sortedContributors.length < 1) return null;

  const displayedContributors = showAll ? sortedContributors : sortedContributors.slice(0, 10);

  return (
    <TableHoverProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold">Adoption Champions</CardTitle>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground hover:scale-110 transition-all cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent>
                  <div className="space-y-2">
                    <p>Users ranked by performance segment and comprehensive activity metrics.</p>
                    <p className="text-sm text-muted-foreground">Acceptance Rate = (Code Acceptances / Code Generations) × 100 (event-based)</p>
                    <p className="text-sm text-muted-foreground">AI Amplification = (Lines Added / Lines Suggested) × 100. Can exceed 100% due to agent/edit workflows.</p>
                    <p className="text-sm text-muted-foreground">User ROI = (Individual Money Saved / Annual Copilot Cost per User) × 100</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Performance Segments:</strong></p>
                      <p>🚀 <span className="font-medium">Champion:</span> Top-tier adopter with outstanding value.</p>
                      <p>✨ <span className="font-medium">Producer:</span> Active and effective.</p>
                      <p>📈 <span className="font-medium">Explorer:</span> Growing skills and impact.</p>
                      <p>🌱 <span className="font-medium">Starter:</span> Just getting started.</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {!isFiltered && (
              <Button variant="outline" size="sm" onClick={toggleShowAll}>
                {showAll ? 'Show Top 10' : 'Show All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead column="userLogin" label={columnLabels.userLogin} sortConfig={sortConfig} onSort={handleSort} />
                <SortableTableHead column="segment" label={columnLabels.segment} sortConfig={sortConfig} onSort={handleSort} />
                <SortableTableHead column="acceptedLines" label={columnLabels.acceptedLines} sortConfig={sortConfig} onSort={handleSort} />
                <SortableTableHead column="suggestedLines" label={columnLabels.suggestedLines} sortConfig={sortConfig} onSort={handleSort} />
                <SortableTableHead column="acceptanceRate" label={columnLabels.acceptanceRate} sortConfig={sortConfig} onSort={handleSort} />
                <SortableTableHead column="aiAmplification" label={columnLabels.aiAmplification} sortConfig={sortConfig} onSort={handleSort} />
                <SortableTableHead column="interactions" label={columnLabels.interactions} sortConfig={sortConfig} onSort={handleSort} />
                <SortableTableHead column="codeGenerations" label={columnLabels.codeGenerations} sortConfig={sortConfig} onSort={handleSort} />
                <SortableTableHead column="codeAcceptances" label={columnLabels.codeAcceptances} sortConfig={sortConfig} onSort={handleSort} />
                <SortableTableHead column="linesDeleted" label={columnLabels.linesDeleted} sortConfig={sortConfig} onSort={handleSort} />
                <SortableTableHead column="userROI" label={columnLabels.userROI} sortConfig={sortConfig} onSort={handleSort} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedContributors.map((contributor) => (
                <ContributorRow key={contributor.userLogin} contributor={contributor} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TableHoverProvider>
  );
};
