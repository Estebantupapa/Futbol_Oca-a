export const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    console.log('🔗 URL original:', url);
    
    // Si ya es una URL directa de imagen, devolver tal cual
    if (url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
      return url;
    }
    
    const fileId = getGoogleDriveFileId(url);
    if (!fileId) {
      console.warn('⚠️ No se pudo extraer File ID, devolviendo URL original');
      return url;
    }
    
    // Usar formato de view con proxy por defecto
    const convertedUrl = getGoogleDriveUrlWithProxy(url);
    console.log('🔄 URL convertida:', convertedUrl);
    return convertedUrl;
    
  } catch (error) {
    console.error('❌ Error convirtiendo URL de Google Drive:', error);
    return url;
  }
};

export const getGoogleDriveFileId = (url: string): string | null => {
  if (!url) return null;
  
  try {
    console.log('🔍 Extrayendo File ID de:', url);
    
    // Formato: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    if (url.includes('/file/d/') && url.includes('/view')) {
      const match = url.match(/\/file\/d\/([^\/]+)/);
      if (match && match[1]) {
        console.log('✅ File ID extraído (formato /file/d/):', match[1]);
        return match[1];
      }
    }
    
    // Formato: https://drive.google.com/open?id=FILE_ID
    if (url.includes('open?id=')) {
      const fileId = url.split('open?id=')[1]?.split('&')[0];
      if (fileId) {
        console.log('✅ File ID extraído (formato open?id=):', fileId);
        return fileId;
      }
    }
    
    // Formato: https://drive.google.com/uc?export=view&id=FILE_ID
    if (url.includes('uc?export=view&id=')) {
      const fileId = url.split('uc?export=view&id=')[1]?.split('&')[0];
      if (fileId) {
        console.log('✅ File ID extraído (formato uc?export=view):', fileId);
        return fileId;
      }
    }
    
    // Formato: https://drive.google.com/uc?export=download&id=FILE_ID
    if (url.includes('uc?export=download&id=')) {
      const fileId = url.split('uc?export=download&id=')[1]?.split('&')[0];
      if (fileId) {
        console.log('✅ File ID extraído (formato uc?export=download):', fileId);
        return fileId;
      }
    }
    
    console.warn('❌ No se pudo extraer File ID - formato no reconocido');
    return null;
  } catch (error) {
    console.error('Error extrayendo file ID:', error);
    return null;
  }
};

export const getGoogleDriveImageUrls = (url: string): string[] => {
  if (!url) return [];
  
  console.log('🔍 Analizando URL:', url);
  
  // Detectar si es URL de carpeta
  if (url.includes('/folders/')) {
    console.warn('⚠️ URL de carpeta detectada. Necesita URL de archivo específico.');
    return [];
  }
  
  const fileId = getGoogleDriveFileId(url);
  if (!fileId) {
    console.warn('⚠️ No se pudo extraer File ID');
    return [url];
  }
  
  console.log('✅ File ID extraído:', fileId);
  
  // Generar múltiples formatos para probar, incluyendo proxy para CORS
  const urls = [
    // URLs con proxy (para evitar CORS)
    `https://corsproxy.io/?${encodeURIComponent(`https://drive.google.com/uc?export=view&id=${fileId}`)}`,
    `https://corsproxy.io/?${encodeURIComponent(`https://drive.google.com/uc?export=download&id=${fileId}`)}`,
    `https://corsproxy.io/?${encodeURIComponent(`https://lh3.googleusercontent.com/d/${fileId}=s500`)}`,
    
    // URLs directas (pueden fallar por CORS pero son más rápidas)
    `https://drive.google.com/uc?export=view&id=${fileId}`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}=s1000`,
    `https://lh3.googleusercontent.com/d/${fileId}=s500`,
    `https://docs.google.com/uc?id=${fileId}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w500`,
    
    // URL original
    url
  ];
  
  console.log('🖼️ URLs generadas:', urls);
  return urls;
};

export const getGoogleDriveUrlType = (url: string): 'file' | 'folder' | 'unknown' => {
  if (url.includes('/file/d/') || url.includes('open?id=') || 
      url.includes('uc?export=view&id=') || url.includes('uc?export=download&id=')) {
    return 'file';
  }
  if (url.includes('/folders/')) {
    return 'folder';
  }
  return 'unknown';
};

