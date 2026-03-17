import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ContributorWithSegment, PerformanceSegment } from '../types';
import {
  getSegmentBadgeStyle,
  getSegmentCalculationExplanation,
  getSegmentIcon,
} from '../performanceSegments';
import { useTableHover } from './TableHoverContext';

interface PerformanceSegmentBadgeProps {
  segment: PerformanceSegment;
  contributor: ContributorWithSegment;
}

export const PerformanceSegmentBadge = ({
  segment,
  contributor,
}: PerformanceSegmentBadgeProps) => {
  const { setHighlightedColumns, setHoveredEmail } = useTableHover();

  const handleMouseEnter = () => {
    setHighlightedColumns(['adoptionScore', 'impactScore', 'efficiency']);
    setHoveredEmail(contributor.userLogin);
  };

  const handleMouseLeave = () => {
    setHighlightedColumns([]);
    setHoveredEmail(null);
  };

  const visibleBadges = contributor.badges.slice(0, 2);
  const hiddenBadgeCount = Math.max(0, contributor.badges.length - visibleBadges.length);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="space-y-1 cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex flex-wrap items-center gap-2">
              {getSegmentIcon(segment)}
              <Badge className={getSegmentBadgeStyle(segment)}>{segment}</Badge>
              {contributor.usageMode && (
                <Badge variant="secondary" className="text-[10px] font-medium">
                  {contributor.usageMode}
                </Badge>
              )}
            </div>

            {contributor.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 pl-6">
                {visibleBadges.map((badge) => (
                  <Badge
                    key={badge}
                    variant="outline"
                    className="text-[10px] font-medium"
                  >
                    {badge}
                  </Badge>
                ))}
                {hiddenBadgeCount > 0 && (
                  <Badge variant="outline" className="text-[10px] font-medium">
                    +{hiddenBadgeCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm rounded-lg border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg">
          <div className="whitespace-pre-wrap leading-relaxed">
            {getSegmentCalculationExplanation(contributor)}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
