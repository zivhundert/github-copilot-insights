
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getColumnChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { type AggregationPeriod } from '@/utils/dataAggregation';

interface AgentAdoptionChartProps {
  data: CopilotDataRow[];
  aggregationPeriod: AggregationPeriod;
}

export const AgentAdoptionChart = ({ data, aggregationPeriod }: AgentAdoptionChartProps) => {
  const chartData = useMemo(() => {
    const periodData = new Map<string, { agent: number; chat: number; cli: number; total: number }>();

    data.forEach(row => {
      const date = row.day;
      if (!periodData.has(date)) {
        periodData.set(date, { agent: 0, chat: 0, cli: 0, total: 0 });
      }
      const d = periodData.get(date)!;
      d.total += 1;
      if (row.used_agent) d.agent += 1;
      if (row.used_chat) d.chat += 1;
      if (row.used_cli) d.cli += 1;
    });

    const dates = Array.from(periodData.keys()).sort();
    const timestamps = dates.map(d => new Date(d).getTime());

    return {
      timestamps,
      agent: dates.map(d => {
        const p = periodData.get(d)!;
        return p.total > 0 ? Math.round((p.agent / p.total) * 100) : 0;
      }),
      chat: dates.map(d => {
        const p = periodData.get(d)!;
        return p.total > 0 ? Math.round((p.chat / p.total) * 100) : 0;
      }),
      cli: dates.map(d => {
        const p = periodData.get(d)!;
        return p.total > 0 ? Math.round((p.cli / p.total) * 100) : 0;
      }),
    };
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
    xAxis: { ...getColumnChartConfig().xAxis, type: 'datetime' },
    yAxis: {
      ...getColumnChartConfig().yAxis,
      min: 0, max: 100,
      title: { text: 'Adoption %', style: { color: 'hsl(var(--foreground))' } },
      labels: { formatter: function() { return this.value + '%'; } }
    },
    tooltip: {
      formatter: function() {
        return `Date: ${new Date(this.x as number).toLocaleDateString()}<br/>
                ${this.series.name}: <b>${this.y}%</b> of users`;
      }
    },
    plotOptions: {
      column: { grouping: true, borderRadius: 2, pointPadding: 0.1, groupPadding: 0.15 }
    },
    series: [
      {
        name: 'Agent',
        type: 'column',
        data: chartData.agent.map((v, i) => [chartData.timestamps[i], v]),
        color: CHART_COLORS.secondary[0],
      },
      {
        name: 'Chat',
        type: 'column',
        data: chartData.chat.map((v, i) => [chartData.timestamps[i], v]),
        color: CHART_COLORS.secondary[2],
      },
      {
        name: 'CLI',
        type: 'column',
        data: chartData.cli.map((v, i) => [chartData.timestamps[i], v]),
        color: CHART_COLORS.secondary[4],
      },
    ]
  };

  return (
    <ChartContainer
      title={`Agent/Chat/CLI Adoption (${getPeriodText()})`}
      helpText="Percentage of users using each mode per day. Agent: autonomous multi-step coding tasks. Chat: interactive Q&A in the IDE sidebar. CLI: terminal-based assistance for shell commands."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
