// fileUpload.tsx
import React, { useState, useRef } from 'react';
import './FileUpload.css';
import { PlayerFiles } from '../../../services/supabaseClient';

interface FileUploadProps {
  type: keyof PlayerFiles;
  label: string;
  accept: string;
  maxSize: string;
  onFileSelect: (fileType: keyof PlayerFiles, file: File | null) => void;
  currentFile?: File | null;
  currentUrl?: string | null;
  error?: string;
  required?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
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
  required = false,
  isUploading = false,
  uploadProgress = 0
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (currentFile && type === 'foto_perfil') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(currentFile);
      setIsUploaded(true);
    } else if (currentUrl && type === 'foto_perfil') {
      setPreview(currentUrl);
      setIsUploaded(true);
    } else {
      setPreview(null);
      setIsUploaded(false);
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

    onFileSelect(type, file);
    setIsUploaded(true);
  };

  const handleRemoveFile = () => {
    onFileSelect(type, null);
    setIsUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    switch (type) {
      case 'foto_perfil':
        return '📷';
      case 'documento_pdf':
        return '📄';
      case 'registro_civil':
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
        className={`file-upload-area ${dragOver ? 'drag-over' : ''} ${error ? 'error' : ''} ${isUploaded ? 'uploaded' : ''} ${isUploading ? 'uploading' : ''}`}
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
            {type === 'foto_perfil' && preview ? (
              <div className="photo-preview">
                <img src={preview} alt="Vista previa" className="preview-image" />
                <div className="file-info">
                  <span className="file-name">{getFileName()}</span>
                  <div className="upload-status">
                    <span className="upload-badge">✅ Subido</span>
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
              </div>
            ) : (
              <div className="file-info">
                <div className="file-icon">{getFileIcon()}</div>
                <div className="file-details">
                  <span className="file-name">{getFileName()}</span>
                  <span className="upload-badge">✅ Subido</span>
                </div>
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

        {isUploading && (
          <div className="upload-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
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