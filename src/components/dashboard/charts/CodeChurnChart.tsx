
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getBaseChartConfig, getAxisConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { AggregationPeriod } from '@/utils/dataAggregation';
import { startOfWeek, startOfMonth } from 'date-fns';

interface CodeChurnChartProps {
  data: CopilotDataRow[];
  aggregationPeriod: AggregationPeriod;
}

export const CodeChurnChart = ({ data, aggregationPeriod }: CodeChurnChartProps) => {
  const chartData = useMemo(() => {
    const groupKey = (date: Date) => {
      if (aggregationPeriod === 'week') return startOfWeek(date, { weekStartsOn: 1 }).getTime();
      if (aggregationPeriod === 'month') return startOfMonth(date).getTime();
      return date.getTime();
    };

    const periodData = new Map<number, { added: number; deleted: number }>();

    data.forEach(row => {
      const key = groupKey(new Date(row.day));
      if (!periodData.has(key)) periodData.set(key, { added: 0, deleted: 0 });
      const s = periodData.get(key)!;
      s.added += row.loc_added_sum || 0;
      s.deleted += row.loc_deleted_sum || 0;
    });

    return Array.from(periodData.entries())
      .sort(([a], [b]) => a - b)
      .map(([ts, { added, deleted }]) => ({ ts, added, deleted, net: added - deleted }));
  }, [data, aggregationPeriod]);

  const options: Partial<HighchartsOptions> = {
    ...getBaseChartConfig(),
    chart: {
      ...getBaseChartConfig().chart,
      type: 'area',
    },
    xAxis: {
      type: 'datetime',
      ...getAxisConfig(),
    },
    yAxis: {
      title: { text: 'Lines of Code' },
      ...getAxisConfig(),
    },
    tooltip: {
      shared: true,
      xDateFormat: '%Y-%m-%d',
    },
    plotOptions: {
      area: {
        marker: { enabled: false, states: { hover: { enabled: true } } },
        fillOpacity: 0.2,
      },
      line: {
        marker: { enabled: false, states: { hover: { enabled: true } } },
      },
    },
    series: [
      {
        name: 'AI Lines Added',
        type: 'area',
        data: chartData.map(d => [d.ts, d.added]),
        color: '#16a34a',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, 'rgba(22, 163, 74, 0.3)'], [1, 'rgba(22, 163, 74, 0.02)']],
        },
      },
      {
        name: 'AI Lines Deleted',
        type: 'area',
        data: chartData.map(d => [d.ts, d.deleted]),
        color: '#dc2626',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, 'rgba(220, 38, 38, 0.3)'], [1, 'rgba(220, 38, 38, 0.02)']],
        },
      },
      {
        name: 'Net Churn',
        type: 'line',
        data: chartData.map(d => [d.ts, d.net]),
        color: CHART_COLORS.gradients.purple[0],
        dashStyle: 'Dash',
      },
    ],
  };

  return (
    <ChartContainer
      title="Code Churn (AI Lines Added vs Deleted)"
      helpText="Shows Copilot-related lines added (green) vs deleted (red) over time. The dashed purple line represents net churn (added minus deleted)."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
