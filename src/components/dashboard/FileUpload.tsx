
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload = ({ onFileUpload, isLoading }: FileUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/x-ndjson': ['.ndjson'],
      'application/json': ['.json'],
    },
    multiple: false,
  });

  return (
    <Card className="max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`p-12 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Upload GitHub Copilot Data</h3>
            <p className="text-muted-foreground mb-4">
              {isDragActive
                ? 'Drop your NDJSON file here...'
                : 'Drag and drop your GitHub Copilot admin export (.ndjson or .json), or click to browse'}
            </p>
            <Button 
              variant="outline" 
              disabled={isLoading}
              className="border-blue-200 hover:border-blue-400"
            >
              {isLoading ? 'Processing...' : 'Choose File'}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            <a 
              href="https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/exporting-membership-information-for-your-enterprise" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Learn how to export your Copilot usage data
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </Card>
  );
};
