
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

    data.forEach((row) => {
      (row.totals_by_model_feature || []).forEach((mf) => {
        const model = mf.model || 'Unknown';
        if (!modelStats.has(model)) {
          modelStats.set(model, { added: 0, suggested: 0, interactions: 0 });
        }
        const stats = modelStats.get(model)!;
        stats.added += mf.loc_added_sum || 0;
        stats.suggested += mf.loc_suggested_to_add_sum || 0;
        stats.interactions += mf.user_initiated_interaction_count || 0;
      });
    });

    return Array.from(modelStats.entries())
      .map(([model, stats]) => ({
        model,
        amplification: stats.suggested > 0 ? (stats.added / stats.suggested) * 100 : null,
        interactions: stats.interactions,
      }))
      .sort((a, b) => b.interactions - a.interactions);
  }, [data]);

  const categoryCount = chartData.length;

  const options: Partial<HighchartsOptions> = {
    ...getBaseChartConfig(),
    chart: {
      ...getBaseChartConfig().chart,
      type: 'column',
      marginBottom: categoryCount > 8 ? 180 : 140,
      scrollablePlotArea: categoryCount > 8 ? { minWidth: Math.max(categoryCount * 96, 960), scrollPositionX: 0 } : undefined,
    },
    legend: {
      align: 'center',
      verticalAlign: 'top',
      y: 0,
      margin: 20,
    },
    xAxis: {
      categories: chartData.map((d) => d.model),
      ...getAxisConfig(),
      labels: {
        ...getAxisConfig().labels,
        autoRotation: [-35, -55, -70],
        reserveSpace: true,
        style: { ...getAxisConfig().labels.style, fontSize: '11px' },
      },
    },
    yAxis: [
      {
        title: { text: 'AI Code Amplification (%)', style: { color: CHART_COLORS.gradients.blue[0] } },
        ...getAxisConfig(),
        min: 0,
      },
      {
        title: { text: 'Total Interactions', style: { color: CHART_COLORS.gradients.orange[0] } },
        ...getAxisConfig(),
        min: 0,
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
    },
    plotOptions: {
      column: {
        borderRadius: 4,
        grouping: true,
        pointPadding: 0.08,
        groupPadding: 0.12,
      },
    },
    series: [
      {
        name: 'AI Code Amplification',
        type: 'column',
        data: chartData.map((d) => d.amplification === null ? null : Math.round(d.amplification * 10) / 10),
        color: CHART_COLORS.gradients.blue[0],
        yAxis: 0,
        tooltip: {
          pointFormatter: function() {
            return `<span style="color:${this.color}">●</span> AI Code Amplification: <b>${this.y === null ? 'Unavailable' : `${Number(this.y).toFixed(1)}%`}</b><br/><span style="opacity:0.8">This metric can exceed 100% because agent/edit workflows add code without corresponding suggested lines.</span><br/>`;
          }
        },
      },
      {
        name: 'Total Interactions',
        type: 'column',
        data: chartData.map((d) => d.interactions),
        color: CHART_COLORS.gradients.orange[0],
        yAxis: 1,
        tooltip: { valueSuffix: '' },
      },
    ],
  };

  return (
    <ChartContainer
      title="Model Effectiveness Comparison"
      helpText="Compares AI Code Amplification (lines added vs lines suggested) and total interactions across AI models. This metric can exceed 100% because agent/edit workflows add code without corresponding suggested lines."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
