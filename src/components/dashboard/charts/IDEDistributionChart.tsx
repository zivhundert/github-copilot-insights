import { useMemo, useState, useCallback } from 'react';
import Highcharts, { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getPieChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MousePointerClick } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserStatsDialog } from './UserStatsDialog';

interface IDEDistributionChartProps {
  data: CopilotDataRow[];
}

interface IDEUserStats {
  interactions: number;
  generations: number;
  acceptances: number;
}

export const IDEDistributionChart = ({ data }: IDEDistributionChartProps) => {
  const [selectedIDE, setSelectedIDE] = useState<string | null>(null);
  const [clickedUser, setClickedUser] = useState<string | null>(null);

  const { chartData, ideUsers } = useMemo(() => {
    const ideCounts = new Map<string, number>();
    const usersByIDE = new Map<string, Map<string, IDEUserStats>>();

    data.forEach(row => {
      (row.totals_by_ide || []).forEach(ide => {
        const name = ide.ide || 'Unknown';
        const interactions = ide.user_initiated_interaction_count || 0;
        const generations = ide.code_generation_activity_count || 0;
        const acceptances = ide.code_acceptance_activity_count || 0;

        ideCounts.set(name, (ideCounts.get(name) || 0) + interactions);

        if (!usersByIDE.has(name)) usersByIDE.set(name, new Map());
        const users = usersByIDE.get(name)!;
        const prev = users.get(row.user_login) || { interactions: 0, generations: 0, acceptances: 0 };
        users.set(row.user_login, {
          interactions: prev.interactions + interactions,
          generations: prev.generations + generations,
          acceptances: prev.acceptances + acceptances,
        });
      });
    });

    const points = Array.from(ideCounts.entries())
      .map(([name, y], index) => ({
        name,
        y,
        color: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
      }))
      .sort((a, b) => b.y - a.y);

    return { chartData: points, ideUsers: usersByIDE };
  }, [data]);

  const handlePointClick = useCallback(function (this: Highcharts.Point) {
    setSelectedIDE(this.name);
  }, []);

  const selectedUsers = useMemo(() => {
    if (!selectedIDE) return [];
    const users = ideUsers.get(selectedIDE);
    if (!users) return [];
    return [...users.entries()]
      .map(([user, stats]) => ({ user, ...stats }))
      .sort((a, b) => b.interactions - a.interactions);
  }, [selectedIDE, ideUsers]);

  const options: Partial<HighchartsOptions> = {
    ...getPieChartConfig(),
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br/><span style="font-size:10px;color:gray">Click to see users</span>',
    },
    plotOptions: {
      pie: {
        ...getPieChartConfig().plotOptions?.pie,
        cursor: 'pointer',
        point: {
          events: {
            click: handlePointClick,
          },
        },
      },
    },
    series: [{
      name: 'IDE Usage',
      type: 'pie',
      data: chartData,
    }],
  };

  return (
    <ChartContainer
      title="IDE Distribution"
      helpText="Distribution of IDEs used with GitHub Copilot across your team (VS Code, IntelliJ, etc.). Click a slice to see which users use that IDE."
    >
      <BaseHighchart options={options} />

      <Dialog open={!!selectedIDE && selectedUsers.length > 0} onOpenChange={(open) => { if (!open) setSelectedIDE(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              <span>{selectedIDE}</span>
              <Badge variant="secondary" className="text-xs">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">User</TableHead>
                  <TableHead className="text-xs text-right">Interactions</TableHead>
                  <TableHead className="text-xs text-right">Generations</TableHead>
                  <TableHead className="text-xs text-right">Acceptances</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedUsers.map(({ user, interactions, generations, acceptances }) => (
                  <TableRow key={user} className="cursor-pointer hover:bg-muted/50" onClick={() => setClickedUser(user)}>
                    <TableCell className="text-sm font-medium py-1.5">{user}</TableCell>
                    <TableCell className="text-sm text-right py-1.5">{interactions.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-right py-1.5">{generations.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-right py-1.5">{acceptances.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <UserStatsDialog userName={clickedUser} allData={data} open={!!clickedUser} onOpenChange={(open) => { if (!open) setClickedUser(null); }} />
        </DialogContent>
      </Dialog>
    </ChartContainer>
  );
};
