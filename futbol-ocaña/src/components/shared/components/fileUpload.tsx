//fileUpload.tsx
import React, { useState, useRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  type: 'photo' | 'document' | 'registro';
  label: string;
  accept: string;
  maxSize: string;
  onFileSelect: (file: File | null) => void;
  currentFile?: File | null;
  currentUrl?: string | null;
  error?: string;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  type,
  label,
  accept,
  maxSize,
  onFileSelect,
  currentFile,
  currentUrl,
  error,
  required = false
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (currentFile && type === 'photo') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(currentFile);
    } else if (currentUrl && type === 'photo') {
      setPreview(currentUrl);
    } else {
      setPreview(null);
    }
  }, [currentFile, currentUrl, type]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validar tipo de archivo
    const allowedTypes = accept.split(',').map(t => t.trim());
    if (!allowedTypes.includes(file.type)) {
      alert(`Tipo de archivo no válido. Se permiten: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validar tamaño
    const maxSizeBytes = parseFloat(maxSize) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`El archivo es muy grande. Tamaño máximo: ${maxSize}MB`);
      return;
    }

    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    switch (type) {
      case 'photo':
        return '📷';
      case 'document':
        return '📄';
      case 'registro':
        return '📋';
      default:
        return '📁';
    }
  };

  const getFileName = () => {
    if (currentFile) {
      return currentFile.name;
    }
    if (currentUrl) {
      return 'Archivo actual';
    }
    return null;
  };

  return (
    <div className="file-upload-container">
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      
      <div
        className={`file-upload-area ${dragOver ? 'drag-over' : ''} ${error ? 'error' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {currentFile || currentUrl ? (
          <div className="file-selected">
            {type === 'photo' && preview ? (
              <div className="photo-preview">
                <img src={preview} alt="Vista previa" className="preview-image" />
                <div className="file-info">
                  <span className="file-name">{getFileName()}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger remove-file"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    ✕ Quitar
                  </button>
                </div>
              </div>
            ) : (
              <div className="file-info">
                <div className="file-icon">{getFileIcon()}</div>
                <span className="file-name">{getFileName()}</span>
                <button
                    type="button"
                    className="btn btn-sm btn-danger remove-file"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    ✕ Quitar
                  </button>
              </div>
            )}
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">{getFileIcon()}</div>
            <div className="upload-text">
              <strong>Haz clic para seleccionar</strong> o arrastra y suelta
            </div>
            <div className="upload-hint">
              Máximo {maxSize}MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="text-danger small mt-1">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;