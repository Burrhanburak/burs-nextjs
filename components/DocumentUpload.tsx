'use client';

import { useState, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUploadThing } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RiUploadCloudLine, RiFileTextLine } from "@remixicon/react";

interface DocumentUploadProps {
  onUploadComplete: (url: string, type: string) => void;
}

interface UploadResponse {
  url: string;
  name: string;
  key: string;
  size: number;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [documentType, setDocumentType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("documentUploader", {
    onClientUploadComplete: (res: UploadResponse[] | undefined) => {
      if (!documentType) {
        toast.error('Please select a document type');
        return;
      }

      if (res && res.length > 0) {
        handleUploadComplete(res[0].url);
      }
    },
    onUploadError: (err: Error) => {
      toast.error(`Failed to upload document: ${err.message}`);
    },
  });

  const handleUploadComplete = async (fileUrl: string) => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: fileUrl,
          type: documentType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save document');
      }

      onUploadComplete(fileUrl, documentType);
      setSelectedFile(null);
      toast.success('Document uploaded successfully');
    } catch {
      toast.error('Failed to save document information');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Check file type
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
      const fileType = file.name.substring(file.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(fileType.toLowerCase())) {
        setSelectedFile(file);
      } else {
        toast.error('Only PDF, JPG and PNG files are accepted.');
      }
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!documentType) {
      toast.error('Please select a document type');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    await startUpload([selectedFile]);
  };

  return (
    <div className="space-y-4">
      <Select value={documentType} onValueChange={setDocumentType}>
        <SelectTrigger>
          <SelectValue placeholder="Select document type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="transcript">Transcript</SelectItem>
          <SelectItem value="id_card">ID Card</SelectItem>
          <SelectItem value="student_certificate">Student Certificate</SelectItem>
          <SelectItem value="income_statement">Income Statement</SelectItem>
          <SelectItem value="residence_document">Residence Document</SelectItem>
        </SelectContent>
      </Select>

      <div 
        className={`
          border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 dark:border-gray-700'
          }
          ${selectedFile ? 'bg-green-50 dark:bg-green-950/20 border-green-300' : ''}
          hover:border-gray-400 dark:hover:border-gray-600
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          {selectedFile ? (
            <>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <RiFileTextLine className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-green-600">File selected</p>
              <p className="text-xs text-gray-500">{selectedFile.name}</p>
              <p className="text-xs text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
                <RiUploadCloudLine className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">Upload Document</p>
              <p className="text-xs text-gray-500 max-w-xs">
                Drag and drop your file here or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: PDF, JPG, PNG (Max 4MB)
              </p>
            </>
          )}
        </div>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex justify-end">
        {selectedFile && (
          <>
            <Button 
              variant="outline" 
              onClick={() => setSelectedFile(null)}
              disabled={isUploading}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              disabled={isUploading || !documentType}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : "Upload Document"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 