
import { CopilotDataRow } from '@/pages/Index';

export type PerformanceSegment =
  | 'Champion'
  | 'Producer'
  | 'Explorer'
  | 'Starter';

export interface ContributorWithSegment {
  userLogin: string;
  acceptedLines: number;
  suggestedLines: number;
  acceptanceRate: number;
  interactions: number;
  codeGenerations: number;
  codeAcceptances: number;
  linesDeleted: number;
  userROI: number;
  segment: PerformanceSegment;
}

export type SortableColumn =
  | "userLogin"
  | "segment"
  | "acceptedLines"
  | "suggestedLines"
  | "acceptanceRate"
  | "interactions"
  | "codeGenerations"
  | "codeAcceptances"
  | "linesDeleted"
  | "userROI";

export interface TopContributorsTableProps {
  data: CopilotDataRow[];
  isFiltered?: boolean;
}

export const columnLabels: Record<SortableColumn, string> = {
  userLogin: "User",
  segment: "Performance",
  acceptedLines: "Lines Added",
  suggestedLines: "Lines Suggested",
  acceptanceRate: "Acceptance Rate",
  interactions: "Interactions",
  codeGenerations: "Code Generations",
  codeAcceptances: "Code Acceptances",
  linesDeleted: "Lines Deleted",
  userROI: "User ROI",
};

export const segmentSortOrder: Record<PerformanceSegment, number> = {
  'Champion': 0,
  'Producer': 1,
  'Explorer': 2,
  'Starter': 3,
};
