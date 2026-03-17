import {
  AchievementBadge,
  ContributorWithSegment,
  PerformanceSegment,
  UsageMode,
} from './types';

export const ACCEPTANCE_RELIABILITY_THRESHOLD = 20;

interface BadgeThresholds {
  highOutputThreshold: number;
  efficiencyThreshold: number;
  medianImpactThreshold: number;
}

const clampScore = (value: number) => Math.max(0, Math.min(100, Number(value.toFixed(1))));

export const normalizeLogScore = (value: number, maxValue: number) => {
  if (value <= 0 || maxValue <= 0) return 0;
  return clampScore((Math.log1p(value) / Math.log1p(maxValue)) * 100);
};

export const percentileThreshold = (values: number[], percentile: number) => {
  const sorted = values
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (sorted.length === 0) return 0;

  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(percentile * sorted.length) - 1)
  );

  return sorted[index];
};

export const getPerformanceSegment = (
  adoptionScore: number,
  impactScore: number
): PerformanceSegment => {
  if (adoptionScore < 20) return 'Starter';
  if (adoptionScore >= 70 && impactScore >= 70) return 'Champion';
  if (adoptionScore >= 50 && impactScore >= 40) return 'Producer';
  return 'Explorer';
};

export const getUsageMode = (
  contributor: Pick<
    ContributorWithSegment,
    | 'addedLines'
    | 'suggestedLines'
    | 'acceptanceRate'
    | 'codeGenerations'
    | 'aiAmplification'
    | 'agentUsageDays'
    | 'chatUsageDays'
  >
): UsageMode => {
  const hasReliableSuggestionFlow =
    contributor.codeGenerations >= ACCEPTANCE_RELIABILITY_THRESHOLD ||
    contributor.suggestedLines >= 150;

  const strongAgentSignal =
    contributor.addedLines >= 150 &&
    (
      contributor.suggestedLines === 0 ||
      contributor.aiAmplification >= 120 ||
      contributor.agentUsageDays > contributor.chatUsageDays
    );

  if (
    strongAgentSignal &&
    (
      contributor.codeGenerations < ACCEPTANCE_RELIABILITY_THRESHOLD ||
      contributor.acceptanceRate < 20
    )
  ) {
    return 'Agent-heavy';
  }

  if (
    hasReliableSuggestionFlow &&
    contributor.acceptanceRate >= 20 &&
    contributor.suggestedLines >= contributor.addedLines * 0.7 &&
    contributor.chatUsageDays >= contributor.agentUsageDays
  ) {
    return 'Chat-heavy';
  }

  return 'Hybrid';
};

export const getBadgeThresholds = (
  contributors: ContributorWithSegment[]
): BadgeThresholds => ({
  highOutputThreshold: percentileThreshold(
    contributors.map((contributor) => contributor.addedLines),
    0.8
  ),
  efficiencyThreshold: percentileThreshold(
    contributors
      .map((contributor) => contributor.efficiency ?? 0)
      .filter((value) => value > 0),
    0.8
  ),
  medianImpactThreshold: percentileThreshold(
    contributors.map((contributor) => contributor.addedLines),
    0.5
  ),
});

export const getAchievementBadges = (
  contributor: ContributorWithSegment,
  thresholds: BadgeThresholds
): AchievementBadge[] => {
  const badges: AchievementBadge[] = [];

  if (
    contributor.addedLines >= thresholds.highOutputThreshold &&
    contributor.addedLines > 0
  ) {
    badges.push('High Output');
  }

  if (
    contributor.usageMode === 'Agent-heavy' &&
    contributor.addedLines >= thresholds.medianImpactThreshold
  ) {
    badges.push('Agent Power User');
  }

  if (
    contributor.efficiency !== null &&
    contributor.efficiency >= thresholds.efficiencyThreshold &&
    contributor.interactions > 0
  ) {
    badges.push('Efficient');
  }

  if (
    contributor.acceptanceRate >= 40 &&
    contributor.codeGenerations >= ACCEPTANCE_RELIABILITY_THRESHOLD
  ) {
    badges.push('High Acceptance');
  }

  if (contributor.adoptionScore >= 60 && contributor.impactScore < 35) {
    badges.push('Experimenting');
  }

  return badges;
};
