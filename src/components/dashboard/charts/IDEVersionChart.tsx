
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getColumnChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';
import { AggregationPeriod, formatPeriodLabel } from '@/utils/dataAggregation';

interface IDEVersionChartProps {
  data: CopilotDataRow[];
  aggregationPeriod: AggregationPeriod;
}

export const IDEVersionChart = ({ data, aggregationPeriod }: IDEVersionChartProps) => {
  const chartData = useMemo(() => {
    const dateVersionMap = new Map<string, Map<string, { count: number; users: string[] }>>();
    const allVersions = new Set<string>();
    
    data.forEach(row => {
      const date = row.day;
      (row.totals_by_ide || []).forEach(ide => {
        const pluginVersion = ide.last_known_plugin_version?.plugin_version;
        if (!pluginVersion) return;
        const label = `${ide.ide} (${pluginVersion})`;
        allVersions.add(label);
        
        if (!dateVersionMap.has(date)) dateVersionMap.set(date, new Map());
        const vMap = dateVersionMap.get(date)!;
        if (!vMap.has(label)) vMap.set(label, { count: 0, users: [] });
        const v = vMap.get(label)!;
        v.count += 1;
        if (!v.users.includes(row.user_login)) v.users.push(row.user_login);
      });
    });
    
    const sortedDates = Array.from(dateVersionMap.keys()).sort();
    const categories = sortedDates.map(date => formatPeriodLabel(date, aggregationPeriod));
    const sortedVersions = Array.from(allVersions).sort();
    
    const series = sortedVersions.map((version, index) => ({
      name: version,
      type: 'column' as const,
      data: sortedDates.map(date => {
        const vMap = dateVersionMap.get(date)!;
        const info = vMap.get(version) || { count: 0, users: [] };
        const total = Array.from(vMap.values()).reduce((s, v) => s + v.count, 0);
        return {
          y: total > 0 ? (info.count / total) * 100 : 0,
          users: info.users,
          count: info.count,
          version
        };
      }),
      color: CHART_COLORS.treemap[index % CHART_COLORS.treemap.length],
      stack: 'versions'
    }));
    
    return { categories, series };
  }, [data, aggregationPeriod]);
  
  const options: Partial<HighchartsOptions> = {
    ...getColumnChartConfig(),
    chart: { ...getColumnChartConfig().chart, marginBottom: 150 },
    xAxis: {
      type: 'category',
      categories: chartData.categories,
      labels: { rotation: -45, style: { fontSize: '11px', color: 'hsl(var(--foreground))' } },
      gridLineColor: 'hsl(var(--border))',
      lineColor: 'hsl(var(--border))',
      tickColor: 'hsl(var(--border))'
    },
    yAxis: {
      ...getColumnChartConfig().yAxis,
      min: 0, max: 100,
      title: { text: 'Percentage (%)' },
      stackLabels: { enabled: false }
    },
    legend: {
      enabled: true, layout: 'horizontal', align: 'center', verticalAlign: 'bottom', y: -20,
      maxHeight: 60, navigation: { enabled: true },
      itemStyle: { fontSize: '11px', color: 'hsl(var(--foreground))' }
    },
    tooltip: {
      backgroundColor: 'hsl(var(--background))',
      borderColor: 'hsl(var(--border))',
      style: { color: 'hsl(var(--foreground))' },
      shared: false, useHTML: true,
      formatter: function() {
        const point = this as Highcharts.TooltipFormatterContextObject & { users?: string[]; version?: string; count?: number };
        const users = point.users || [];
        const version = point.version || this.series.name;
        const percentage = point.y || 0;
        const count = point.count || 0;
        let usersList = '';
        if (users.length > 0) {
          const display = users.slice(0, 10);
          usersList = display.join('<br/>');
          if (users.length > 10) usersList += `<br/><i>... and ${users.length - 10} more</i>`;
        }
        return `<div style="padding: 8px; min-width: 200px;">
          <strong style="color: ${this.series.color};">${version}</strong><br/>
          <span style="font-size: 12px;">${percentage.toFixed(1)}% (${count} user${count !== 1 ? 's' : ''})</span>
          ${usersList ? `<br/><br/><strong>Users:</strong><br/><span style="font-size: 11px;">${usersList}</span>` : ''}
        </div>`;
      }
    },
    plotOptions: {
      column: { stacking: 'percent', dataLabels: { enabled: false }, borderWidth: 0 }
    },
    series: chartData.series
  };
  
  return (
    <ChartContainer
      title="IDE & Plugin Version Distribution"
      helpText="Distribution of IDE and Copilot plugin versions used over time."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
