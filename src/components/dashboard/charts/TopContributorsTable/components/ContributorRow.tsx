
import { TableCell, TableRow } from '@/components/ui/table';
import { ContributorWithSegment } from '../types';
import { PerformanceSegmentBadge } from './PerformanceSegmentBadge';
import { useTableHover } from './TableHoverContext';

interface ContributorRowProps {
  contributor: ContributorWithSegment;
}

export const ContributorRow = ({ contributor }: ContributorRowProps) => {
  const { highlightedColumns, hoveredEmail } = useTableHover();

  const getCellClassName = (columnKey: string) => {
    const baseClass = "text-right transition-colors duration-200";
    const isHighlighted = highlightedColumns.includes(columnKey) && hoveredEmail === contributor.userLogin;
    return isHighlighted 
      ? `${baseClass} bg-green-200/70 dark:bg-green-900/20 font-bold` 
      : baseClass;
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{contributor.userLogin}</TableCell>
      <TableCell>
        <PerformanceSegmentBadge segment={contributor.segment} contributor={contributor} />
      </TableCell>
      <TableCell className="text-right">{contributor.acceptedLines.toLocaleString()}</TableCell>
      <TableCell className="text-right">{contributor.suggestedLines.toLocaleString()}</TableCell>
      <TableCell className={getCellClassName('acceptanceRate')}>
        {contributor.codeGenerations > 0 ? `${contributor.acceptanceRate.toFixed(1)}%` : 'N/A'}
      </TableCell>
      <TableCell className={getCellClassName('aiAmplification')}>
        {contributor.aiAmplification.toFixed(1)}%
      </TableCell>
      <TableCell className="text-right">{contributor.interactions.toLocaleString()}</TableCell>
      <TableCell className="text-right">{contributor.codeGenerations.toLocaleString()}</TableCell>
      <TableCell className="text-right">{contributor.codeAcceptances.toLocaleString()}</TableCell>
      <TableCell className="text-right">{contributor.linesDeleted.toLocaleString()}</TableCell>
      <TableCell className={getCellClassName('userROI')}>{contributor.userROI.toFixed(1)}%</TableCell>
    </TableRow>
  );
};
