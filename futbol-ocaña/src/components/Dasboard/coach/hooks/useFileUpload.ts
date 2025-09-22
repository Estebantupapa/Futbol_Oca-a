// useFileUpload.ts
import { useState } from 'react';
import { PlayerFiles } from '../../../../services/supabaseClient';
import { 
  uploadProfilePhoto, 
  uploadDocumentPDF, 
  uploadRegistroCivilPDF 
} from '../../../../services/supabaseClient';

// Define un tipo para el progreso de upload
export type UploadProgress = {
  [key in keyof PlayerFiles]: number;
};

export const useFileUpload = () => {
  const [files, setFiles] = useState<PlayerFiles>({
    foto_perfil: null,
    documento_pdf: null,
    registro_civil: null
  });

  const [fileErrors, setFileErrors] = useState<{[key in keyof PlayerFiles]?: string} & {general?: string}>({});
  const [isUploading, setIsUploading] = useState(false);
  
  // Estado inicial con valores numéricos garantizados
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    foto_perfil: 0,
    documento_pdf: 0,
    registro_civil: 0
  });

  const [documentViewer, setDocumentViewer] = useState({
    isOpen: false,
    url: '',
    filename: ''
  });

  const handleFileSelect = (fileType: keyof PlayerFiles, file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: file
    }));

    // Limpiar error específico si se selecciona un archivo
    if (file && fileErrors[fileType]) {
      setFileErrors(prev => ({
        ...prev,
        [fileType]: undefined
      }));
    }
  };

  const validateFiles = (): boolean => {
    const errors: {[key in keyof PlayerFiles]?: string} & {general?: string} = {};

    // Validar que al menos la foto de perfil esté presente
    if (!files.foto_perfil) {
      errors.foto_perfil = 'La foto de perfil es obligatoria';
    }

    setFileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadFiles = async (documento: string): Promise<{[key in keyof PlayerFiles]?: string} | null> => {
    if (!validateFiles()) {
      return null;
    }

    setIsUploading(true);
    const results: {[key in keyof PlayerFiles]?: string} = {};

    try {
      for (const [fileType, file] of Object.entries(files)) {
        const key = fileType as keyof PlayerFiles;
        
        if (file) {
          // Resetear progreso para este archivo
          setUploadProgress(prev => ({ ...prev, [key]: 0 }));
          
          // Lógica real de upload a Supabase Storage
          let uploadResult;
          
          switch (key) {
            case 'foto_perfil':
              uploadResult = await uploadProfilePhoto(file, documento);
              break;
            case 'documento_pdf':
              uploadResult = await uploadDocumentPDF(file, documento);
              break;
            case 'registro_civil':
              uploadResult = await uploadRegistroCivilPDF(file, documento);
              break;
          }
          
          if (uploadResult && uploadResult.success) {
            results[key] = uploadResult.url!;
            // Completar progreso
            setUploadProgress(prev => ({ ...prev, [key]: 100 }));
          } else {
            setFileErrors({
              general: `Error subiendo ${key}: ${uploadResult?.error || 'Error desconocido'}`
            });
            return null;
          }
        }
      }

      return results;
    } catch (error: any) {
      setFileErrors({
        general: `Error subiendo archivos: ${error.message || 'Error desconocido'}`
      });
      return null;
    } finally {
      setIsUploading(false);
      // Resetear progresos después de un breve delay
      setTimeout(() => {
        setUploadProgress({
          foto_perfil: 0,
          documento_pdf: 0,
          registro_civil: 0
        });
      }, 1000);
    }
  };

  const resetFiles = () => {
    setFiles({
      foto_perfil: null,
      documento_pdf: null,
      registro_civil: null
    });
    setFileErrors({});
  };

  const openDocument = (url: string, filename: string) => {
    setDocumentViewer({
      isOpen: true,
      url,
      filename
    });
  };

  const closeDocument = () => {
    setDocumentViewer({
      isOpen: false,
      url: '',
      filename: ''
    });
  };

  return {
    files,
    fileErrors,
    isUploading,
    uploadProgress,
    documentViewer,
    handleFileSelect,
    uploadFiles,
    resetFiles,
    openDocument,
    closeDocument
  };
};