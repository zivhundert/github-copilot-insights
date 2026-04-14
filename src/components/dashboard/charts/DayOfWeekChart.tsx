
import { useMemo, useEffect, useState, useCallback } from 'react';
import Highcharts, { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getColumnChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MousePointerClick } from 'lucide-react';
import { UserStatsDialog } from './UserStatsDialog';

interface DayOfWeekChartProps {
  data: CopilotDataRow[];
}

export const DayOfWeekChart = ({ data }: DayOfWeekChartProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [range, setRange] = useState<'all' | 'last7'>('all');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [clickedUser, setClickedUser] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const last7DaysSet = useMemo(() => {
    const today = new Date();
    const days = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.add(d.toISOString().slice(0, 10));
    }
    return days;
  }, [data]);

  const filteredData = useMemo(() => {
    if (range === 'all') return data;
    return data.filter(r => last7DaysSet.has(r.day));
  }, [data, range, last7DaysSet]);

  const dayToDateLabel = useMemo(() => {
    const map = new Map<string, string>();
    if (range !== 'last7') return map;
    last7DaysSet.forEach(day => {
      const date = new Date(day);
      const dayName = dayNames[date.getDay()];
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      map.set(dayName, `${dd}/${mm}`);
    });
    return map;
  }, [range, last7DaysSet]);

  // Map dayName -> actual date string (yyyy-MM-dd) for last 7 days mode
  const dayNameToDate = useMemo(() => {
    const map = new Map<string, string>();
    if (range !== 'last7') return map;
    last7DaysSet.forEach(day => {
      const date = new Date(day);
      const dayName = dayNames[date.getDay()];
      map.set(dayName, day);
    });
    return map;
  }, [range, last7DaysSet]);

  // User stats per date (for the dialog)
  const dayUsers = useMemo(() => {
    const map = new Map<string, Map<string, { interactions: number; generations: number; acceptances: number }>>();
    filteredData.forEach(row => {
      if (!map.has(row.day)) map.set(row.day, new Map());
      const users = map.get(row.day)!;
      const prev = users.get(row.user_login) || { interactions: 0, generations: 0, acceptances: 0 };
      users.set(row.user_login, {
        interactions: prev.interactions + (row.user_initiated_interaction_count || 0),
        generations: prev.generations + (row.code_generation_activity_count || 0),
        acceptances: prev.acceptances + (row.code_acceptance_activity_count || 0),
      });
    });
    return map;
  }, [filteredData]);

  const handleBarClick = useCallback(function (this: Highcharts.Point) {
    if (range !== 'last7') return;
    const dayName = this.category as string;
    const dateStr = dayNameToDate.get(dayName);
    if (dateStr) setSelectedDay(dateStr);
  }, [range, dayNameToDate]);

  const selectedDayLabel = useMemo(() => {
    if (!selectedDay) return '';
    const date = new Date(selectedDay);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
  }, [selectedDay]);

  const selectedUsers = useMemo(() => {
    if (!selectedDay) return [];
    const users = dayUsers.get(selectedDay);
    if (!users) return [];
    return [...users.entries()]
      .map(([user, stats]) => ({ user, ...stats }))
      .sort((a, b) => b.interactions - a.interactions);
  }, [selectedDay, dayUsers]);

  const chartData = useMemo(() => {
    const dayOfWeekActivity = new Map<string, { interactions: number; linesAdded: number; users: Set<string> }>();
    dayNames.forEach((day) => dayOfWeekActivity.set(day, { interactions: 0, linesAdded: 0, users: new Set<string>() }));

    filteredData.forEach((row) => {
      const date = new Date(row.day);
      const dayName = dayNames[date.getDay()];
      const stats = dayOfWeekActivity.get(dayName)!;
      stats.interactions += row.user_initiated_interaction_count || 0;
      stats.linesAdded += row.loc_added_sum || 0;
      if (row.user_login) {
        stats.users.add(row.user_login);
      }
    });

    return dayNames.map((day) => {
      const stats = dayOfWeekActivity.get(day)!;
      return {
        name: day,
        y: stats.interactions,
        custom: {
          linesAdded: stats.linesAdded,
          uniqueUsers: stats.users.size,
        },
      };
    });
  }, [filteredData]);

  const options: Partial<HighchartsOptions> = {
    ...getColumnChartConfig(),
    chart: { ...getColumnChartConfig().chart, marginBottom: isMobile ? 120 : 100 },
    xAxis: {
      ...getColumnChartConfig().xAxis,
      categories: dayNames,
      labels: {
        rotation: isMobile ? -45 : 0,
        style: { fontSize: isMobile ? '10px' : '12px', color: 'hsl(var(--foreground))' },
        useHTML: true,
        formatter: function() {
          const name = isMobile ? (this.value as string).substring(0, 3) : (this.value as string);
          const dateLabel = dayToDateLabel.get(this.value as string);
          if (dateLabel) {
            return `${name}<br/><span style="font-size:10px;color:hsl(var(--muted-foreground))">${dateLabel}</span>`;
          }
          return name;
        }
      }
    },
    tooltip: {
      formatter: function() {
        const point = this as Highcharts.Point & { custom?: { linesAdded?: number; uniqueUsers?: number }; category?: string };
        let html = `${point.category}<br/>Interactions: <b>${Number(point.y).toLocaleString()}</b><br/>Lines Added: <b>${(point.custom?.linesAdded ?? 0).toLocaleString()}</b><br/>Unique Users: <b>${point.custom?.uniqueUsers ?? 0}</b>`;
        if (range === 'last7') html += '<br/><span style="font-size:10px;color:gray">Click to see users</span>';
        return html;
      }
    },
    plotOptions: {
      column: {
        ...getColumnChartConfig().plotOptions?.column,
        color: CHART_COLORS.gradients.blue[0],
        cursor: range === 'last7' ? 'pointer' : 'default',
        point: { events: { click: handleBarClick } },
      }
    },
    series: [{ name: 'Interactions', type: 'column', data: chartData }]
  };

  return (
    <ChartContainer
      title="Activity by Day of Week"
      helpText="Total interactions grouped by day of the week, with lines added and unique-user counts available in the tooltip."
      headerRight={
        <ToggleGroup type="single" value={range} onValueChange={(v) => v && setRange(v as 'all' | 'last7')} size="sm" className="gap-0 border rounded-md">
          <ToggleGroupItem value="all" className="h-7 px-2.5 text-xs rounded-r-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">All</ToggleGroupItem>
          <ToggleGroupItem value="last7" className="h-7 px-2.5 text-xs rounded-l-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Last 7 Days</ToggleGroupItem>
        </ToggleGroup>
      }
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
