
import { useMemo, useEffect, useState } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getColumnChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';

interface DayOfWeekChartProps {
  data: CopilotDataRow[];
}

export const DayOfWeekChart = ({ data }: DayOfWeekChartProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const chartData = useMemo(() => {
    const dayOfWeekActivity = new Map<string, { linesAdded: number; users: Set<string> }>();
    dayNames.forEach((day) => dayOfWeekActivity.set(day, { linesAdded: 0, users: new Set<string>() }));

    data.forEach((row) => {
      const date = new Date(row.day);
      const dayName = dayNames[date.getDay()];
      const stats = dayOfWeekActivity.get(dayName)!;
      stats.linesAdded += row.loc_added_sum || 0;
      if (row.user_login) {
        stats.users.add(row.user_login);
      }
    });

    return dayNames.map((day) => {
      const stats = dayOfWeekActivity.get(day)!;
      return {
        name: day,
        y: stats.linesAdded,
        custom: {
          uniqueUsers: stats.users.size,
        },
      };
    });
  }, [data]);

  const options: Partial<HighchartsOptions> = {
    ...getColumnChartConfig(),
    chart: { ...getColumnChartConfig().chart, marginBottom: isMobile ? 120 : 100 },
    xAxis: {
      ...getColumnChartConfig().xAxis,
      categories: dayNames,
      labels: {
        rotation: isMobile ? -45 : 0,
        style: { fontSize: isMobile ? '10px' : '12px', color: 'hsl(var(--foreground))' },
        formatter: function() { return isMobile ? (this.value as string).substring(0, 3) : (this.value as string); }
      }
    },
    tooltip: {
      formatter: function() {
        const point = this as Highcharts.Point & { custom?: { uniqueUsers?: number }; category?: string };
        return `${point.category}<br/>Added Code: <b>${Number(point.y).toLocaleString()}</b><br/>Unique Users: <b>${point.custom?.uniqueUsers ?? 0}</b>`;
      }
    },
    plotOptions: { column: { ...getColumnChartConfig().plotOptions?.column, color: CHART_COLORS.gradients.blue[0] } },
    series: [{ name: 'Added Code', type: 'column', data: chartData }]
  };

  return (
    <ChartContainer
      title="Activity by Day of Week"
      helpText="Total added code grouped by day of the week, with unique-user counts available in the tooltip."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
