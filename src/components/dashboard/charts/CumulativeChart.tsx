
import { useMemo } from 'react';
import Highcharts, { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getLineChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { type AggregationPeriod } from '@/utils/dataAggregation';
import { startOfWeek, startOfMonth, format } from 'date-fns';

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

    const periodData = new Map<number, { added: number }>();
    
    baseFilteredData.forEach(row => {
      const date = new Date(row.day);
      const key = groupKey(date);
      const addedLines = row.loc_added_sum || 0;
      
      if (!periodData.has(key)) {
        periodData.set(key, { added: 0 });
      }
      const existing = periodData.get(key)!;
      existing.added += addedLines;
    });

    const sortedData = Array.from(periodData.entries()).sort(([a], [b]) => a - b);

    let cumulativeAdded = 0;
    
    return sortedData.map(([timestamp, { added }]) => {
      cumulativeAdded += added;
      return { date: timestamp, dailyAdded: added, cumulativeAdded };
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
    yAxis: [
      {
        title: { text: 'Code Added per Period', style: { color: CHART_COLORS.gradients.blue[0] } },
        labels: { style: { color: 'hsl(var(--foreground))' } },
        gridLineColor: 'hsl(var(--border))',
      },
      {
        title: { text: 'Cumulative Code Added', style: { color: CHART_COLORS.gradients.orange[0] } },
        labels: { style: { color: 'hsl(var(--foreground))' } },
        opposite: true,
        gridLineWidth: 0,
      }
    ],
    tooltip: {
      shared: true,
      formatter: function () {
        const points = (this as Highcharts.TooltipFormatterContextObject).points as Array<{ series: { name: string }; y: number; x: number }>;
        if (!points || points.length === 0) return false;
        const dateStr = format(new Date(points[0].x), 'MMM dd, yyyy');
        let html = `<b>${dateStr}</b>`;
        points.forEach(p => {
          html += `<br/>${p.series.name}: <b>${p.y.toLocaleString()}</b>`;
        });
        return html;
      }
    },
    plotOptions: {
      column: {
        borderRadius: 3,
      },
      line: {
        marker: { enabled: false, states: { hover: { enabled: true } } }
      }
    },
    series: [
      {
        name: 'Code Added',
        type: 'column',
        yAxis: 0,
        data: chartData.map(d => [d.date, d.dailyAdded]),
        color: CHART_COLORS.gradients.blue[0],
        opacity: 0.7,
      },
      {
        name: 'Cumulative Code Added',
        type: 'line',
        yAxis: 1,
        data: chartData.map(d => [d.date, d.cumulativeAdded]),
        color: CHART_COLORS.gradients.orange[0],
        lineWidth: 2,
      }
    ]
  };

  return (
    <ChartContainer
      title={`AI Code Generation Growth (${getPeriodText()})`}
      helpText="Blue bars show code added per period. Orange line shows cumulative total over time. Added lines include completions, chat, and agent output."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
