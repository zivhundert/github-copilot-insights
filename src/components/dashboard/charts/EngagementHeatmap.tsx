import { useMemo, useState, useCallback } from 'react';
import Highcharts, { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getBaseChartConfig, getAxisConfig } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { format, getDay, startOfWeek, differenceInWeeks, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MousePointerClick } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserStatsDialog } from './UserStatsDialog';

interface EngagementHeatmapProps {
  data: CopilotDataRow[];
}

interface DayUserStats {
  interactions: number;
  generations: number;
  acceptances: number;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const EngagementHeatmap = ({ data }: EngagementHeatmapProps) => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [clickedUser, setClickedUser] = useState<string | null>(null);

  const { seriesData, weekLabels, maxVal, firstWeekStart: heatmapStart, dayUsers } = useMemo(() => {
    const dailyActivity = new Map<string, number>();
    // date string -> user -> stats
    const usersByDay = new Map<string, Map<string, DayUserStats>>();

    data.forEach(row => {
      const day = row.day;
      const interactions = row.user_initiated_interaction_count || 0;
      const generations = row.code_generation_activity_count || 0;
      const acceptances = row.code_acceptance_activity_count || 0;

      dailyActivity.set(day, (dailyActivity.get(day) || 0) + interactions);

      if (!usersByDay.has(day)) usersByDay.set(day, new Map());
      const users = usersByDay.get(day)!;
      const prev = users.get(row.user_login) || { interactions: 0, generations: 0, acceptances: 0 };
      users.set(row.user_login, {
        interactions: prev.interactions + interactions,
        generations: prev.generations + generations,
        acceptances: prev.acceptances + acceptances,
      });
    });

    if (dailyActivity.size === 0) return { seriesData: [], weekLabels: [], maxVal: 0, firstWeekStart: new Date(), dayUsers: usersByDay };

    const dates = Array.from(dailyActivity.keys()).sort();
    const firstDate = parseISO(dates[0]);
    const lastDate = parseISO(dates[dates.length - 1]);
    const firstWeekStart = startOfWeek(firstDate, { weekStartsOn: 0 });

    const totalWeeks = differenceInWeeks(lastDate, firstWeekStart) + 1;

    const seriesData: [number, number, number][] = [];

    dailyActivity.forEach((count, dateStr) => {
      const date = parseISO(dateStr);
      const weekIdx = differenceInWeeks(date, firstWeekStart);
      const dayOfWeek = getDay(date);
      seriesData.push([weekIdx, dayOfWeek, count]);
    });

    const weekLabels: string[] = [];
    for (let i = 0; i < totalWeeks; i++) {
      const weekDate = new Date(firstWeekStart.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      weekLabels.push(format(weekDate, 'MMM dd'));
    }

    const maxVal = Math.max(...Array.from(dailyActivity.values()), 1);

    return { seriesData, weekLabels, maxVal, firstWeekStart, dayUsers: usersByDay };
  }, [data]);

  const handlePointClick = useCallback(function (this: Highcharts.Point) {
    const point = this as any;
    const actualDate = new Date(heatmapStart.getTime() + (point.x * 7 + point.y) * 24 * 60 * 60 * 1000);
    const dateStr = format(actualDate, 'yyyy-MM-dd');
    setSelectedDay(dateStr);
  }, [heatmapStart]);

  const selectedDayLabel = selectedDay ? format(parseISO(selectedDay), 'EEE, MMM dd yyyy') : '';

  const selectedUsers = useMemo(() => {
    if (!selectedDay) return [];
    const users = dayUsers.get(selectedDay);
    if (!users) return [];
    return [...users.entries()]
      .map(([user, stats]) => ({ user, ...stats }))
      .sort((a, b) => b.interactions - a.interactions);
  }, [selectedDay, dayUsers]);

  const options: Partial<HighchartsOptions> = {
    ...getBaseChartConfig(),
    chart: {
      ...getBaseChartConfig().chart,
      type: 'heatmap',
      marginBottom: 140,
    },
    xAxis: {
      categories: weekLabels,
      ...getAxisConfig(),
      labels: {
        ...getAxisConfig().labels,
        rotation: -45,
        step: Math.max(1, Math.floor(weekLabels.length / 12)),
        style: { ...getAxisConfig().labels.style, fontSize: '10px' },
      },
      title: { text: null },
    },
    yAxis: {
      categories: DAY_LABELS,
      ...getAxisConfig(),
      title: { text: null },
      reversed: true,
    },
    colorAxis: {
      min: 0,
      max: maxVal,
      minColor: 'hsl(var(--muted))',
      maxColor: '#16a34a',
      stops: [
        [0, 'hsl(var(--muted))'],
        [0.25, '#bbf7d0'],
        [0.5, '#4ade80'],
        [0.75, '#22c55e'],
        [1, '#15803d'],
      ],
    },
    tooltip: {
      formatter: function (this: any) {
        const point = this.point as any;
        const actualDate = new Date(heatmapStart.getTime() + (point.x * 7 + point.y) * 24 * 60 * 60 * 1000);
        const dateLabel = format(actualDate, 'EEE, MMM dd yyyy');
        return `<b>${dateLabel}</b><br/>Interactions: <b>${point.value?.toLocaleString()}</b><br/><span style="font-size:10px;color:gray">Click to see users</span>`;
      },
    },
    plotOptions: {
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click: handlePointClick,
          },
        },
      },
    },
    legend: {
      align: 'center',
      layout: 'horizontal',
      verticalAlign: 'bottom',
      y: 15,
      margin: 25,
    },
    series: [
      {
        name: 'Interactions',
        type: 'heatmap',
        data: seriesData,
        borderWidth: 2,
        borderColor: 'hsl(var(--background))',
        dataLabels: { enabled: false },
      } as any,
    ],
  };

  return (
    <ChartContainer
      title="Engagement Heatmap"
      helpText="GitHub-style activity calendar showing daily team interaction intensity. Click a cell to see which users were active that day."
    >
      <BaseHighchart options={options} />

      <Dialog open={!!selectedDay && selectedUsers.length > 0} onOpenChange={(open) => { if (!open) setSelectedDay(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              <span>{selectedDayLabel}</span>
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
