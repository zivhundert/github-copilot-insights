import { useMemo } from 'react';
import { MetricCard } from '@/components/common/MetricCard';
import { calculateMetrics } from '@/utils/metricsCalculator';
import { CopilotDataRow } from '@/pages/Index';
import { useSettings } from "@/contexts/SettingsContext";

interface DashboardMetricsProps {
  data: CopilotDataRow[];
  originalData: CopilotDataRow[];
  baseFilteredData: CopilotDataRow[];
}

export const DashboardMetrics = ({ data, originalData, baseFilteredData }: DashboardMetricsProps) => {
  const { settings } = useSettings();

  const metrics = useMemo(() => {
    return calculateMetrics(data, baseFilteredData, {
      linesPerMinute: settings.linesPerMinute,
      pricePerHour: settings.pricePerHour,
      copilotPricePerUser: settings.copilotPricePerUser
    });
  }, [data, baseFilteredData, settings]);

  const metricCards = [
    {
      title: 'Total AI Code Added',
      value: metrics.totalAcceptedLines,
      gradient: 'from-blue-500 to-blue-600',
      tooltip: <>
        <strong>What it means:</strong> Lines added to the editor through Copilot-related workflows, including accepted completions, applied code blocks, and agent/edit mode output.
        <br/><br/>
        <strong>Why it matters:</strong> Shows the total volume of AI-assisted code across all Copilot features.
        <br/><br/>
        <em>(Not affected by time period selection)</em>
      </>
    },
    {
      title: 'Acceptance Rate',
      value: metrics.acceptanceRate,
      gradient: 'from-emerald-500 to-emerald-600',
      tooltip: <>
        <strong>What it means:</strong> Percentage of Copilot code suggestions that developers actively accepted (event-based: Code Acceptances / Code Generations).
        <br/><br/>
        <strong>Why it matters:</strong> Measures developer trust and suggestion relevance. Industry benchmarks: 20-40% = typical, 40%+ = excellent.
        <br/><br/>
        <em>If showing "N/A", the data may not include event-level metrics.</em>
      </>
    },
    {
      title: 'AI Code Amplification',
      value: metrics.aiCodeAmplification,
      gradient: 'from-amber-500 to-amber-600',
      tooltip: <>
        <strong>What it means:</strong> Ratio of total code added vs code suggested (Lines Added / Lines Suggested × 100).
        <br/><br/>
        <strong>Important:</strong> This is NOT acceptance rate. Values above 100% indicate agent/edit workflows are adding code beyond ghost-text suggestions.
        <br/><br/>
        <em>This metric can exceed 100% because agent/edit workflows add code without corresponding suggested lines.</em>
      </>
    },
    {
      title: 'Development Time Saved (Hours)',
      value: metrics.estimatedHoursSaved,
      gradient: 'from-teal-500 to-teal-600',
      tooltip: <>
        <strong>What it means:</strong> Total developer hours saved by using AI-powered suggestions, based on your team's coding speed.
        <br/><br/>
        <strong>Tip:</strong> Adjust your team's "Coding Speed" in settings for precise reporting.
        <br/><br/>
        <em>(Not affected by time period selection)</em>
      </>
    },
    {
      title: 'Development Cost Savings',
      value: metrics.estimatedMoneySaved,
      gradient: 'from-green-500 to-green-600',
      tooltip: <>
        <strong>What it means:</strong> Total estimated cost your team avoided by using AI to speed up coding.
        <br/><br/>
        <strong>Industry benchmark:</strong> Median developer hourly rates: $50–$120 USD.
        <br/><br/>
        <em>(Not affected by time period selection)</em>
      </>
    },
    {
      title: 'ROI - Copilot Investment Return',
      value: metrics.roi,
      gradient: 'from-purple-500 to-purple-600',
      tooltip: <>
        <strong>What it means:</strong> Your return on investment from using GitHub Copilot, comparing savings to annual license cost.
        <br/><br/>
        <strong>Action:</strong> Use this to justify AI expenses to leadership.
        <br/><br/>
        <em>Annual cost = {metrics.activeUsers} users × ${settings.copilotPricePerUser}/month × 12 months</em>
      </>
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers.toString(),
      gradient: 'from-indigo-500 to-indigo-600',
      tooltip: <>
        <strong>What it means:</strong> Number of distinct Copilot users on your team in the selected period.
        <br/><br/>
        <strong>Tip:</strong> Spot trends in adoption and help non-active users unlock value.
        <br/><br/>
        <em>(Not affected by time period selection)</em>
      </>
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          gradient={metric.gradient}
          tooltip={metric.tooltip}
        />
      ))}
    </div>
  );
};
