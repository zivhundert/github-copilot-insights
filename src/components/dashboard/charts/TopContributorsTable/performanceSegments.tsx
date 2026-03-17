import { Rocket, Sparkles, TrendingUp, Sprout } from 'lucide-react';
import { ContributorWithSegment, PerformanceSegment } from './types';
import { ACCEPTANCE_RELIABILITY_THRESHOLD } from './leaderboardModel';

export const getSegmentIcon = (segment: PerformanceSegment) => {
  switch (segment) {
    case 'Champion':
      return <Rocket className="h-4 w-4 shrink-0 text-segment-champion-foreground" />;
    case 'Producer':
      return <Sparkles className="h-4 w-4 shrink-0 text-segment-producer-foreground" />;
    case 'Explorer':
      return <TrendingUp className="h-4 w-4 shrink-0 text-segment-explorer-foreground" />;
    case 'Starter':
      return <Sprout className="h-4 w-4 shrink-0 text-segment-starter-foreground" />;
  }
};

export const getSegmentBadgeStyle = (segment: PerformanceSegment) => {
  switch (segment) {
    case 'Champion':
      return 'border-segment-champion-border bg-segment-champion text-segment-champion-foreground';
    case 'Producer':
      return 'border-segment-producer-border bg-segment-producer text-segment-producer-foreground';
    case 'Explorer':
      return 'border-segment-explorer-border bg-segment-explorer text-segment-explorer-foreground';
    case 'Starter':
      return 'border-segment-starter-border bg-segment-starter text-segment-starter-foreground';
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
      : 'N/A';

  const usageModeText = contributor.usageMode
    ? `Usage mode: ${contributor.usageMode}\n\n`
    : '';

  const signalsText = contributor.badges.length
    ? `\n\nSignals:\n${contributor.badges.map((badge) => `• ${badge}`).join('\n')}`
    : '';

  return `${contributor.segment}\n${usageModeText}Adoption Score: ${contributor.adoptionScore.toFixed(0)}/100\nImpact Score: ${contributor.impactScore.toFixed(0)}/100\nEfficiency: ${
    contributor.efficiency !== null
      ? `${contributor.efficiency.toFixed(1)} AI-added lines / interaction`
      : 'N/A'
  }\nAcceptance Rate: ${acceptanceText}\nAI Amplification: ${amplificationText}${signalsText}`;
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
