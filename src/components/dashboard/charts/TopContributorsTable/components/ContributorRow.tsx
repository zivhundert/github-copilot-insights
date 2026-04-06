import { TableCell, TableRow } from '@/components/ui/table';
import { ContributorWithSegment } from '../types';
import { PerformanceSegmentBadge } from './PerformanceSegmentBadge';
import { useTableHover } from './TableHoverContext';

interface ContributorRowProps {
  contributor: ContributorWithSegment;
  onUserClick?: (userLogin: string) => void;
}

export const ContributorRow = ({ contributor, onUserClick }: ContributorRowProps) => {
  const { highlightedColumns, hoveredEmail } = useTableHover();

  const getCellClassName = (columnKey: string) => {
    const baseClass = 'text-right transition-colors duration-200';
    const isHighlighted =
      highlightedColumns.includes(columnKey) &&
      hoveredEmail === contributor.userLogin;

    return isHighlighted
      ? `${baseClass} bg-green-200/70 dark:bg-green-900/20 font-bold`
      : baseClass;
  };

  return (
    <TableRow>
      <TableCell
        className="font-medium cursor-pointer hover:underline text-primary"
        onClick={() => onUserClick?.(contributor.userLogin)}
      >
        {contributor.userLogin}
      </TableCell>
      <TableCell>
        <PerformanceSegmentBadge segment={contributor.segment} contributor={contributor} />
      </TableCell>
      <TableCell className="text-right">
        {contributor.addedLines.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        {contributor.interactions.toLocaleString()}
      </TableCell>
      <TableCell className={getCellClassName('adoptionScore')}>
        {contributor.adoptionScore.toFixed(0)}
      </TableCell>
      <TableCell className={getCellClassName('impactScore')}>
        {contributor.impactScore.toFixed(0)}
      </TableCell>
      <TableCell className={getCellClassName('efficiency')}>
        {contributor.efficiency !== null ? contributor.efficiency.toFixed(1) : 'N/A'}
      </TableCell>
      <TableCell className={getCellClassName('acceptanceRate')}>
        <div className="flex flex-col items-end">
          <span>
            {contributor.codeGenerations > 0
              ? `${contributor.acceptanceRate.toFixed(1)}%`
              : 'N/A'}
          </span>
          {contributor.codeGenerations > 0 &&
            contributor.acceptanceConfidence === 'low' && (
              <span className="text-xs font-normal text-muted-foreground">
                Low conf.
              </span>
            )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        {contributor.suggestedLines.toLocaleString()}
      </TableCell>
      <TableCell className={getCellClassName('aiAmplification')}>
        {contributor.suggestedLines > 0
          ? `${contributor.aiAmplification.toFixed(1)}%`
          : 'N/A'}
      </TableCell>
      <TableCell className="text-right">
        {contributor.codeGenerations.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        {contributor.codeAcceptances.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        {contributor.linesDeleted.toLocaleString()}
      </TableCell>
      <TableCell className="text-right">
        {contributor.userROI.toFixed(1)}%
      </TableCell>
    </TableRow>
  );
};
