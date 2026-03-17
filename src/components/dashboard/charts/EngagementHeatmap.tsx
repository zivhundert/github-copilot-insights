
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getBaseChartConfig, getAxisConfig } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { format, getDay, startOfWeek, differenceInWeeks, parseISO } from 'date-fns';

interface EngagementHeatmapProps {
  data: CopilotDataRow[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const EngagementHeatmap = ({ data }: EngagementHeatmapProps) => {
  const { seriesData, weekLabels, maxVal, firstWeekStart: heatmapStart } = useMemo(() => {
    const dailyActivity = new Map<string, number>();

    data.forEach(row => {
      const day = row.day;
      dailyActivity.set(day, (dailyActivity.get(day) || 0) + (row.user_initiated_interaction_count || 0));
    });

    if (dailyActivity.size === 0) return { seriesData: [], weekLabels: [], maxVal: 0, firstWeekStart: new Date() };

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

    return { seriesData, weekLabels, maxVal, firstWeekStart };
  }, [data]);

  const options: Partial<HighchartsOptions> = {
    ...getBaseChartConfig(),
    chart: {
      ...getBaseChartConfig().chart,
      type: 'heatmap',
      marginBottom: 100,
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
        return `<b>${dateLabel}</b><br/>Interactions: <b>${point.value?.toLocaleString()}</b>`;
      },
    },
    legend: {
      align: 'center',
      layout: 'horizontal',
      verticalAlign: 'bottom',
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
      helpText="GitHub-style activity calendar showing daily team interaction intensity. Darker green cells indicate higher activity days."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
