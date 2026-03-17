
import { useMemo, useEffect } from 'react';
import Highcharts, { Options as HighchartsOptions } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getBaseChartConfig } from '@/config/chartConfigs';

// Import modules
import 'highcharts/modules/treemap';
import 'highcharts/modules/heatmap';

interface BaseHighchartProps {
  options: Partial<HighchartsOptions>;
  className?: string;
}

export const BaseHighchart = ({ options, className }: BaseHighchartProps) => {
  const mergedOptions = useMemo(() => {
    const baseConfig = getBaseChartConfig();
    return {
      ...baseConfig,
      ...options,
      chart: {
        ...baseConfig.chart,
        ...options.chart
      },
      tooltip: {
        ...baseConfig.tooltip,
        outside: true,
        useHTML: true,
        ...options.tooltip,
        style: {
          ...baseConfig.tooltip?.style,
          ...(options.tooltip?.style || {}),
          zIndex: '9999'
        }
      },
      legend: {
        ...baseConfig.legend,
        ...options.legend
      }
    };
  }, [options]);

  return (
    <div className={className}>
      <HighchartsReact
        highcharts={Highcharts}
        options={mergedOptions}
        containerProps={{ style: { overflow: 'visible' } }}
      />
    </div>
  );
};
