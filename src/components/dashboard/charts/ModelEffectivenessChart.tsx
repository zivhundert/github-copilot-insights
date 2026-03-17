
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getBaseChartConfig, getAxisConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';

interface ModelEffectivenessChartProps {
  data: CopilotDataRow[];
}

export const ModelEffectivenessChart = ({ data }: ModelEffectivenessChartProps) => {
  const chartData = useMemo(() => {
    const modelStats = new Map<string, { added: number; suggested: number; interactions: number }>();

    data.forEach(row => {
      (row.totals_by_model_feature || []).forEach(mf => {
        const model = mf.model || 'Unknown';
        if (!modelStats.has(model)) {
          modelStats.set(model, { added: 0, suggested: 0, interactions: 0 });
        }
        const s = modelStats.get(model)!;
        s.added += mf.loc_added_sum || 0;
        s.suggested += mf.loc_suggested_to_add_sum || 0;
        s.interactions += mf.user_initiated_interaction_count || 0;
      });
    });

    return Array.from(modelStats.entries())
      .map(([model, stats]) => ({
        model,
        acceptanceRate: stats.suggested > 0 ? (stats.added / stats.suggested) * 100 : 0,
        interactions: stats.interactions,
      }))
      .sort((a, b) => b.interactions - a.interactions);
  }, [data]);

  const options: Partial<HighchartsOptions> = {
    ...getBaseChartConfig(),
    chart: {
      ...getBaseChartConfig().chart,
      type: 'column',
    },
    xAxis: {
      categories: chartData.map(d => d.model),
      ...getAxisConfig(),
      labels: {
        ...getAxisConfig().labels,
        rotation: -45,
        style: { ...getAxisConfig().labels.style, fontSize: '11px' },
      },
    },
    yAxis: [
      {
        title: { text: 'Acceptance Rate (%)', style: { color: CHART_COLORS.gradients.blue[0] } },
        ...getAxisConfig(),
        max: 100,
      },
      {
        title: { text: 'Total Interactions', style: { color: CHART_COLORS.gradients.orange[0] } },
        ...getAxisConfig(),
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
    },
    plotOptions: {
      column: { borderRadius: 4 },
    },
    series: [
      {
        name: 'Acceptance Rate',
        type: 'column',
        data: chartData.map(d => Math.round(d.acceptanceRate * 10) / 10),
        color: CHART_COLORS.gradients.blue[0],
        yAxis: 0,
        tooltip: { valueSuffix: '%' },
      },
      {
        name: 'Total Interactions',
        type: 'column',
        data: chartData.map(d => d.interactions),
        color: CHART_COLORS.gradients.orange[0],
        yAxis: 1,
      },
    ],
  };

  return (
    <ChartContainer
      title="Model Effectiveness Comparison"
      helpText="Compares acceptance rates and total interactions across AI models. Higher acceptance rates indicate better code quality from the model."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
