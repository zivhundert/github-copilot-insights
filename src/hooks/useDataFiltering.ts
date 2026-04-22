
import { useState, useMemo } from 'react';
import { CopilotDataRow } from '@/pages/Index';
import { aggregateDataByPeriod, type AggregationPeriod } from '@/utils/dataAggregation';

export interface FilterOptions {
  dateRange: { from?: Date; to?: Date };
  selectedUsers: string[];
  aggregationPeriod: AggregationPeriod;
}

export const useDataFiltering = (originalData: CopilotDataRow[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {},
    selectedUsers: [],
    aggregationPeriod: 'day'
  });

  const { filteredData, baseFilteredData } = useMemo(() => {
    let filtered = [...originalData];

    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(row => {
        // Parse as local date to match the calendar picker's local-midnight dates.
        // new Date("YYYY-MM-DD") parses as UTC, causing timezone mismatches.
        const [y, m, d] = row.day.split('-').map(Number);
        const rowDate = new Date(y, m - 1, d);
        if (filters.dateRange.from && rowDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && rowDate > filters.dateRange.to) return false;
        return true;
      });
    }

    if (filters.selectedUsers.length > 0) {
      filtered = filtered.filter(row => filters.selectedUsers.includes(row.user_login));
    }

    const baseFiltered = filtered;
    const aggregatedData = aggregateDataByPeriod(filtered, filters.aggregationPeriod);

    return {
      filteredData: aggregatedData,
      baseFilteredData: baseFiltered
    };
  }, [originalData, filters]);

  const updateFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters({
      dateRange: {},
      selectedUsers: [],
      aggregationPeriod: 'day'
    });
  };

  return {
    filteredData,
    baseFilteredData,
    filters,
    updateFilters,
    resetFilters
  };
};
