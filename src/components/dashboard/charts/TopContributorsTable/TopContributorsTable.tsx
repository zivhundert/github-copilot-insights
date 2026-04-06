import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { TopContributorsTableProps, columnLabels } from './types';
import { useContributorData } from './dataProcessing';
import { useSortedContributors } from './sorting';
import { useTableSorting, useDisplaySettings } from './hooks';
import { SortableTableHead } from './components/SortableTableHead';
import { ContributorRow } from './components/ContributorRow';
import { TableHoverProvider } from './components/TableHoverContext';
import { useSettings } from '@/contexts/SettingsContext';
import { UserStatsDialog } from '../UserStatsDialog';

export const TopContributorsTable = ({
  data,
  originalData,
  isFiltered = false,
}: TopContributorsTableProps) => {
  const { showAll, toggleShowAll } = useDisplaySettings();
  const { sortConfig, handleSort } = useTableSorting();
  const { settings } = useSettings();
  const [clickedUser, setClickedUser] = useState<string | null>(null);

  const allContributors = useContributorData(
    data,
    settings.linesPerMinute,
    settings.pricePerHour,
    settings.copilotPricePerUser,
    originalData
  );
  const sortedContributors = useSortedContributors(allContributors, sortConfig);

  if (sortedContributors.length < 1) return null;

  const displayedContributors = showAll
    ? sortedContributors
    : sortedContributors.slice(0, 10);

  return (
    <TableHoverProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold">Adoption Champions</CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Show segment calculation rules"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="max-w-md space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Score formulas</p>
                    <p className="text-muted-foreground">
                      Adoption Score = normalized (Interactions + Code Generations)
                    </p>
                    <p className="text-muted-foreground">
                      Impact Score = normalized AI Code Added
                    </p>
                    <p className="text-muted-foreground">
                      Efficiency = AI Code Added / Interactions
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Segment rules</p>
                    <p className="text-muted-foreground">Champion: Adoption Score ≥ 70 and Impact Score ≥ 70</p>
                    <p className="text-muted-foreground">Producer: Adoption Score ≥ 50 and Impact Score ≥ 40</p>
                    <p className="text-muted-foreground">Explorer: Adoption Score ≥ 20 and below Champion/Producer thresholds</p>
                    <p className="text-muted-foreground">Starter: Adoption Score &lt; 20</p>
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
          <Table className="min-w-[1680px]">
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  column="userLogin"
                  label={columnLabels.userLogin}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="segment"
                  label={columnLabels.segment}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="addedLines"
                  label={columnLabels.addedLines}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="interactions"
                  label={columnLabels.interactions}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="adoptionScore"
                  label={columnLabels.adoptionScore}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="impactScore"
                  label={columnLabels.impactScore}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="efficiency"
                  label={columnLabels.efficiency}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="acceptanceRate"
                  label={columnLabels.acceptanceRate}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="suggestedLines"
                  label={columnLabels.suggestedLines}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="aiAmplification"
                  label={columnLabels.aiAmplification}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="codeGenerations"
                  label={columnLabels.codeGenerations}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="codeAcceptances"
                  label={columnLabels.codeAcceptances}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="linesDeleted"
                  label={columnLabels.linesDeleted}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHead
                  column="userROI"
                  label={columnLabels.userROI}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedContributors.map((contributor) => (
                <ContributorRow
                  key={contributor.userLogin}
                  contributor={contributor}
                  onUserClick={setClickedUser}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <UserStatsDialog
        userName={clickedUser}
        allData={data}
        open={!!clickedUser}
        onOpenChange={(open) => { if (!open) setClickedUser(null); }}
      />
    </TableHoverProvider>
  );
};
