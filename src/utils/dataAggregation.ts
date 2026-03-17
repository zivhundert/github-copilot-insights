
import { startOfWeek, startOfMonth, format } from 'date-fns';
import { CopilotDataRow } from '@/pages/Index';

export type AggregationPeriod = 'day' | 'week' | 'month';

export const aggregateDataByPeriod = (data: CopilotDataRow[], period: AggregationPeriod): CopilotDataRow[] => {
  if (period === 'day') {
    return data;
  }

  const aggregatedMap = new Map<string, {
    date: string;
    rows: CopilotDataRow[];
  }>();

  data.forEach(row => {
    const date = new Date(row.day);
    let periodKey: string;
    
    if (period === 'week') {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      periodKey = format(weekStart, 'yyyy-MM-dd');
    } else {
      const monthStart = startOfMonth(date);
      periodKey = format(monthStart, 'yyyy-MM-dd');
    }

    if (!aggregatedMap.has(periodKey)) {
      aggregatedMap.set(periodKey, {
        date: periodKey,
        rows: [],
      });
    }

    aggregatedMap.get(periodKey)!.rows.push(row);
  });

  // Return all rows with updated dates for period grouping
  const result: CopilotDataRow[] = [];
  
  Array.from(aggregatedMap.values()).forEach(agg => {
    agg.rows.forEach(row => {
      result.push({
        ...row,
        day: agg.date,
      });
    });
  });

  return result.sort((a, b) => a.day.localeCompare(b.day));
};

export const formatPeriodLabel = (date: string, period: AggregationPeriod): string => {
  const dateObj = new Date(date);
  
  switch (period) {
    case 'day':
      return format(dateObj, 'MMM dd');
    case 'week':
      return format(dateObj, "'Week' w, yyyy");
    case 'month':
      return format(dateObj, 'MMM yyyy');
    default:
      return format(dateObj, 'MMM dd');
  }
};
