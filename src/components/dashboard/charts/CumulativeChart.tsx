
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getLineChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { createDateTooltipFormatter } from '@/utils/chartHelpers';
import { CopilotDataRow } from '@/pages/Index';
import { type AggregationPeriod } from '@/utils/dataAggregation';
import { startOfWeek, startOfMonth } from 'date-fns';

interface CumulativeChartProps {
  baseFilteredData: CopilotDataRow[];
  aggregationPeriod: AggregationPeriod;
}

export const CumulativeChart = ({ baseFilteredData, aggregationPeriod }: CumulativeChartProps) => {
  const chartData = useMemo(() => {
    const groupKey = (date: Date) => {
      if (aggregationPeriod === 'week') {
        return startOfWeek(date, { weekStartsOn: 1 }).getTime();
      } else if (aggregationPeriod === 'month') {
        return startOfMonth(date).getTime();
      } else {
        return date.getTime();
      }
    };

    const periodData = new Map<number, { accepted: number; suggested: number }>();
    
    baseFilteredData.forEach(row => {
      const date = new Date(row.day);
      const key = groupKey(date);
      const acceptedLines = row.loc_added_sum || 0;
      const suggestedLines = row.loc_suggested_to_add_sum || 0;
      
      if (!periodData.has(key)) {
        periodData.set(key, { accepted: 0, suggested: 0 });
      }
      const existing = periodData.get(key)!;
      existing.accepted += acceptedLines;
      existing.suggested += suggestedLines;
    });

    const sortedData = Array.from(periodData.entries()).sort(([a], [b]) => a - b);

    let cumulativeAccepted = 0;
    let cumulativeSuggested = 0;
    
    return sortedData.map(([timestamp, { accepted, suggested }]) => {
      cumulativeAccepted += accepted;
      cumulativeSuggested += suggested;
      return { date: timestamp, cumulativeAccepted, cumulativeSuggested };
    });
  }, [baseFilteredData, aggregationPeriod]);

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
      formatter: createDateTooltipFormatter('Cumulative Value', (value) => value.toLocaleString())
    },
    plotOptions: {
      line: {
        marker: { enabled: false, states: { hover: { enabled: true } } }
      }
    },
    series: [
      {
        name: 'Cumulative Lines Added',
        type: 'line',
        data: chartData.map(d => [d.date, d.cumulativeAccepted]),
        color: CHART_COLORS.gradients.blue[0]
      },
      {
        name: 'Cumulative Lines Suggested',
        type: 'line',
        data: chartData.map(d => [d.date, d.cumulativeSuggested]),
        color: CHART_COLORS.gradients.orange[0],
        dashStyle: 'Dash'
      }
    ]
  };

  return (
    <ChartContainer
      title={`AI Code Generation Growth (${getPeriodText()})`}
      helpText={`Running total of lines added and suggested over time. Solid line: Cumulative lines added. Dashed line: Cumulative lines suggested.`}
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
