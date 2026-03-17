
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

    const periodData = new Map<number, { agent: Set<string>; chat: Set<string>; cli: Set<string> }>();

    data.forEach((row) => {
      const key = getPeriodKey(row.day);
      if (!periodData.has(key)) {
        periodData.set(key, { agent: new Set(), chat: new Set(), cli: new Set() });
      }

      const period = periodData.get(key)!;
      if (row.used_agent) period.agent.add(row.user_login);
      if (row.used_chat) period.chat.add(row.user_login);
      if (row.used_cli) period.cli.add(row.user_login);
    });

    const timestamps = Array.from(periodData.keys()).sort((a, b) => a - b);

    return {
      timestamps,
      agent: timestamps.map((timestamp) => periodData.get(timestamp)!.agent.size),
      chat: timestamps.map((timestamp) => periodData.get(timestamp)!.chat.size),
      cli: timestamps.map((timestamp) => periodData.get(timestamp)!.cli.size),
    };
  }, [data, aggregationPeriod]);

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
      min: 0,
      title: { text: 'Users', style: { color: 'hsl(var(--foreground))' } },
      allowDecimals: false,
    },
    tooltip: {
      formatter: function() {
        return `Date: ${new Date(this.x as number).toLocaleDateString()}<br/>${this.series.name}: <b>${this.y}</b> users`;
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
      title={`Agent/Chat/CLI Users (${getPeriodText()})`}
      helpText="Distinct users who used each mode in the selected period. Agent: autonomous multi-step coding tasks. Chat: interactive Q&A in the IDE sidebar. CLI: terminal-based assistance for shell commands."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
