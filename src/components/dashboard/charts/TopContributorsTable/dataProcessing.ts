
import { useMemo } from 'react';
import { CopilotDataRow } from '@/pages/Index';
import { ContributorWithSegment } from './types';
import { getPerformanceSegment } from './performanceSegments';

export const useContributorData = (data: CopilotDataRow[], linesPerMinute: number, pricePerHour: number, copilotPricePerUser: number) => {
  return useMemo(() => {
    const userStats = new Map<string, ContributorWithSegment>();
    
    const ccStats = new Map<string, { ccAccepted: number; ccSuggested: number }>();

    data.forEach(row => {
      const userLogin = row.user_login;
      
      if (!userStats.has(userLogin)) {
        userStats.set(userLogin, {
          userLogin,
          acceptedLines: 0,
          suggestedLines: 0,
          acceptanceRate: 0,
          interactions: 0,
          codeGenerations: 0,
          codeAcceptances: 0,
          linesDeleted: 0,
          userROI: 0,
          segment: 'Starter',
        });
        ccStats.set(userLogin, { ccAccepted: 0, ccSuggested: 0 });
      }
      
      const stats = userStats.get(userLogin)!;
      const cc = ccStats.get(userLogin)!;
      stats.acceptedLines += row.loc_added_sum || 0;
      stats.suggestedLines += row.loc_suggested_to_add_sum || 0;
      stats.interactions += row.user_initiated_interaction_count || 0;
      stats.codeGenerations += row.code_generation_activity_count || 0;
      stats.codeAcceptances += row.code_acceptance_activity_count || 0;
      stats.linesDeleted += row.loc_deleted_sum || 0;

      // Track code_completion feature separately for acceptance rate
      const codeCompletion = (row.totals_by_feature || []).find(f => f.feature === 'code_completion');
      cc.ccAccepted += codeCompletion?.loc_added_sum || 0;
      cc.ccSuggested += codeCompletion?.loc_suggested_to_add_sum || 0;
    });
    
    userStats.forEach((stats, userLogin) => {
      const cc = ccStats.get(userLogin)!;
      stats.acceptanceRate = cc.ccSuggested > 0
        ? (cc.ccAccepted / cc.ccSuggested) * 100
        : 0;
      
      const estimatedHoursSaved = Math.round(stats.acceptedLines / (linesPerMinute * 60));
      const individualMoneySaved = estimatedHoursSaved * pricePerHour;
      const annualCostPerUser = copilotPricePerUser * 12;
      
      stats.userROI = annualCostPerUser > 0 
        ? (individualMoneySaved / annualCostPerUser) * 100
        : 0;
      
      stats.segment = getPerformanceSegment(stats.acceptanceRate, stats.interactions, stats.userROI);
    });
    
    return Array.from(userStats.values());
  }, [data, linesPerMinute, pricePerHour, copilotPricePerUser]);
};
