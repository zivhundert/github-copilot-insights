
import { useState } from 'react';
import { CopilotDataRow } from '@/pages/Index';
import { parseNDJSONFile } from '@/utils/ndjsonParser';
import { toast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [data, setData] = useState<CopilotDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const resetData = () => {
    setData([]);
  };

  return {
    data,
    isLoading,
    handleFileUpload,
    resetData
  };
};
