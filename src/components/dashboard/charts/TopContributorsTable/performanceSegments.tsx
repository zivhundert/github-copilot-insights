import { Rocket, Sparkles, TrendingUp, Sprout } from 'lucide-react';
import { ContributorWithSegment, PerformanceSegment } from './types';
import { ACCEPTANCE_RELIABILITY_THRESHOLD } from './leaderboardModel';

export const getSegmentIcon = (segment: PerformanceSegment) => {
  switch (segment) {
    case 'Champion':
      return <Rocket className="h-4 w-4 text-blue-600" />;
    case 'Producer':
      return <Sparkles className="h-4 w-4 text-green-500" />;
    case 'Explorer':
      return <TrendingUp className="h-4 w-4 text-orange-500" />;
    case 'Starter':
      return <Sprout className="h-4 w-4 text-lime-700" />;
  }
};

export const getSegmentBadgeStyle = (segment: PerformanceSegment) => {
  switch (segment) {
    case 'Champion':
      return 'bg-blue-200/70 text-blue-800 border-blue-300/50';
    case 'Producer':
      return 'bg-green-200/70 text-green-800 border-green-300/50';
    case 'Explorer':
      return 'bg-orange-200/70 text-orange-800 border-orange-300/50';
    case 'Starter':
      return 'bg-lime-50 text-lime-700 border-lime-300/50';
  }
};

export const getSegmentCalculationExplanation = (
  contributor: ContributorWithSegment
): string => {
  const acceptanceText =
    contributor.codeGenerations > 0
      ? `${contributor.acceptanceRate.toFixed(1)}%${
          contributor.acceptanceConfidence === 'low'
            ? ` (low confidence: under ${ACCEPTANCE_RELIABILITY_THRESHOLD} generations)`
            : ''
        }`
      : 'N/A';

  const amplificationText =
    contributor.suggestedLines > 0
      ? `${contributor.aiAmplification.toFixed(1)}%`
      : 'N/A (no suggested-line baseline)';

  const badgesText = contributor.badges.length
    ? `\n• Badges: ${contributor.badges.join(', ')}`
    : '';

  return `${contributor.segment}${
    contributor.usageMode ? ` · ${contributor.usageMode}` : ''
  }\n• Adoption Score: ${contributor.adoptionScore.toFixed(0)}/100\n• Impact Score: ${contributor.impactScore.toFixed(0)}/100\n• Efficiency: ${
    contributor.efficiency !== null
      ? `${contributor.efficiency.toFixed(1)} AI-added lines / interaction`
      : 'N/A'
  }\n• Acceptance Rate: ${acceptanceText}\n• AI Amplification: ${amplificationText}${badgesText}\n• Segments prioritize Copilot adoption and Copilot-related output, so agent-heavy workflows are not penalized for lower traditional acceptance.`;
};

export const getSegmentDescription = (segment: PerformanceSegment) => {
  switch (segment) {
    case 'Champion':
      return 'Top-tier adopter with strong Copilot usage and strong output.';
    case 'Producer':
      return 'Solid adoption with meaningful Copilot-driven output.';
    case 'Explorer':
      return 'Actively learning, experimenting, and growing impact.';
    case 'Starter':
      return 'Just getting started — build adoption momentum first.';
  }
};
