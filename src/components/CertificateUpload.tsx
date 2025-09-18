import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CertificateUploadProps {
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  onRemoveFile: () => void;
}

export const CertificateUpload = ({ onFileUpload, uploadedFile, onRemoveFile }: CertificateUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.pdf']
    },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  if (uploadedFile) {
    return (
      <Card className="p-6 bg-verification-card border-verification-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileImage className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium text-foreground">{uploadedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveFile}
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-verification-card border-verification-border border-2 border-dashed">
      <div
        {...getRootProps()}
        className={`text-center cursor-pointer transition-colors ${
          isDragActive || dragActive
            ? 'border-primary bg-primary/5'
            : 'hover:border-primary/50 hover:bg-primary/5'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload Certificate Image
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your certificate image here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: JPEG, PNG, PDF • Max size: 10MB
            </p>
          </div>
          <Button variant="outline" className="mt-4">
            Select File
          </Button>
        </div>
      </div>
    </Card>
  );
};