
import { CopilotDataRow } from '@/pages/Index';

interface CalculatedMetrics {
  totalAcceptedLines: string;
  activeUsers: number;
  acceptanceRate: string;
  aiCodeAmplification: string;
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

  // Event-based acceptance rate: code_acceptance_activity_count / code_generation_activity_count
  const totalAcceptances = data.reduce((sum, row) => sum + (row.code_acceptance_activity_count || 0), 0);
  const totalGenerations = data.reduce((sum, row) => sum + (row.code_generation_activity_count || 0), 0);

  const acceptanceRate = totalGenerations > 0 
    ? ((totalAcceptances / totalGenerations) * 100).toFixed(1)
    : null;

  // AI Code Amplification: total loc_added_sum / total loc_suggested_to_add_sum (all features)
  const totalLocAdded = data.reduce((sum, row) => sum + (row.loc_added_sum || 0), 0);
  const totalLocSuggested = data.reduce((sum, row) => sum + (row.loc_suggested_to_add_sum || 0), 0);
  const aiCodeAmplification = totalLocSuggested > 0
    ? ((totalLocAdded / totalLocSuggested) * 100).toFixed(1)
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
    acceptanceRate: acceptanceRate !== null ? `${acceptanceRate}%` : 'N/A',
    aiCodeAmplification: `${aiCodeAmplification}%`,
    estimatedHoursSaved: estimatedHoursSaved.toLocaleString(),
    estimatedMoneySaved: `$${estimatedMoneySaved.toLocaleString()}`,
    roi: `${roi}%`,
  };
};
