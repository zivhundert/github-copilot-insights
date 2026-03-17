
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
    const periodData = new Map<string, { acceptances: number; generations: number }>();
    
    data.forEach(row => {
      const date = row.day;
      const acceptances = row.code_acceptance_activity_count || 0;
      const generations = row.code_generation_activity_count || 0;
      
      if (!periodData.has(date)) {
        periodData.set(date, { acceptances: 0, generations: 0 });
      }
      
      const period = periodData.get(date)!;
      period.acceptances += acceptances;
      period.generations += generations;
    });

    return Array.from(periodData.entries())
      .map(([date, { acceptances, generations }]) => {
        const timestamp = new Date(date).getTime();
        const rate = generations > 0 ? (acceptances / generations) * 100 : 0;
        return [timestamp, rate];
      })
      .sort((a, b) => a[0] - b[0]);
  }, [data]);

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
        formatter: function() { return this.value + '%'; }
      }
    },
    tooltip: {
      formatter: function() {
        return `Date: ${new Date(this.x as number).toLocaleDateString()}<br/>
                Acceptance Rate: <b>${(this.y as number).toFixed(1)}%</b>`;
      }
    },
    plotOptions: {
      line: {
        lineWidth: 3,
        marker: {
          enabled: true, radius: 4,
          states: { hover: { enabled: true, radius: 6 } }
        }
      }
    },
    series: [{
      name: 'Acceptance Rate',
      type: 'line',
      data: chartData,
      color: '#10b981',
      marker: { fillColor: '#10b981', lineColor: '#059669', lineWidth: 2 }
    }]
  };

  return (
    <ChartContainer
      title={`Acceptance Rate Trend (${getPeriodText()})`}
      helpText="Percentage of Copilot suggestions accepted by developers over time (event-based: Code Acceptances / Code Generations)."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
