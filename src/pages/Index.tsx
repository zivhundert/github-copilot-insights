
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { UserProfileCard } from '@/components/dashboard/UserProfileCard';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { UserCompareDialog } from '@/components/dashboard/UserCompareDialog';
import { PrivacyFooter } from '@/components/common/PrivacyFooter';
import { LandingPage } from '@/components/landing/LandingPage';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useSettings } from '@/contexts/SettingsContext';
import { FilterByUserProvider } from '@/contexts/FilterByUserContext';
import { analytics } from '@/services/analytics';
import { useState, useMemo, useCallback } from 'react';

export interface CopilotDataRow {
  day: string;
  user_login: string;
  user_id: number;
  enterprise_id: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  used_agent: boolean;
  used_chat: boolean;
  used_cli: boolean;
  totals_by_ide: Array<{
    ide: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
    last_known_plugin_version?: {
      sampled_at: string;
      plugin: string;
      plugin_version: string;
    };
    last_known_ide_version?: {
      sampled_at: string;
      ide_version: string;
    };
  }>;
  totals_by_feature: Array<{
    feature: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
  }>;
  totals_by_language_feature: Array<{
    language: string;
    feature: string;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
  }>;
  totals_by_model_feature: Array<{
    model: string;
    feature: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    loc_suggested_to_add_sum: number;
    loc_suggested_to_delete_sum: number;
    loc_added_sum: number;
    loc_deleted_sum: number;
  }>;
}

const Index = () => {
  const {
    originalData,
    filteredData,
    baseFilteredData,
    isLoading,
    handleFileUpload,
    handleMultiFileUpload,
    fetchFromGitHub,
    apiConfigured,
    updateFilters,
    handleReloadCSV,
    filters
  } = useDashboardData();

  const { settings } = useSettings();
  const [compareOpen, setCompareOpen] = useState(false);

  const handleFileUploadWithAnalytics = (data: any) => {
    handleMultiFileUpload(Array.isArray(data) ? data : [data]);
    analytics.trackFileUpload(Array.isArray(data) ? data.length : 1);
  };

  const handleReloadCSVWithAnalytics = () => {
    handleReloadCSV();
    analytics.trackCsvReload();
  };

  const handleRefreshFromGitHub = () => {
    handleReloadCSV();
    fetchFromGitHub();
  };

  const updateFiltersWithAnalytics = (newFilters: any) => {
    updateFilters(newFilters);
    Object.keys(newFilters).forEach(filterKey => {
      analytics.trackFilterUsage(filterKey);
    });
  };

  const [externalSelectedUsers, setExternalSelectedUsers] = useState<string[] | undefined>();

  const handleFilterByUser = useCallback((userName: string) => {
    const newFilters = {
      dateRange: filters.dateRange || {},
      selectedUsers: [userName],
      aggregationPeriod: filters.aggregationPeriod || 'day' as const,
    };
    setExternalSelectedUsers([userName]);
    updateFiltersWithAnalytics(newFilters);
  }, [filters]);

  const filterByUserContextValue = useMemo(() => ({ filterByUser: handleFilterByUser }), [handleFilterByUser]);

  const isSingleUserSelected = filters.selectedUsers && filters.selectedUsers.length === 1;
  const singleUserData = isSingleUserSelected
    ? filteredData.filter(r => r.user_login === filters.selectedUsers![0])
    : [];

  // Show the full-screen landing page when no data is loaded
  if (originalData.length === 0 && !(isLoading && apiConfigured)) {
    return <LandingPage onFileUpload={handleFileUploadWithAnalytics} isLoading={isLoading} />;
  }

  return (
    <FilterByUserProvider value={filterByUserContextValue}>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4" data-export="dashboard-main">
        <DashboardHeader
          showReloadButton={originalData.length > 0} 
          onReloadCSV={apiConfigured ? handleRefreshFromGitHub : handleReloadCSVWithAnalytics}
          showExportButton={originalData.length > 0}
          showSettingsButton={originalData.length > 0}
          showCompareButton={originalData.length > 0}
          onCompareOpen={() => setCompareOpen(true)}
          reloadLabel={apiConfigured ? 'Refresh from GitHub' : undefined}
          showChatButton={originalData.length > 0}
          chatData={originalData}
          onImportMoreData={originalData.length > 0 ? handleFileUploadWithAnalytics : undefined}
          onClearData={handleReloadCSVWithAnalytics}
          exportData={originalData.length > 0 ? () => originalData.map(r => JSON.stringify(r)).join('\n') : undefined}
        />
        
        {originalData.length === 0 && isLoading && apiConfigured && (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 mt-8">
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm">Fetching Copilot data from GitHub Enterprise…</p>
          </div>
        )}
        
        {originalData.length > 0 && (
          <div className="space-y-6">
            <DashboardMetrics
              data={filteredData} 
              originalData={originalData} 
              baseFilteredData={baseFilteredData} 
            />

            {settings.chartVisibility.insightsPanel && (
              <InsightsPanel data={originalData} />
            )}

            <DashboardFilters 
              data={originalData} 
              onFiltersChange={(newFilters) => {
                setExternalSelectedUsers(undefined);
                updateFiltersWithAnalytics(newFilters);
              }}
              externalSelectedUsers={externalSelectedUsers}
            />

            {isSingleUserSelected && settings.chartVisibility.userProfileCard && (
              <UserProfileCard 
                data={singleUserData} 
                userName={filters.selectedUsers![0]} 
              />
            )}

            <div data-export="dashboard-charts">
              <DashboardCharts 
                data={filteredData} 
                originalData={originalData} 
                baseFilteredData={baseFilteredData} 
                aggregationPeriod={filters.aggregationPeriod}
                selectedUsers={filters.selectedUsers}
              />
            </div>
          </div>
        )}
      </div>
      <UserCompareDialog
        allData={originalData}
        open={compareOpen}
        onOpenChange={setCompareOpen}
      />
      <PrivacyFooter />
    </div>
    </FilterByUserProvider>
  );
};

export default Index;
