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
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-semibold">
                Adoption Champions
              </CardTitle>
              <Popover>
                <PopoverTrigger>
                  <HelpCircle className="h-4 w-4 cursor-pointer text-muted-foreground transition-all hover:scale-110 hover:text-foreground" />
                </PopoverTrigger>
                <PopoverContent className="max-w-md">
                  <div className="space-y-2 text-sm">
                    <p>
                      Segments now prioritize <strong>Copilot adoption</strong> and{' '}
                      <strong>Copilot-related output</strong> so agent-heavy users are ranked
                      fairly alongside classic suggestion-heavy users.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Adoption Score</strong> = normalized (Interactions + Code
                      Generations)
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Impact Score</strong> = normalized AI Code Added
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Efficiency</strong> = AI Code Added / Interactions
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Acceptance Rate</strong> = (Code Acceptances / Code
                      Generations) × 100. It is a secondary quality signal and is marked
                      low-confidence below 20 generations.
                    </p>
                    <p className="text-muted-foreground">
                      <strong>AI Amplification</strong> = (AI Code Added / Suggested Code)
                      × 100. It is not an acceptance metric and can exceed 100% in
                      agent/edit-heavy workflows.
                    </p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>
                        <strong>Segments:</strong>
                      </p>
                      <p>🚀 Champion: Strong adoption and strong impact.</p>
                      <p>✨ Producer: Solid adoption and meaningful output.</p>
                      <p>📈 Explorer: Growing usage and learning momentum.</p>
                      <p>🌱 Starter: Early-stage adoption.</p>
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
          <div className="mb-4 grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-3 text-muted-foreground">
              <strong className="text-foreground">Fair ranking:</strong> Performance
              segments are based primarily on Copilot adoption and Copilot-related
              output. Acceptance Rate stays visible as a quality signal, but
              agent-heavy workflows are not penalized when traditional acceptance is
              lower.
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 text-muted-foreground">
              <strong className="text-foreground">Interpret interactions carefully:</strong>{' '}
              Interactions measure engagement and effort, not value by themselves.
              High interactions can mean strong usage, experimentation, or friction
              depending on resulting output.
            </div>
          </div>

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
