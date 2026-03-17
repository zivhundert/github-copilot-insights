
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getPieChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';

interface IDEDistributionChartProps {
  data: CopilotDataRow[];
}

export const IDEDistributionChart = ({ data }: IDEDistributionChartProps) => {
  const chartData = useMemo(() => {
    const ideCounts = new Map<string, number>();
    
    data.forEach(row => {
      (row.totals_by_ide || []).forEach(ide => {
        const name = ide.ide || 'Unknown';
        const interactions = ide.user_initiated_interaction_count || 0;
        ideCounts.set(name, (ideCounts.get(name) || 0) + interactions);
      });
    });

    return Array.from(ideCounts.entries())
      .map(([name, y], index) => ({ 
        name, 
        y, 
        color: CHART_COLORS.primary[index % CHART_COLORS.primary.length] 
      }))
      .sort((a, b) => b.y - a.y);
  }, [data]);

  const options: Partial<HighchartsOptions> = {
    ...getPieChartConfig(),
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    series: [{
      name: 'IDE Usage',
      type: 'pie',
      data: chartData
    }]
  };

  return (
    <ChartContainer
      title="IDE Distribution"
      helpText="Distribution of IDEs used with GitHub Copilot across your team (VS Code, IntelliJ, etc.)."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
