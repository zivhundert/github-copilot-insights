
import { Rocket, Sparkles, TrendingUp, Sprout } from 'lucide-react';
import { PerformanceSegment } from './types';

export const getPerformanceSegment = (acceptanceRate: number, interactions: number, userROI: number): PerformanceSegment => {
  if (acceptanceRate > 40 && interactions > 200 && userROI > 100) return 'Champion';
  if (acceptanceRate > 25 && interactions > 50 && userROI > 70) return 'Producer';
  if (acceptanceRate > 15 || interactions > 10 || userROI > 25) return 'Explorer';
  return 'Starter';
};

export const getSegmentIcon = (segment: PerformanceSegment) => {
  switch (segment) {
    case 'Champion': return <Rocket className="h-4 w-4 text-blue-600" />;
    case 'Producer': return <Sparkles className="h-4 w-4 text-green-500" />;
    case 'Explorer': return <TrendingUp className="h-4 w-4 text-orange-500" />;
    case 'Starter': return <Sprout className="h-4 w-4 text-lime-700" />;
  }
};

export const getSegmentBadgeStyle = (segment: PerformanceSegment) => {
  switch (segment) {
    case 'Champion': return 'bg-blue-200/70 text-blue-800 border-blue-300/50';
    case 'Producer': return 'bg-green-200/70 text-green-800 border-green-300/50';
    case 'Explorer': return 'bg-orange-200/70 text-orange-800 border-orange-300/50';
    case 'Starter': return 'bg-lime-50 text-lime-700 border-lime-300/50';
  }
};

export const getSegmentCalculationExplanation = (
  segment: PerformanceSegment,
  acceptanceRate: number,
  interactions: number,
  userROI: number
): string => {
  const formatCriteria = (value: number, threshold: number, isPercent: boolean = false) => {
    const formattedValue = isPercent ? `${value.toFixed(1)}%` : value.toLocaleString();
    const formattedThreshold = isPercent ? `${threshold}%` : threshold.toLocaleString();
    const icon = value > threshold ? '✓' : '✗';
    return `${formattedValue} > ${formattedThreshold} ${icon}`;
  };

  const acceptanceCriteria = formatCriteria(acceptanceRate, getThresholdForSegment(segment, 'acceptance'), true);
  const interactionsCriteria = formatCriteria(interactions, getThresholdForSegment(segment, 'interactions'));
  const roiCriteria = formatCriteria(userROI, getThresholdForSegment(segment, 'roi'), true);

  return `${segment} Calculation:\n• Acceptance Rate: ${acceptanceCriteria}\n• Interactions: ${interactionsCriteria}\n• User ROI: ${roiCriteria}`;
};

const getThresholdForSegment = (segment: PerformanceSegment, type: 'acceptance' | 'interactions' | 'roi'): number => {
  switch (segment) {
    case 'Champion': return type === 'acceptance' ? 40 : type === 'interactions' ? 200 : 100;
    case 'Producer': return type === 'acceptance' ? 25 : type === 'interactions' ? 50 : 70;
    case 'Explorer': return type === 'acceptance' ? 15 : type === 'interactions' ? 10 : 25;
    case 'Starter': return 0;
  }
};

export const getSegmentDescription = (segment: PerformanceSegment) => {
  switch (segment) {
    case 'Champion': return 'Top-tier adopter: Leading by example with outstanding AI-driven value!';
    case 'Producer': return 'Active and effective: Regularly using Copilot to drive efficiency.';
    case 'Explorer': return 'Growing skills and increasing impact with every use.';
    case 'Starter': return 'Just getting started — try more features to unlock potential!';
  }
};
