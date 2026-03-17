import { useMemo } from 'react';
import { ContributorWithSegment, SortableColumn, segmentSortOrder } from './types';

export const getAriaSort = (
  col: SortableColumn,
  sortConfig: { column: SortableColumn; direction: 'asc' | 'desc' }
) => {
  if (col !== sortConfig.column) return 'none';
  return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
};

const sortByDirection = (
  value: number,
  direction: 'asc' | 'desc'
) => (direction === 'asc' ? value : -value);

const getNumericValue = (
  contributor: ContributorWithSegment,
  column: Exclude<SortableColumn, 'userLogin' | 'segment'>
) => {
  if (column === 'efficiency') {
    return contributor.efficiency ?? -1;
  }

  return Number(contributor[column]);
};

export const useSortedContributors = (
  contributors: ContributorWithSegment[],
  sortConfig: { column: SortableColumn; direction: 'asc' | 'desc' }
) => {
  return useMemo(() => {
    const sorted = [...contributors];

    switch (sortConfig.column) {
      case 'userLogin':
        sorted.sort((a, b) =>
          sortConfig.direction === 'asc'
            ? a.userLogin.localeCompare(b.userLogin)
            : b.userLogin.localeCompare(a.userLogin)
        );
        break;
      case 'segment':
        sorted.sort((a, b) => {
          const segmentDiff = segmentSortOrder[a.segment] - segmentSortOrder[b.segment];
          if (segmentDiff !== 0) {
            return sortByDirection(segmentDiff, sortConfig.direction);
          }

          const adoptionDiff = b.adoptionScore - a.adoptionScore;
          if (adoptionDiff !== 0) return adoptionDiff;

          const impactDiff = b.impactScore - a.impactScore;
          if (impactDiff !== 0) return impactDiff;

          const efficiencyDiff = b.efficiencyScore - a.efficiencyScore;
          if (efficiencyDiff !== 0) return efficiencyDiff;

          return b.acceptanceRate - a.acceptanceRate;
        });
        break;
      case 'acceptanceRate':
        sorted.sort((a, b) => {
          const rateDiff = sortByDirection(
            a.acceptanceRate - b.acceptanceRate,
            sortConfig.direction
          );
          if (rateDiff !== 0) return rateDiff;

          return sortByDirection(
            a.codeGenerations - b.codeGenerations,
            sortConfig.direction
          );
        });
        break;
      case 'addedLines':
      case 'suggestedLines':
      case 'interactions':
      case 'adoptionScore':
      case 'impactScore':
      case 'efficiency':
      case 'aiAmplification':
      case 'codeGenerations':
      case 'codeAcceptances':
      case 'linesDeleted':
      case 'userROI':
        sorted.sort((a, b) =>
          sortByDirection(
            getNumericValue(a, sortConfig.column) -
              getNumericValue(b, sortConfig.column),
            sortConfig.direction
          )
        );
        break;
    }

    return sorted;
  }, [contributors, sortConfig]);
};
