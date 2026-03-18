import { useMemo, useState, useCallback, useRef } from 'react';
import Highcharts, { Options as HighchartsOptions } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChartContainer } from '@/components/common/ChartContainer';
import { getPieChartConfig, getBaseChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserStatsDialog } from './UserStatsDialog';

interface ModelUsageChartProps {
  data: CopilotDataRow[];
}

interface ModelUserStats {
  interactions: number;
  generations: number;
  acceptances: number;
}

/** Renders an SVG donut arc for the given percentage and color */
const SliceDonut = ({ percentage, color }: { percentage: number; color: string }) => {
  const size = 56;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        className="rotate-90 origin-center fill-foreground"
        style={{ fontSize: '11px', fontWeight: 700 }}
      >
        {percentage.toFixed(0)}%
      </text>
    </svg>
  );
};

export const ModelUsageChart = ({ data }: ModelUsageChartProps) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [clickedUser, setClickedUser] = useState<string | null>(null);
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const { chartData, modelUsers, totalInteractions } = useMemo(() => {
    const modelCounts = new Map<string, number>();
    const usersByModel = new Map<string, Map<string, ModelUserStats>>();

    data.forEach(row => {
      (row.totals_by_model_feature || []).forEach(mf => {
        const model = mf.model || 'Unknown';
        const interactions = mf.user_initiated_interaction_count || 0;
        const generations = mf.code_generation_activity_count || 0;
        const acceptances = mf.code_acceptance_activity_count || 0;

        modelCounts.set(model, (modelCounts.get(model) || 0) + interactions);

        if (!usersByModel.has(model)) usersByModel.set(model, new Map());
        const users = usersByModel.get(model)!;
        const prev = users.get(row.user_login) || { interactions: 0, generations: 0, acceptances: 0 };
        users.set(row.user_login, {
          interactions: prev.interactions + interactions,
          generations: prev.generations + generations,
          acceptances: prev.acceptances + acceptances,
        });
      });
    });

    const total = Array.from(modelCounts.values()).reduce((s, v) => s + v, 0);

    const points = Array.from(modelCounts.entries())
      .map(([name, y], index) => ({
        name,
        y,
        color: CHART_COLORS.primary[index % CHART_COLORS.primary.length],
      }))
      .sort((a, b) => b.y - a.y);

    return { chartData: points, modelUsers: usersByModel, totalInteractions: total };
  }, [data]);

  /** Explode (slice out) the point matching `modelName`, un-slice all others */
  const slicePoint = useCallback((modelName: string | null) => {
    const chart = chartRef.current?.chart;
    if (!chart?.series?.[0]) return;
    chart.series[0].points.forEach((pt: any) => {
      const shouldSlice = pt.name === modelName;
      if (pt.sliced !== shouldSlice) pt.slice(shouldSlice, true, { duration: 400 });
    });
  }, []);

  const handlePointClick = useCallback(function (this: Highcharts.Point) {
    const name = this.name;
    setSelectedModel(name);
    // small timeout so state updates first, then animate
    setTimeout(() => slicePoint(name), 50);
  }, [slicePoint]);

  const handleDialogClose = useCallback((open: boolean) => {
    if (!open) {
      slicePoint(null);
      setSelectedModel(null);
    }
  }, [slicePoint]);

  const selectedUsers = useMemo(() => {
    if (!selectedModel) return [];
    const users = modelUsers.get(selectedModel);
    if (!users) return [];
    return [...users.entries()]
      .map(([user, stats]) => ({ user, ...stats }))
      .sort((a, b) => b.interactions - a.interactions);
  }, [selectedModel, modelUsers]);

  const selectedSlice = selectedModel
    ? chartData.find(p => p.name === selectedModel)
    : null;
  const selectedPct = selectedSlice && totalInteractions > 0
    ? (selectedSlice.y / totalInteractions) * 100
    : 0;

  const baseConfig = getBaseChartConfig();
  const pieConfig = getPieChartConfig();

  const options: Partial<HighchartsOptions> = {
    ...pieConfig,
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br/><span style="font-size:10px;color:gray">Click to see users</span>',
    },
    plotOptions: {
      pie: {
        ...pieConfig.plotOptions?.pie,
        cursor: 'pointer',
        slicedOffset: 30,
        point: {
          events: {
            click: handlePointClick,
          },
        },
      },
    },
    series: [{
      name: 'Model Usage',
      type: 'pie',
      data: chartData,
    }],
  };

  const mergedOptions = useMemo(() => ({
    ...baseConfig,
    ...options,
    chart: { ...baseConfig.chart, ...options.chart },
    tooltip: {
      ...baseConfig.tooltip,
      outside: true,
      useHTML: true,
      ...options.tooltip,
      style: { ...baseConfig.tooltip?.style, ...(options.tooltip?.style || {}), zIndex: '9999' },
    },
    legend: { ...baseConfig.legend, ...options.legend },
  }), [options]);

  return (
    <ChartContainer
      title="AI Model Usage"
      helpText="Distribution of AI models used across your team based on interaction counts. Click a model to see which users are using it."
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={mergedOptions}
        ref={chartRef}
        containerProps={{ style: { overflow: 'visible' } }}
      />

      <Dialog open={!!selectedModel && selectedUsers.length > 0} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-3">
                {selectedSlice && (
                  <SliceDonut percentage={selectedPct} color={selectedSlice.color} />
                )}
                <div className="flex flex-col gap-1">
                  <span className="text-base">{selectedModel}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {selectedSlice?.y.toLocaleString()} interactions
                    </Badge>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </div>
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
