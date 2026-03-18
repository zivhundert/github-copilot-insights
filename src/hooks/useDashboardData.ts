
import { useFileUpload } from './useFileUpload';
import { useDataFiltering } from './useDataFiltering';

export const useDashboardData = () => {
  const fileUpload = useFileUpload();
  const dataFiltering = useDataFiltering(fileUpload.data);

  const handleReloadCSV = () => {
    fileUpload.resetData();
    dataFiltering.resetFilters();
  };

  return {
    originalData: fileUpload.data,
    isLoading: fileUpload.isLoading,
    handleFileUpload: fileUpload.handleFileUpload,
    fetchFromGitHub: fileUpload.fetchFromGitHub,
    apiConfigured: fileUpload.apiConfigured,
    filteredData: dataFiltering.filteredData,
    baseFilteredData: dataFiltering.baseFilteredData,
    filters: dataFiltering.filters,
    updateFilters: dataFiltering.updateFilters,
    handleReloadCSV
  };
};
