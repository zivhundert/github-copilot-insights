
import { useMemo } from 'react';
import Highcharts from 'highcharts';
import 'highcharts/modules/treemap';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getTreemapChartConfig, CHART_COLORS } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';

interface ProgrammingLanguageTreemapProps {
  data: CopilotDataRow[];
}

export const ProgrammingLanguageTreemap = ({ data }: ProgrammingLanguageTreemapProps) => {
  const treemapData = useMemo(() => {
    const langCounts = new Map<string, number>();
    data.forEach(row => {
      (row.totals_by_language_feature || []).forEach(lf => {
        const lang = lf.language;
        if (lang && lang !== 'unknown') {
          const lines = (lf.loc_added_sum || 0) + (lf.code_generation_activity_count || 0);
          langCounts.set(lang, (langCounts.get(lang) || 0) + lines);
        }
      });
    });

    const totalCount = Array.from(langCounts.values()).reduce((sum, count) => sum + count, 0);

    return Array.from(langCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([lang, count], index) => ({
        name: lang,
        value: count,
        percentage: totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0',
        color: CHART_COLORS.treemap[index % CHART_COLORS.treemap.length]
      }));
  }, [data]);

  const options: Partial<HighchartsOptions> = {
    ...getTreemapChartConfig(),
    series: [{
      type: 'treemap',
      data: treemapData,
      name: 'Programming Languages'
    }]
  };

  const isEmpty = treemapData.length === 0;

  return (
    <ChartContainer
      title="Programming Language Usage"
      helpText="Visual representation of programming languages used with Copilot. Larger rectangles indicate more usage."
    >
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No programming language data available
        </div>
      ) : (
        <BaseHighchart options={options} />
      )}
    </ChartContainer>
  );
};
