
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getColumnChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { createDateTooltipFormatter } from '@/utils/chartHelpers';
import { CopilotDataRow } from '@/pages/Index';
import { type AggregationPeriod } from '@/utils/dataAggregation';

interface FeatureUsageChartProps {
  data: CopilotDataRow[];
  aggregationPeriod: AggregationPeriod;
}

const FEATURE_LABELS: Record<string, string> = {
  'code_completion': 'Code Completion',
  'chat_panel_agent_mode': 'Agent Mode',
  'chat_panel_ask_mode': 'Ask Mode',
  'agent_edit': 'Agent Edit',
  'chat_panel_custom_mode': 'Custom Mode',
  'chat_panel_plan_mode': 'Plan Mode',
  'chat_panel_edit_mode': 'Edit Mode',
  'chat_inline': 'Chat Inline',
};

const FEATURE_COLORS: Record<string, string> = {
  'code_completion': CHART_COLORS.secondary[2],
  'chat_panel_agent_mode': CHART_COLORS.secondary[0],
  'chat_panel_ask_mode': CHART_COLORS.secondary[3],
  'agent_edit': CHART_COLORS.secondary[1],
  'chat_panel_custom_mode': CHART_COLORS.secondary[4],
  'chat_panel_plan_mode': CHART_COLORS.primary[1],
  'chat_panel_edit_mode': CHART_COLORS.primary[2],
  'chat_inline': CHART_COLORS.primary[3],
};

export const FeatureUsageChart = ({ data, aggregationPeriod }: FeatureUsageChartProps) => {
  const chartData = useMemo(() => {
    const periodData = new Map<string, Map<string, number>>();
    const allFeatures = new Set<string>();

    data.forEach(row => {
      const date = row.day;
      if (!periodData.has(date)) {
        periodData.set(date, new Map());
      }
      const dayMap = periodData.get(date)!;

      (row.totals_by_feature || []).forEach(f => {
        const feature = f.feature;
        allFeatures.add(feature);
        const interactions = f.user_initiated_interaction_count || 0;
        dayMap.set(feature, (dayMap.get(feature) || 0) + interactions);
      });
    });

    const dates = Array.from(periodData.keys()).sort();
    const timestamps = dates.map(d => new Date(d).getTime());

    const series = Array.from(allFeatures).map(feature => ({
      name: FEATURE_LABELS[feature] || feature,
      type: 'column' as const,
      data: dates.map((date, i) => [timestamps[i], periodData.get(date)?.get(feature) || 0]),
      color: FEATURE_COLORS[feature] || CHART_COLORS.primary[0],
    }));

    return series;
  }, [data]);

  const getPeriodText = () => {
    switch (aggregationPeriod) {
      case 'week': return 'weekly';
      case 'month': return 'monthly';
      default: return 'daily';
    }
  };

  const options: Partial<HighchartsOptions> = {
    ...getColumnChartConfig(),
    chart: { ...getColumnChartConfig().chart, marginBottom: 140 },
    xAxis: { ...getColumnChartConfig().xAxis, type: 'datetime' },
    yAxis: {
      ...getColumnChartConfig().yAxis,
      title: { text: 'Interactions', style: { color: 'hsl(var(--foreground))' } }
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      y: 10,
      itemStyle: {
        fontSize: '11px',
        fontWeight: 'normal',
        color: 'hsl(var(--foreground))',
        textOverflow: undefined,
      },
      itemDistance: 12,
      margin: 25,
      padding: 10,
      floating: false,
    },
    tooltip: { formatter: createDateTooltipFormatter('Interactions') },
    plotOptions: {
      column: {
        stacking: 'normal',
        borderRadius: 2,
        pointPadding: 0.1,
        groupPadding: 0.15
      }
    },
    series: chartData
  };

  return (
    <ChartContainer
      title={`Feature Usage Breakdown (${getPeriodText()})`}
      helpText="Breakdown of Copilot feature usage over time: Code Completion, Agent Mode, Ask Mode, Agent Edit, Custom Mode."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
