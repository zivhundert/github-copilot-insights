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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="inline-flex items-center gap-2 whitespace-nowrap align-middle">
              {getSegmentIcon(segment)}
              <Badge className={getSegmentBadgeStyle(segment)}>{segment}</Badge>
            </div>
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
