import { useState, useRef } from "react";
import { bytesToSize } from "@/lib/utils";

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUpload = ({ file, onFileChange }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileDialogOpen = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  
  const validateAndSetFile = (selectedFile: File) => {
    // Check if the file is a PDF
    if (selectedFile.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }
    
    onFileChange(selectedFile);
  };
  
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-md font-medium text-gray-700 mb-2"><span className="font-bold">Step 1:</span> Upload Your Document</h3>
      
      <div 
        className={`mt-2 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition cursor-pointer ${
          isDragging ? 'bg-gray-100 border-primary-300' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
        }`}
        onClick={handleFileDialogOpen}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".pdf" 
          className="hidden" 
          onChange={handleFileSelected}
        />
        
        {!file ? (
          <div className="text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Drag and drop your PDF here, or click to browse</p>
            <p className="mt-1 text-xs text-gray-500">Maximum file size: 10MB</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-red-500 mr-3" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{bytesToSize(file.size)}</p>
                </div>
              </div>
              <button 
                type="button" 
                className="text-gray-500 hover:text-gray-700"
                onClick={handleRemoveFile}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
