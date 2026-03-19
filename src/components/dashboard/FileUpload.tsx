import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, ExternalLink } from 'lucide-react';
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
    <div className="max-w-lg mx-auto">
      <div
        {...getRootProps()}
        className={`p-10 border border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-foreground/40 bg-muted/50'
            : 'border-border hover:border-foreground/30 hover:bg-muted/30'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          <Upload className="w-6 h-6 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragActive ? 'Drop your file here' : 'Drop your .ndjson file here, or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              GitHub Copilot admin export (.ndjson or .json)
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Choose File'}
          </Button>
        </div>
      </div>
      <p className="text-center mt-3">
        <a
          href="https://docs.github.com/en/enterprise-cloud@latest/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/exporting-membership-information-for-your-enterprise"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Learn how to export your data
          <ExternalLink className="w-3 h-3" />
        </a>
      </p>
    </div>
  );
};
