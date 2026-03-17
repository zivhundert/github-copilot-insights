
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { ExampleShowcase } from '@/components/dashboard/ExampleShowcase';
import { PrivacyFooter } from '@/components/common/PrivacyFooter';
import { useDashboardData } from '@/hooks/useDashboardData';
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
    updateFilters,
    handleReloadCSV,
    filters
  } = useDashboardData();

  const handleFileUploadWithAnalytics = (data: any) => {
    handleFileUpload(data);
    analytics.trackFileUpload(data.length);
  };

  const handleReloadCSVWithAnalytics = () => {
    handleReloadCSV();
    analytics.trackCsvReload();
  };

  const updateFiltersWithAnalytics = (newFilters: any) => {
    updateFilters(newFilters);
    Object.keys(newFilters).forEach(filterKey => {
      analytics.trackFilterUsage(filterKey);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8" data-export="dashboard-main">
        <DashboardHeader 
          showReloadButton={originalData.length > 0} 
          onReloadCSV={handleReloadCSVWithAnalytics}
          showExportButton={originalData.length > 0}
          showSettingsButton={originalData.length > 0}
        />
        
        {originalData.length === 0 && (
          <div className="mt-12">
            <ExampleShowcase />
            <div data-upload-section>
              <FileUpload onFileUpload={handleFileUploadWithAnalytics} isLoading={isLoading} />
            </div>
          </div>
        )}
        
        {originalData.length > 0 && (
          <div className="mt-8 space-y-8">
            <DashboardMetrics 
              data={filteredData} 
              originalData={originalData} 
              baseFilteredData={baseFilteredData} 
            />
            <DashboardFilters 
              data={originalData} 
              onFiltersChange={updateFiltersWithAnalytics} 
            />
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
