
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
    const periodData = new Map<string, { accepted: number; suggested: number }>();
    
    data.forEach(row => {
      const date = row.day;
      // Only use code_completion feature for acceptance rate (suggest→accept flow)
      const codeCompletion = (row.totals_by_feature || []).find(f => f.feature === 'code_completion');
      const accepted = codeCompletion?.loc_added_sum || 0;
      const suggested = codeCompletion?.loc_suggested_to_add_sum || 0;
      
      if (!periodData.has(date)) {
        periodData.set(date, { accepted: 0, suggested: 0 });
      }
      
      const period = periodData.get(date)!;
      period.accepted += accepted;
      period.suggested += suggested;
    });

    return Array.from(periodData.entries())
      .map(([date, { accepted, suggested }]) => {
        const timestamp = new Date(date).getTime();
        const rate = suggested > 0 ? (accepted / suggested) * 100 : 0;
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
      max: 100,
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
      title={`AI Adoption Quality Trend (${getPeriodText()})`}
      helpText="Shows the percentage of suggested lines that were accepted over time."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
