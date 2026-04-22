import { useMemo, useState, useCallback } from 'react';
import Highcharts, { Options as HighchartsOptions, TooltipFormatterContextObject } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getLineChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { type AggregationPeriod } from '@/utils/dataAggregation';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MousePointerClick } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserStatsDialog } from './UserStatsDialog';

interface AverageInteractionsChartProps {
  data: CopilotDataRow[];
  aggregationPeriod: AggregationPeriod;
}

interface PeriodUserStats {
  interactions: number;
  generations: number;
  acceptances: number;
}

export const AverageInteractionsChart = ({ data, aggregationPeriod }: AverageInteractionsChartProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [clickedUser, setClickedUser] = useState<string | null>(null);

  const { chartData, periodUsers } = useMemo(() => {
    const periodData = new Map<string, { total: number; userDays: number }>();
    // date -> user -> stats
    const usersByPeriod = new Map<string, Map<string, PeriodUserStats>>();

    data.forEach(row => {
      const date = row.day;
      const interactions = row.user_initiated_interaction_count || 0;
      const generations = row.code_generation_activity_count || 0;
      const acceptances = row.code_acceptance_activity_count || 0;

      if (!periodData.has(date)) {
        periodData.set(date, { total: 0, userDays: 0 });
      }
      const period = periodData.get(date)!;
      period.total += interactions;
      period.userDays += 1;

      if (!usersByPeriod.has(date)) usersByPeriod.set(date, new Map());
      const users = usersByPeriod.get(date)!;
      const prev = users.get(row.user_login) || { interactions: 0, generations: 0, acceptances: 0 };
      users.set(row.user_login, {
        interactions: prev.interactions + interactions,
        generations: prev.generations + generations,
        acceptances: prev.acceptances + acceptances,
      });
    });

    const points = Array.from(periodData.entries())
      .map(([date, { total, userDays }]) => [
        new Date(date).getTime(),
        userDays > 0 ? Math.round((total / userDays) * 10) / 10 : 0,
      ])
      .sort((a, b) => a[0] - b[0]);

    return { chartData: points, periodUsers: usersByPeriod };
  }, [data]);

  const handlePointClick = useCallback(function (this: Highcharts.Point) {
    const dateStr = Highcharts.dateFormat('%Y-%m-%d', this.x as number);
    setSelectedDate(dateStr);
  }, []);

  const selectedUsers = useMemo(() => {
    if (!selectedDate) return [];
    const users = periodUsers.get(selectedDate);
    if (!users) return [];
    return [...users.entries()]
      .map(([user, stats]) => ({ user, ...stats }))
      .sort((a, b) => b.interactions - a.interactions);
  }, [selectedDate, periodUsers]);

  const getPeriodText = () => {
    switch (aggregationPeriod) {
      case 'week': return 'weekly';
      case 'month': return 'monthly';
      default: return 'daily';
    }
  };

  const options: Partial<HighchartsOptions> = {
    ...getLineChartConfig(),
    tooltip: {
      formatter: function (this: TooltipFormatterContextObject) {
        return `Date: ${Highcharts.dateFormat('%Y-%m-%d', this.x as number)}<br/>
                Avg Interactions: <b>${(this.y as number).toLocaleString()}</b><br/>
                <span style="font-size:10px;color:gray">Click to see users</span>`;
      },
    },
    plotOptions: {
      line: {
        color: CHART_COLORS.gradients.green[0],
        marker: { enabled: true },
        cursor: 'pointer',
        point: {
          events: {
            click: handlePointClick,
          },
        },
      },
    },
    series: [{
      name: 'Avg Interactions',
      type: 'line',
      data: chartData,
    }],
  };

  return (
    <ChartContainer
      title={`Interactions per Developer (${getPeriodText()})`}
      helpText={`Average user-initiated interactions per developer per ${getPeriodText().slice(0, -2)} period. Click a data point to see which users were active.`}
    >
      <BaseHighchart options={options} />

      <Dialog open={!!selectedDate && selectedUsers.length > 0} onOpenChange={(open) => { if (!open) setSelectedDate(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              <span>{selectedDate}</span>
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
