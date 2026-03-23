import { useMemo } from 'react';
import { CopilotDataRow } from '@/pages/Index';
import { ContributorWithSegment } from './types';
import {
  ACCEPTANCE_RELIABILITY_THRESHOLD,
  getAchievementBadges,
  getBadgeThresholds,
  getPerformanceSegment,
  getUsageMode,
  normalizeLogScore,
} from './leaderboardModel';

export const useContributorData = (
  data: CopilotDataRow[],
  linesPerMinute: number,
  pricePerHour: number,
  copilotPricePerUser: number,
  originalData?: CopilotDataRow[]
) => {
  return useMemo(() => {
    const userStats = new Map<string, ContributorWithSegment>();

    data.forEach((row) => {
      const userLogin = row.user_login;

      if (!userStats.has(userLogin)) {
        userStats.set(userLogin, {
          userLogin,
          addedLines: 0,
          suggestedLines: 0,
          acceptanceRate: 0,
          aiAmplification: 0,
          interactions: 0,
          codeGenerations: 0,
          codeAcceptances: 0,
          linesDeleted: 0,
          userROI: 0,
          segment: 'Starter',
          usageMode: null,
          adoptionScore: 0,
          impactScore: 0,
          effectivenessScore: 0,
          efficiency: null,
          efficiencyScore: 0,
          acceptanceConfidence: 'low',
          badges: [],
          agentUsageDays: 0,
          chatUsageDays: 0,
          cliUsageDays: 0,
        });
      }

      const stats = userStats.get(userLogin)!;
      stats.addedLines += row.loc_added_sum || 0;
      stats.suggestedLines += row.loc_suggested_to_add_sum || 0;
      stats.interactions += row.user_initiated_interaction_count || 0;
      stats.codeGenerations += row.code_generation_activity_count || 0;
      stats.codeAcceptances += row.code_acceptance_activity_count || 0;
      stats.linesDeleted += row.loc_deleted_sum || 0;
      stats.agentUsageDays += row.used_agent ? 1 : 0;
      stats.chatUsageDays += row.used_chat ? 1 : 0;
      stats.cliUsageDays += row.used_cli ? 1 : 0;
    });

    const contributors = Array.from(userStats.values());

    // Compute normalization maxes from the original (unfiltered) dataset
    // so that segment classifications remain stable regardless of user filtering.
    const referenceData = originalData ?? data;
    const refStats = new Map<string, { interactions: number; codeGenerations: number; addedLines: number }>();
    referenceData.forEach((row) => {
      const login = row.user_login;
      if (!refStats.has(login)) {
        refStats.set(login, { interactions: 0, codeGenerations: 0, addedLines: 0 });
      }
      const s = refStats.get(login)!;
      s.interactions += row.user_initiated_interaction_count || 0;
      s.codeGenerations += row.code_generation_activity_count || 0;
      s.addedLines += row.loc_added_sum || 0;
    });
    const refContributors = Array.from(refStats.values());
    const maxAdoptionRaw = Math.max(
      0,
      ...refContributors.map((c) => c.interactions + c.codeGenerations)
    );
    const maxImpactRaw = Math.max(
      0,
      ...refContributors.map((c) => c.addedLines)
    );
    const maxEfficiencyRaw = Math.max(
      0,
      ...refContributors.map((c) =>
        c.interactions > 0
          ? c.addedLines / c.interactions
          : 0
      )
    );
    const annualCostPerUser = copilotPricePerUser * 12;

    contributors.forEach((stats) => {
      stats.acceptanceRate =
        stats.codeGenerations > 0
          ? (stats.codeAcceptances / stats.codeGenerations) * 100
          : 0;

      stats.acceptanceConfidence =
        stats.codeGenerations >= ACCEPTANCE_RELIABILITY_THRESHOLD
          ? 'reliable'
          : 'low';

      stats.aiAmplification =
        stats.suggestedLines > 0
          ? (stats.addedLines / stats.suggestedLines) * 100
          : 0;

      stats.efficiency =
        stats.interactions > 0 ? stats.addedLines / stats.interactions : null;

      const estimatedHoursSaved = Math.round(
        stats.addedLines / (linesPerMinute * 60)
      );
      const individualMoneySaved = estimatedHoursSaved * pricePerHour;

      stats.userROI =
        annualCostPerUser > 0
          ? (individualMoneySaved / annualCostPerUser) * 100
          : 0;

      const adoptionRaw = stats.interactions + stats.codeGenerations;
      stats.adoptionScore = normalizeLogScore(adoptionRaw, maxAdoptionRaw);
      stats.impactScore = normalizeLogScore(stats.addedLines, maxImpactRaw);
      stats.efficiencyScore = normalizeLogScore(
        stats.efficiency ?? 0,
        maxEfficiencyRaw
      );
      stats.effectivenessScore =
        stats.codeGenerations > 0
          ? stats.acceptanceRate * (stats.acceptanceConfidence === 'low' ? 0.5 : 1)
          : 0;

      stats.segment = getPerformanceSegment(
        stats.adoptionScore,
        stats.impactScore
      );
      stats.usageMode =
        stats.segment === 'Starter' ? null : getUsageMode(stats);
    });

    const badgeThresholds = getBadgeThresholds(contributors);

    contributors.forEach((stats) => {
      stats.badges = getAchievementBadges(stats, badgeThresholds);
    });

    return contributors;
  }, [data, linesPerMinute, pricePerHour, copilotPricePerUser, originalData]);
};