export const isGoogleDriveUrl = (url: string): boolean => {
  return url.includes('drive.google.com');
};

// Función para obtener URL con proxy (solución CORS)
export const getGoogleDriveUrlWithProxy = (url: string): string => {
  const fileId = getGoogleDriveFileId(url);
  if (!fileId) {
    console.warn('⚠️ No se pudo extraer File ID para proxy, usando URL original');
    return url;
  }
  
  // Usar proxy para evitar CORS
  const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(directUrl)}`;
  
  console.log('🔧 URL con proxy:', proxyUrl);
  return proxyUrl;
};

// Función para obtener URL directa (sin proxy)
export const getGoogleDriveDirectUrl = (url: string): string => {
  const fileId = getGoogleDriveFileId(url);
  if (!fileId) return url;
  
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

// Interface para el resultado del diagnóstico
interface DiagnosticResult {
  isValid: boolean;
  fileId: string | null;
  error: string;
  suggestions: string[];
  urlType: 'file' | 'folder' | 'unknown';
}

// Función de diagnóstico mejorada
export const diagnoseGoogleDriveUrl = async (url: string): Promise<DiagnosticResult> => {
  const result: DiagnosticResult = {
    isValid: false,
    fileId: null,
    error: '',
    suggestions: [],
    urlType: getGoogleDriveUrlType(url)
  };

  try {
    result.fileId = getGoogleDriveFileId(url);

    if (!result.fileId) {
      result.error = 'No se pudo extraer el File ID de la URL';
      result.suggestions.push('Verifica que la URL sea de Google Drive válida');
      result.suggestions.push('Formato esperado: https://drive.google.com/file/d/FILE_ID/view');
      return result;
    }

    if (result.urlType === 'folder') {
      result.error = 'URL de carpeta detectada - necesita URL de archivo específico';
      result.suggestions.push('Abre la carpeta y haz click en el archivo específico');
      result.suggestions.push('Haz click en "Obtener enlace" para el archivo individual');
      return result;
    }

    // Probar diferentes endpoints (usando proxy para evitar CORS)
    const testUrls = [
      `https://corsproxy.io/?${encodeURIComponent(`https://drive.google.com/uc?export=view&id=${result.fileId}`)}`,
      `https://corsproxy.io/?${encodeURIComponent(`https://drive.google.com/uc?export=download&id=${result.fileId}`)}`,
      `https://corsproxy.io/?${encodeURIComponent(`https://lh3.googleusercontent.com/d/${result.fileId}=s500`)}`,
      `https://drive.google.com/uc?export=view&id=${result.fileId}`,
      `https://drive.google.com/uc?export=download&id=${result.fileId}`
    ];

    let workingUrl = '';
    
    for (const testUrl of testUrls) {
      try {
        console.log(`🔍 Probando URL: ${testUrl}`);
        const response = await fetch(testUrl, { method: 'HEAD' });
        if (response.ok) {
          workingUrl = testUrl;
          console.log(`✅ URL funcional: ${testUrl}`);
          break;
        } else {
          console.log(`❌ URL falló (${response.status}): ${testUrl}`);
        }
      } catch (error) {
        console.log(`❌ Error en URL: ${testUrl}`, error);
      }
    }

    if (workingUrl) {
      result.isValid = true;
      result.suggestions.push(`URL funcional encontrada: ${workingUrl}`);
      result.suggestions.push('El archivo es accesible pero puede tener problemas de CORS');
      result.suggestions.push('Se recomienda usar el proxy para cargar en la aplicación');
    } else {
      result.error = 'Ninguna URL funcionó. El archivo probablemente no es público o tiene problemas de CORS.';
      result.suggestions.push('Haz público el archivo en Google Drive');
      result.suggestions.push('Verifica que el archivo exista');
      result.suggestions.push('Asegúrate de que sea una imagen válida');
      result.suggestions.push('Puede ser un problema de CORS - la aplicación usa proxy como solución');
    }

  } catch (error) {
    result.error = `Error en diagnóstico: ${error}`;
  }

  return result;
};

// Función para verificar si una URL es accesible
export const testUrlAccessibility = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.log(`❌ URL no accesible: ${url}`, error);
    return false;
  }
};