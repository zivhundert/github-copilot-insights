import { useState, useEffect } from 'react';
import { DateRangePicker } from './filters/DateRangePicker';
import { UserSelector } from './filters/UserSelector';
import { AggregationPeriodSelector } from './filters/AggregationPeriodSelector';
import { FilterActions } from './filters/FilterActions';
import type { CopilotDataRow } from '@/pages/Index';
import type { DateRange } from 'react-day-picker';
import type { AggregationPeriod } from '@/utils/dataAggregation';

interface DashboardFiltersProps {
  data: CopilotDataRow[];
  onFiltersChange: (filters: {
    dateRange: { from?: Date; to?: Date };
    selectedUsers: string[];
    aggregationPeriod: AggregationPeriod;
  }) => void;
  externalSelectedUsers?: string[];
}

export const DashboardFilters = ({ data, onFiltersChange, externalSelectedUsers }: DashboardFiltersProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [aggregationPeriod, setAggregationPeriod] = useState<AggregationPeriod>('day');

  useEffect(() => {
    if (externalSelectedUsers !== undefined) {
      setSelectedUsers(externalSelectedUsers);
    }
  }, [externalSelectedUsers]);

  const uniqueUsers = Array.from(new Set(data.map(row => row.user_login))).sort();

  const handleFilterChange = () => {
    onFiltersChange({
      dateRange: {
        from: dateRange?.from,
        to: dateRange?.to,
      },
      selectedUsers,
      aggregationPeriod,
    });
  };

  const clearFilters = () => {
    setDateRange(undefined);
    setSelectedUsers([]);
    setAggregationPeriod('day');
    onFiltersChange({
      dateRange: {},
      selectedUsers: [],
      aggregationPeriod: 'day',
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-end gap-3 rounded-lg border bg-card p-3">
      <DateRangePicker
        data={data}
        value={dateRange}
        onChange={setDateRange}
      />

      <AggregationPeriodSelector
        value={aggregationPeriod}
        onChange={setAggregationPeriod}
      />

      <UserSelector
        users={uniqueUsers}
        selectedUsers={selectedUsers}
        onChange={setSelectedUsers}
      />

      <FilterActions
        onApply={handleFilterChange}
        onClear={clearFilters}
      />
    </div>
  );
};
