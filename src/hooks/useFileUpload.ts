
import { useState, useEffect } from 'react';
import { CopilotDataRow } from '@/pages/Index';
import { parseNDJSONFile } from '@/utils/ndjsonParser';
import { toast } from '@/hooks/use-toast';
import { isGitHubApiConfigured, fetchCopilotMetrics } from '@/services/githubApi';

export const useFileUpload = () => {
  const [data, setData] = useState<CopilotDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiConfigured = isGitHubApiConfigured();

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

      setData(result.data);
      toast({
        title: "File uploaded successfully",
        description: `Processed ${result.data.length} rows of Copilot usage data`,
      });
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

      setData(result.data);
      toast({
        title: "Data loaded from GitHub",
        description: `Fetched ${result.data.length} rows of Copilot usage data`,
      });
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
  };

  return {
    data,
    isLoading,
    handleFileUpload,
    fetchFromGitHub,
    apiConfigured,
    resetData
  };
};
