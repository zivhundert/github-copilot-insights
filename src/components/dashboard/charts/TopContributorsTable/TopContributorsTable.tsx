import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TopContributorsTableProps, columnLabels } from './types';
import { useContributorData } from './dataProcessing';
import { useSortedContributors } from './sorting';
import { useTableSorting, useDisplaySettings } from './hooks';
import { SortableTableHead } from './components/SortableTableHead';
import { ContributorRow } from './components/ContributorRow';
import { TableHoverProvider } from './components/TableHoverContext';
import { useSettings } from '@/contexts/SettingsContext';

export const TopContributorsTable = ({
  data,
  isFiltered = false,
}: TopContributorsTableProps) => {
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

  const displayedContributors = showAll
    ? sortedContributors
    : sortedContributors.slice(0, 10);

  return (
    <TableHoverProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-xl font-semibold">Adoption Champions</CardTitle>
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
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TableHoverProvider>
  );
};
