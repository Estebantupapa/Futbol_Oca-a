import { useState, useCallback } from 'react';
import { uploadPlayerFiles, PlayerFiles } from '../../../../services/supabaseClient';

export interface DocumentViewerState {
  isOpen: boolean;
  url: string;
  filename: string;
}

export const useFileUpload = () => {
  const [files, setFiles] = useState<PlayerFiles>({});
  const [fileErrors, setFileErrors] = useState<{[key: string]: string}>({});
  const [isUploading, setIsUploading] = useState(false);
  const [documentViewer, setDocumentViewer] = useState<DocumentViewerState>({
    isOpen: false,
    url: '',
    filename: ''
  });

  const handleFileSelect = useCallback((fileType: keyof PlayerFiles, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
    
    // Limpiar error si se selecciona un archivo válido
    if (file && fileErrors[fileType]) {
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fileType];
        return newErrors;
      });
    }
  }, [fileErrors]);

  const openDocument = useCallback((url: string, filename: string) => {
    setDocumentViewer({
      isOpen: true,
      url,
      filename
    });
  }, []);

  const closeDocument = useCallback(() => {
    setDocumentViewer({
      isOpen: false,
      url: '',
      filename: ''
    });
  }, []);

  const uploadFiles = useCallback(async (documento: string) => {
    setIsUploading(true);
    setFileErrors({});
    
    try {
      const uploadResults = await uploadPlayerFiles(files, documento);
      
      if (uploadResults.errors.length > 0) {
        const errors: {[key: string]: string} = {};
        uploadResults.errors.forEach(error => {
          if (error.includes('Foto de perfil')) errors.foto_perfil = error;
          if (error.includes('Documento PDF')) errors.documento_pdf = error;
          if (error.includes('Registro civil')) errors.registro_civil = error;
        });
        setFileErrors(errors);
        return null;
      }
      
      return uploadResults;
    } catch (error: any) {
      setFileErrors({ general: error.message });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [files]);

  const resetFiles = useCallback(() => {
    setFiles({});
    setFileErrors({});
  }, []);

  return {
    files,
    fileErrors,
    isUploading,
    documentViewer,
    handleFileSelect,
    openDocument,
    closeDocument,
    uploadFiles,
    resetFiles
  };
};