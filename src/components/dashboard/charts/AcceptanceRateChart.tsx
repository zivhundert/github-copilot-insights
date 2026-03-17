
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getLineChartConfig } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { AggregationPeriod } from '@/utils/dataAggregation';

interface AcceptanceRateChartProps {
  data: CopilotDataRow[];
  aggregationPeriod: AggregationPeriod;
}

export const AcceptanceRateChart = ({ data, aggregationPeriod }: AcceptanceRateChartProps) => {
  const chartData = useMemo(() => {
    const getPeriodKey = (dateString: string) => {
      const date = new Date(dateString);

      if (aggregationPeriod === 'week') {
        const weekStart = new Date(date);
        const day = weekStart.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        weekStart.setDate(weekStart.getDate() + diff);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart.getTime();
      }

      if (aggregationPeriod === 'month') {
        return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      }

      date.setHours(0, 0, 0, 0);
      return date.getTime();
    };

    const periodData = new Map<number, { acceptances: number; generations: number }>();

    data.forEach((row) => {
      const key = getPeriodKey(row.day);
      const acceptances = row.code_acceptance_activity_count || 0;
      const generations = row.code_generation_activity_count || 0;

      if (!periodData.has(key)) {
        periodData.set(key, { acceptances: 0, generations: 0 });
      }

      const period = periodData.get(key)!;
      period.acceptances += acceptances;
      period.generations += generations;
    });

    return Array.from(periodData.entries())
      .map(([timestamp, { acceptances, generations }]) => [timestamp, generations > 0 ? (acceptances / generations) * 100 : null] as [number, number | null])
      .sort((a, b) => a[0] - b[0]);
  }, [data, aggregationPeriod]);

  const isAcceptanceUnavailable = chartData.every(([, value]) => value === null);

  const getPeriodText = () => {
    switch (aggregationPeriod) {
      case 'week': return 'Weekly';
      case 'month': return 'Monthly';
      default: return 'Daily';
    }
  };

  const options: Partial<HighchartsOptions> = {
    ...getLineChartConfig(),
    yAxis: {
      ...getLineChartConfig().yAxis,
      min: 0,
      labels: {
        formatter: function() { return `${this.value}%`; }
      }
    },
    tooltip: {
      formatter: function() {
        const value = this.y as number | null;
        return `Date: ${new Date(this.x as number).toLocaleDateString()}<br/>Acceptance Rate: <b>${value === null ? 'Acceptance Rate unavailable from current data' : `${value.toFixed(1)}%`}</b>`;
      }
    },
    plotOptions: {
      line: {
        lineWidth: 3,
        marker: {
          enabled: true,
          radius: 4,
          states: { hover: { enabled: true, radius: 6 } }
        },
        connectNulls: false
      }
    },
    series: [{
      name: 'Acceptance Rate',
      type: 'line',
      data: chartData,
      color: 'hsl(var(--chart-2))',
      marker: { fillColor: 'hsl(var(--chart-2))', lineColor: 'hsl(var(--chart-2))', lineWidth: 2 }
    }]
  };

  return (
    <ChartContainer
      title={`Acceptance Rate Trend (${getPeriodText()})`}
      helpText={isAcceptanceUnavailable ? 'Acceptance Rate unavailable from current data.' : 'Percentage of Copilot suggestions accepted by developers over time (event-based: Code Acceptances / Code Generations).'}
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
