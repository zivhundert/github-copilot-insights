
import { useState, useEffect } from 'react';
import { CopilotDataRow } from '@/pages/Index';
import { parseNDJSONFile, parseMultipleNDJSONFiles, mergeDataRows } from '@/utils/ndjsonParser';
import { toast } from '@/hooks/use-toast';
import { isGitHubApiConfigured, fetchCopilotMetrics } from '@/services/githubApi';
import { saveDataToStorage, loadDataFromStorage, clearDataStorage } from '@/utils/dataStorage';

export const useFileUpload = () => {
  const [data, setData] = useState<CopilotDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiConfigured = isGitHubApiConfigured();

  // Restore saved data from localStorage on mount
  useEffect(() => {
    if (!apiConfigured) {
      const saved = loadDataFromStorage();
      if (saved.length > 0) {
        setData(saved);
        toast({
          title: "Saved data restored",
          description: `Loaded ${saved.length.toLocaleString()} rows from previous session`,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    
    try {
      const result = await parseNDJSONFile(file);
      
      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (data.length > 0) {
        // Merge with existing data
        const { merged, newCount, duplicateCount } = mergeDataRows(data, result.data);
        setData(merged);
        saveDataToStorage(merged);
        toast({
          title: "Data merged successfully",
          description: `Added ${newCount.toLocaleString()} new rows${duplicateCount > 0 ? `, ${duplicateCount.toLocaleString()} overlapping rows updated` : ''}. Total: ${merged.length.toLocaleString()} rows`,
        });
      } else {
        setData(result.data);
        saveDataToStorage(result.data);
        toast({
          title: "File uploaded successfully",
          description: `Processed ${result.data.length.toLocaleString()} rows of Copilot usage data`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred while processing the file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiFileUpload = async (files: File[]) => {
    if (files.length === 1) {
      return handleFileUpload(files[0]);
    }

    setIsLoading(true);

    try {
      const result = await parseMultipleNDJSONFiles(files);

      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      // Deduplicate the parsed rows first, then merge with existing
      const { merged: deduped } = mergeDataRows([], result.data);

      if (data.length > 0) {
        const { merged, newCount, duplicateCount } = mergeDataRows(data, deduped);
        setData(merged);
        saveDataToStorage(merged);
        toast({
          title: "Data merged successfully",
          description: `${files.length} files processed. Added ${newCount.toLocaleString()} new rows${duplicateCount > 0 ? `, ${duplicateCount.toLocaleString()} overlapping rows updated` : ''}. Total: ${merged.length.toLocaleString()} rows`,
        });
      } else {
        setData(deduped);
        saveDataToStorage(deduped);
        toast({
          title: "Files uploaded successfully",
          description: `${files.length} files processed. ${deduped.length.toLocaleString()} unique rows loaded`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred while processing the files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFromGitHub = async () => {
    setIsLoading(true);
    try {
      const result = await fetchCopilotMetrics();

      if (result.error) {
        toast({
          title: "GitHub API fetch failed",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (data.length > 0) {
        const { merged, newCount, duplicateCount } = mergeDataRows(data, result.data);
        setData(merged);
        saveDataToStorage(merged);
        toast({
          title: "Data refreshed from GitHub",
          description: `Added ${newCount.toLocaleString()} new rows${duplicateCount > 0 ? `, ${duplicateCount.toLocaleString()} overlapping rows updated` : ''}. Total: ${merged.length.toLocaleString()} rows`,
        });
      } else {
        setData(result.data);
        saveDataToStorage(result.data);
        toast({
          title: "Data loaded from GitHub",
          description: `Fetched ${result.data.length.toLocaleString()} rows of Copilot usage data`,
        });
      }
    } catch (error) {
      toast({
        title: "GitHub API fetch failed",
        description: "An unexpected error occurred while fetching data from GitHub",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch from GitHub API on mount when configured
  useEffect(() => {
    if (apiConfigured && data.length === 0) {
      fetchFromGitHub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetData = () => {
    setData([]);
    clearDataStorage();
  };

  return {
    data,
    isLoading,
    handleFileUpload,
    handleMultiFileUpload,
    fetchFromGitHub,
    apiConfigured,
    resetData
  };
};
