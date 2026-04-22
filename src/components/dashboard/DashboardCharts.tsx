
import React, { useMemo } from 'react';
import { CumulativeChart } from './charts/CumulativeChart';
import { AcceptanceRateChart } from './charts/AcceptanceRateChart';
import { AverageInteractionsChart } from './charts/AverageInteractionsChart';
import { ModelUsageChart } from './charts/ModelUsageChart';
import { TopContributorsTable } from './charts/TopContributorsTable/TopContributorsTable';
import { FeatureUsageChart } from './charts/FeatureUsageChart';
import { DayOfWeekChart } from './charts/DayOfWeekChart';
import { ProgrammingLanguageTreemap } from './charts/ProgrammingLanguageTreemap';
import { IDEDistributionChart } from './charts/IDEDistributionChart';
import { IDEVersionChart } from './charts/IDEVersionChart';
import { AgentAdoptionChart } from './charts/AgentAdoptionChart';
import { ModelEffectivenessChart } from './charts/ModelEffectivenessChart';
import { LanguageFeatureMatrix } from './charts/LanguageFeatureMatrix';
import { EngagementHeatmap } from './charts/EngagementHeatmap';
import { CodeChurnChart } from './charts/CodeChurnChart';
import { CopilotDataRow } from '@/pages/Index';
import { AggregationPeriod } from '@/utils/dataAggregation';
import { useSettings } from '@/contexts/SettingsContext';

interface DashboardChartsProps {
  data: CopilotDataRow[];
  originalData: CopilotDataRow[];
  baseFilteredData: CopilotDataRow[];
  aggregationPeriod: AggregationPeriod;
  selectedUsers?: string[];
}

interface ChartRowConfig {
  key: string;
  charts: Array<{
    component: React.ReactNode;
    visible: boolean;
    colSpan?: 'full' | 'half';
  }>;
}

export const DashboardCharts = React.memo(({ 
  data, 
  originalData, 
  baseFilteredData, 
  aggregationPeriod, 
  selectedUsers 
}: DashboardChartsProps) => {
  const { settings } = useSettings();
  const { chartVisibility } = settings;
  const isFiltered = selectedUsers && selectedUsers.length > 0;

  const chartRows = useMemo((): ChartRowConfig[] => [
    {
      key: 'main-charts',
      charts: [
        {
          component: <CumulativeChart baseFilteredData={baseFilteredData} aggregationPeriod={aggregationPeriod} />,
          visible: chartVisibility.cumulativeChart,
          colSpan: 'half'
        },
        {
          component: <AcceptanceRateChart data={data} aggregationPeriod={aggregationPeriod} />,
          visible: chartVisibility.acceptanceRateChart,
          colSpan: 'half'
        }
      ]
    },
    {
      key: 'model-and-feature',
      charts: [
        {
          component: <ModelUsageChart data={data} />,
          visible: chartVisibility.modelUsageChart,
          colSpan: 'half'
        },
        {
          component: <FeatureUsageChart data={data} aggregationPeriod={aggregationPeriod} />,
          visible: chartVisibility.featureUsageChart,
          colSpan: 'half'
        }
      ]
    },
    {
      key: 'model-effectiveness-and-churn',
      charts: [
        {
          component: <ModelEffectivenessChart data={data} />,
          visible: chartVisibility.modelEffectivenessChart,
          colSpan: 'half'
        },
        {
          component: <CodeChurnChart data={data} aggregationPeriod={aggregationPeriod} />,
          visible: chartVisibility.codeChurnChart,
          colSpan: 'half'
        }
      ]
    },
    {
      key: 'interactions-and-ide',
      charts: [
        {
          component: <AverageInteractionsChart data={data} aggregationPeriod={aggregationPeriod} />,
          visible: chartVisibility.averageInteractionsChart,
          colSpan: 'half'
        },
        {
          component: <IDEDistributionChart data={data} />,
          visible: chartVisibility.ideDistributionChart,
          colSpan: 'half'
        }
      ]
    },
    {
      key: 'visualization-charts',
      charts: [
        {
          component: <ProgrammingLanguageTreemap data={data} />,
          visible: chartVisibility.programmingLanguageTreemap,
          colSpan: 'half'
        },
        {
          component: <AgentAdoptionChart data={data} aggregationPeriod={aggregationPeriod} />,
          visible: chartVisibility.agentAdoptionChart,
          colSpan: 'half'
        }
      ]
    },
    {
      key: 'language-and-engagement',
      charts: [
        {
          component: <LanguageFeatureMatrix data={data} />,
          visible: chartVisibility.languageFeatureMatrix,
          colSpan: 'half'
        },
        {
          component: <EngagementHeatmap data={data} />,
          visible: chartVisibility.engagementHeatmap,
          colSpan: 'half'
        }
      ]
    },
    {
      key: 'temporal-and-version',
      charts: [
        {
          component: <DayOfWeekChart data={data} originalData={originalData} />,
          visible: chartVisibility.dayOfWeekChart && aggregationPeriod === 'day',
          colSpan: 'half'
        },
        {
          component: <IDEVersionChart data={data} aggregationPeriod={aggregationPeriod} />,
          visible: chartVisibility.ideVersionChart,
          colSpan: 'half'
        }
      ]
    },
    {
      key: 'contributors-table',
      charts: [
        {
          component: <TopContributorsTable data={data} originalData={originalData} isFiltered={isFiltered} />,
          visible: chartVisibility.topContributorsTable,
          colSpan: 'full'
        }
      ]
    }
  ], [data, originalData, baseFilteredData, aggregationPeriod, selectedUsers, isFiltered, chartVisibility]);

  const renderChartRow = (rowConfig: ChartRowConfig) => {
    const visibleCharts = rowConfig.charts.filter(chart => chart.visible);
    if (visibleCharts.length === 0) return null;

    if (visibleCharts.some(chart => chart.colSpan === 'full')) {
      return (
        <div key={rowConfig.key}>
          {visibleCharts.map((chart, index) => (
            <div key={index} className={chart.colSpan === 'full' ? 'mb-6 last:mb-0' : ''}>
              {chart.component}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div key={rowConfig.key} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleCharts.map((chart, index) => (
          <div key={index}>
            {chart.component}
          </div>
        ))}
      </div>
    );
  };

  const renderedRows = chartRows.map(renderChartRow).filter(row => row !== null);

  return (
    <div className="space-y-6">
      {renderedRows}
    </div>
  );
});

DashboardCharts.displayName = 'DashboardCharts';
