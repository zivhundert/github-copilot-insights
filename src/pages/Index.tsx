
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { ExampleShowcase } from '@/components/dashboard/ExampleShowcase';
import { UserProfileCard } from '@/components/dashboard/UserProfileCard';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { PrivacyFooter } from '@/components/common/PrivacyFooter';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useSettings } from '@/contexts/SettingsContext';
import { analytics } from '@/services/analytics';
import { Settings } from 'lucide-react';

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
    fetchFromGitHub,
    apiConfigured,
    updateFilters,
    handleReloadCSV,
    filters
  } = useDashboardData();

  const { settings } = useSettings();

  const handleFileUploadWithAnalytics = (data: any) => {
    handleFileUpload(data);
    analytics.trackFileUpload(data.length);
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

  const isSingleUserSelected = filters.selectedUsers && filters.selectedUsers.length === 1;
  const singleUserData = isSingleUserSelected
    ? filteredData.filter(r => r.user_login === filters.selectedUsers![0])
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8" data-export="dashboard-main">
        <DashboardHeader 
          showReloadButton={originalData.length > 0} 
          onReloadCSV={apiConfigured ? handleRefreshFromGitHub : handleReloadCSVWithAnalytics}
          showExportButton={originalData.length > 0}
          showSettingsButton={originalData.length > 0}
          reloadLabel={apiConfigured ? 'Refresh from GitHub' : undefined}
        />
        
        {originalData.length === 0 && (
          <div className="mt-12">
            {isLoading && apiConfigured ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground text-lg">Fetching Copilot data from GitHub Enterprise…</p>
              </div>
            ) : (
              <>
                <ExampleShowcase />
                <div data-upload-section>
                  <FileUpload onFileUpload={handleFileUploadWithAnalytics} isLoading={isLoading} />
                </div>
              </>
            )}
          </div>
        )}
        
        {originalData.length > 0 && (
          <div className="mt-8 space-y-8">
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
              onFiltersChange={updateFiltersWithAnalytics} 
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
      <PrivacyFooter />
    </div>
  );
};

export default Index;
