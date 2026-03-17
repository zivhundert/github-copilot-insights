
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getLineChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { createDateTooltipFormatter } from '@/utils/chartHelpers';
import { CopilotDataRow } from '@/pages/Index';
import { type AggregationPeriod } from '@/utils/dataAggregation';

interface AverageInteractionsChartProps {
  data: CopilotDataRow[];
  aggregationPeriod: AggregationPeriod;
}

export const AverageInteractionsChart = ({ data, aggregationPeriod }: AverageInteractionsChartProps) => {
  const chartData = useMemo(() => {
    const periodData = new Map<string, { total: number; userDays: number }>();
    
    data.forEach(row => {
      const date = row.day;
      const interactions = row.user_initiated_interaction_count || 0;
      
      if (!periodData.has(date)) {
        periodData.set(date, { total: 0, userDays: 0 });
      }
      
      const period = periodData.get(date)!;
      period.total += interactions;
      period.userDays += 1;
    });

    return Array.from(periodData.entries())
      .map(([date, { total, userDays }]) => [
        new Date(date).getTime(),
        userDays > 0 ? Math.round((total / userDays) * 10) / 10 : 0
      ])
      .sort((a, b) => a[0] - b[0]);
  }, [data]);

  const getPeriodText = () => {
    switch (aggregationPeriod) {
      case 'week': return 'weekly';
      case 'month': return 'monthly';
      default: return 'daily';
    }
  };

  const options: Partial<HighchartsOptions> = {
    ...getLineChartConfig(),
    tooltip: { formatter: createDateTooltipFormatter('Avg Interactions') },
    plotOptions: {
      line: {
        color: CHART_COLORS.gradients.green[0],
        marker: { enabled: true },
      }
    },
    series: [{
      name: 'Avg Interactions',
      type: 'line',
      data: chartData
    }]
  };

  return (
    <ChartContainer
      title={`Interactions per Developer (${getPeriodText()})`}
      helpText={`Average user-initiated interactions per developer per ${getPeriodText().slice(0, -2)} period.`}
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
