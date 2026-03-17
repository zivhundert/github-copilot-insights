
import { useMemo } from 'react';
import { Options as HighchartsOptions } from 'highcharts';
import { ChartContainer } from '@/components/common/ChartContainer';
import { BaseHighchart } from '@/components/common/BaseHighchart';
import { getBaseChartConfig, getAxisConfig } from '@/config/chartConfigs';
import { CopilotDataRow } from '@/pages/Index';

interface LanguageFeatureMatrixProps {
  data: CopilotDataRow[];
}

export const LanguageFeatureMatrix = ({ data }: LanguageFeatureMatrixProps) => {
  const { seriesData, languages, features } = useMemo(() => {
    const matrix = new Map<string, Map<string, number>>();
    const featureSet = new Set<string>();

    data.forEach(row => {
      (row.totals_by_language_feature || []).forEach(lf => {
        const lang = lf.language || 'Unknown';
        const feat = lf.feature || 'Unknown';
        featureSet.add(feat);
        if (!matrix.has(lang)) matrix.set(lang, new Map());
        const current = matrix.get(lang)!.get(feat) || 0;
        matrix.get(lang)!.set(feat, current + (lf.code_generation_activity_count || 0));
      });
    });

    const languages = Array.from(matrix.keys())
      .sort((a, b) => {
        const totalA = Array.from(matrix.get(a)!.values()).reduce((s, v) => s + v, 0);
        const totalB = Array.from(matrix.get(b)!.values()).reduce((s, v) => s + v, 0);
        return totalB - totalA;
      })
      .slice(0, 15);

    const features = Array.from(featureSet).sort();

    const seriesData: [number, number, number][] = [];
    languages.forEach((lang, y) => {
      features.forEach((feat, x) => {
        const val = matrix.get(lang)?.get(feat) || 0;
        seriesData.push([x, y, val]);
      });
    });

    return { seriesData, languages, features };
  }, [data]);

  const maxVal = Math.max(...seriesData.map(d => d[2]), 1);

  const options: Partial<HighchartsOptions> = {
    ...getBaseChartConfig(),
    chart: {
      ...getBaseChartConfig().chart,
      type: 'heatmap',
      marginBottom: 120,
    },
    xAxis: {
      categories: features.map(f => f.replace(/_/g, ' ')),
      ...getAxisConfig(),
      labels: {
        ...getAxisConfig().labels,
        rotation: -45,
        style: { ...getAxisConfig().labels.style, fontSize: '11px' },
      },
    },
    yAxis: {
      categories: languages,
      ...getAxisConfig(),
      title: { text: null },
      reversed: true,
    },
    colorAxis: {
      min: 0,
      max: maxVal,
      minColor: 'hsl(var(--muted))',
      maxColor: '#3B82F6',
      stops: [
        [0, 'hsl(var(--muted))'],
        [0.5, '#60A5FA'],
        [1, '#1D4ED8'],
      ],
    },
    tooltip: {
      formatter: function (this: any) {
        const point = this.point as any;
        return `<b>${languages[point.y]}</b> × <b>${features[point.x]?.replace(/_/g, ' ')}</b><br/>Activity: <b>${point.value?.toLocaleString()}</b>`;
      },
    },
    legend: {
      align: 'right',
      layout: 'vertical',
      verticalAlign: 'middle',
      symbolHeight: 200,
    },
    series: [
      {
        name: 'Activity',
        type: 'heatmap',
        data: seriesData,
        borderWidth: 1,
        borderColor: 'hsl(var(--border))',
        dataLabels: {
          enabled: true,
          formatter: function (this: any) {
            return this.point.value > 0 ? this.point.value.toLocaleString() : '';
          },
          style: { fontSize: '10px', fontWeight: 'normal', textOutline: 'none' },
        },
      } as any,
    ],
  };

  return (
    <ChartContainer
      title="Language × Feature Matrix"
      helpText="Heatmap showing which Copilot features are used for which programming languages. Darker cells indicate higher code generation activity."
    >
      <BaseHighchart options={options} />
    </ChartContainer>
  );
};
