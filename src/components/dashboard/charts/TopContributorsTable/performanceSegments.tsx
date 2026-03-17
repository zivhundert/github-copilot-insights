import { Rocket, Sparkles, TrendingUp, Sprout } from 'lucide-react';
import { ContributorWithSegment, PerformanceSegment } from './types';
import { ACCEPTANCE_RELIABILITY_THRESHOLD } from './leaderboardModel';

export const getSegmentIcon = (segment: PerformanceSegment) => {
  switch (segment) {
    case 'Champion':
      return <Rocket className="h-4 w-4 text-primary" />;
    case 'Producer':
      return <Sparkles className="h-4 w-4 text-foreground" />;
    case 'Explorer':
      return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    case 'Starter':
      return <Sprout className="h-4 w-4 text-secondary-foreground" />;
  }
};

export const getSegmentBadgeStyle = (segment: PerformanceSegment) => {
  switch (segment) {
    case 'Champion':
      return 'border-primary/20 bg-primary/10 text-primary';
    case 'Producer':
      return 'border-border bg-secondary text-secondary-foreground';
    case 'Explorer':
      return 'border-border bg-accent text-accent-foreground';
    case 'Starter':
      return 'border-border bg-muted text-muted-foreground';
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
