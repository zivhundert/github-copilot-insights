
import { CopilotDataRow } from '@/pages/Index';

interface CalculatedMetrics {
  totalAcceptedLines: string;
  activeUsers: number;
  acceptanceRate: string;
  estimatedHoursSaved: string;
  estimatedMoneySaved: string;
  roi: string;
}

interface MetricsSettings {
  linesPerMinute: number;
  pricePerHour: number;
  copilotPricePerUser: number;
}

export const calculateMetrics = (
  data: CopilotDataRow[],
  baseFilteredData: CopilotDataRow[],
  settings: MetricsSettings
): CalculatedMetrics => {
  const totalAcceptedLines = baseFilteredData.reduce((sum, row) => {
    return sum + (row.loc_added_sum || 0);
  }, 0);

  const activeUsers = new Set(
    baseFilteredData.map(row => row.user_login)
  ).size;

  const filteredAcceptedLines = data.reduce((sum, row) => {
    return sum + (row.loc_added_sum || 0);
  }, 0);

  const filteredSuggestedLines = data.reduce((sum, row) => {
    return sum + (row.loc_suggested_to_add_sum || 0);
  }, 0);

  const acceptanceRate = filteredSuggestedLines > 0 
    ? ((filteredAcceptedLines / filteredSuggestedLines) * 100).toFixed(1)
    : '0';

  const estimatedHoursSaved = Math.round(totalAcceptedLines / (settings.linesPerMinute * 60));
  const estimatedMoneySaved = estimatedHoursSaved * settings.pricePerHour;
  const annualCopilotCost = activeUsers * settings.copilotPricePerUser * 12;

  const roi = annualCopilotCost > 0 
    ? ((estimatedMoneySaved / annualCopilotCost) * 100).toFixed(1)
    : '0';

  return {
    totalAcceptedLines: totalAcceptedLines.toLocaleString(),
    activeUsers,
    acceptanceRate: `${acceptanceRate}%`,
    estimatedHoursSaved: estimatedHoursSaved.toLocaleString(),
    estimatedMoneySaved: `$${estimatedMoneySaved.toLocaleString()}`,
    roi: `${roi}%`,
  };
};
