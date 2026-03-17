import { CopilotDataRow } from '@/pages/Index';

export type PerformanceSegment =
  | 'Champion'
  | 'Producer'
  | 'Explorer'
  | 'Starter';

export type UsageMode = 'Agent-heavy' | 'Hybrid' | 'Chat-heavy';

export type AcceptanceConfidence = 'reliable' | 'low';

export type AchievementBadge =
  | 'High Acceptance'
  | 'High Output'
  | 'Agent Power User'
  | 'Efficient'
  | 'Experimenting';

export interface ContributorWithSegment {
  userLogin: string;
  addedLines: number;
  suggestedLines: number;
  acceptanceRate: number;
  aiAmplification: number;
  interactions: number;
  codeGenerations: number;
  codeAcceptances: number;
  linesDeleted: number;
  userROI: number;
  segment: PerformanceSegment;
  usageMode: UsageMode | null;
  adoptionScore: number;
  impactScore: number;
  effectivenessScore: number;
  efficiency: number | null;
  efficiencyScore: number;
  acceptanceConfidence: AcceptanceConfidence;
  badges: AchievementBadge[];
  agentUsageDays: number;
  chatUsageDays: number;
  cliUsageDays: number;
}

export type SortableColumn =
  | 'userLogin'
  | 'segment'
  | 'addedLines'
  | 'suggestedLines'
  | 'interactions'
  | 'adoptionScore'
  | 'impactScore'
  | 'efficiency'
  | 'acceptanceRate'
  | 'aiAmplification'
  | 'codeGenerations'
  | 'codeAcceptances'
  | 'linesDeleted'
  | 'userROI';

export interface TopContributorsTableProps {
  data: CopilotDataRow[];
  isFiltered?: boolean;
}

export const columnLabels: Record<SortableColumn, string> = {
  userLogin: 'User',
  segment: 'Performance',
  addedLines: 'AI Code Added',
  suggestedLines: 'Suggested Code',
  interactions: 'Interactions',
  adoptionScore: 'Adoption Score',
  impactScore: 'Impact Score',
  efficiency: 'Efficiency',
  acceptanceRate: 'Acceptance Rate',
  aiAmplification: 'AI Amplification',
  codeGenerations: 'Code Generations',
  codeAcceptances: 'Code Acceptances',
  linesDeleted: 'Lines Deleted',
  userROI: 'User ROI',
};

export const segmentSortOrder: Record<PerformanceSegment, number> = {
  Champion: 0,
  Producer: 1,
  Explorer: 2,
  Starter: 3,
};
