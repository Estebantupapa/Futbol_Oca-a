//supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from './services/supabase.types'

// Debug: Verificar que las variables se están cargando
console.log('Variables de entorno:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'No definida')

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables faltantes:')
  console.error('URL:', supabaseUrl)
  console.error('Key:', supabaseAnonKey ? 'Existe' : 'No existe')
  throw new Error('Faltan las variables de entorno de Supabase')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Tipos de utilidad basados en los tipos generados
export type Usuario = Database['public']['Tables']['usuarios']['Row'] & {
  escuela?: Database['public']['Tables']['escuelas']['Row'] | null
}
export type UsuarioInsert = Database['public']['Tables']['usuarios']['Insert']
export type UsuarioUpdate = Database['public']['Tables']['usuarios']['Update']

export type Jugador = Database['public']['Tables']['jugadores']['Row'] & {
  categoria?: Database['public']['Tables']['categorias']['Row']
  escuela?: Database['public']['Tables']['escuelas']['Row']
}
export type JugadorInsert = Database['public']['Tables']['jugadores']['Insert']
export type JugadorUpdate = Database['public']['Tables']['jugadores']['Update']

export type Categoria = Database['public']['Tables']['categorias']['Row']
export type Escuela = Database['public']['Tables']['escuelas']['Row']
export type UserRole = Database['public']['Enums']['user_role']

// ===========================================
// TIPOS Y FUNCIONES PARA ARCHIVOS
// ===========================================

// Tipos para archivos
export interface FileUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface PlayerFiles {
  foto_perfil?: File | null;
  documento_pdf?: File | null;
  registro_civil?: File | null;
}

// Función para validar tipos de archivo
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Función para validar tamaño de archivo (en MB)
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Función para generar nombre único de archivo
const generateUniqueFileName = (originalName: string, documento: string, tipo: string): string => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${documento}_${tipo}_${timestamp}.${extension}`;
};

// Función para subir foto de perfil
export const uploadProfilePhoto = async (file: File, documento: string): Promise<FileUploadResult> => {
  try {
    console.log('Uploading profile photo for document:', documento);
    
    // Validaciones
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validateFileType(file, allowedTypes)) {
      return { success: false, error: 'Tipo de archivo no válido. Solo se permiten JPG, PNG y WEBP.' };
    }
    
    if (!validateFileSize(file, 5)) { // 5MB máximo
      return { success: false, error: 'La imagen no puede ser mayor a 5MB.' };
    }
    
    const fileName = generateUniqueFileName(file.name, documento, 'foto');
    const filePath = `fotos_perfil/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('jugadores')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading profile photo:', error);
      return { success: false, error: error.message };
    }
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('jugadores')
      .getPublicUrl(filePath);
    
    console.log('Profile photo uploaded successfully:', urlData.publicUrl);
    return { success: true, url: urlData.publicUrl };
    
  } catch (error: any) {
    console.error('Error in uploadProfilePhoto:', error);
    return { success: false, error: error.message };
  }
};

// Función para subir documento PDF
export const uploadDocumentPDF = async (file: File, documento: string): Promise<FileUploadResult> => {
  try {
    console.log('Uploading document PDF for document:', documento);
    
    // Validaciones
    const allowedTypes = ['application/pdf'];
    if (!validateFileType(file, allowedTypes)) {
      return { success: false, error: 'Solo se permiten archivos PDF.' };
    }
    
    if (!validateFileSize(file, 10)) { // 10MB máximo
      return { success: false, error: 'El PDF no puede ser mayor a 10MB.' };
    }
    
    const fileName = generateUniqueFileName(file.name, documento, 'documento');
    const filePath = `documentos/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('jugadores')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading document PDF:', error);
      return { success: false, error: error.message };
    }
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('jugadores')
      .getPublicUrl(filePath);
    
    console.log('Document PDF uploaded successfully:', urlData.publicUrl);
    return { success: true, url: urlData.publicUrl };
    
  } catch (error: any) {
    console.error('Error in uploadDocumentPDF:', error);
    return { success: false, error: error.message };
  }
};

// Función para subir registro civil PDF
export const uploadRegistroCivilPDF = async (file: File, documento: string): Promise<FileUploadResult> => {
  try {
    console.log('Uploading registro civil PDF for document:', documento);
    
    // Validaciones
    const allowedTypes = ['application/pdf'];
    if (!validateFileType(file, allowedTypes)) {
      return { success: false, error: 'Solo se permiten archivos PDF.' };
    }
    
    if (!validateFileSize(file, 10)) { // 10MB máximo
      return { success: false, error: 'El PDF no puede ser mayor a 10MB.' };
    }
    
    const fileName = generateUniqueFileName(file.name, documento, 'registro_civil');
    const filePath = `registros_civiles/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('jugadores')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading registro civil PDF:', error);
      return { success: false, error: error.message };
    }
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('jugadores')
      .getPublicUrl(filePath);
    
    console.log('Registro civil PDF uploaded successfully:', urlData.publicUrl);
    return { success: true, url: urlData.publicUrl };
    
  } catch (error: any) {
    console.error('Error in uploadRegistroCivilPDF:', error);
    return { success: false, error: error.message };
  }
};

// Función para subir múltiples archivos de un jugador
export const uploadPlayerFiles = async (files: PlayerFiles, documento: string) => {
  const results = {
    foto_perfil_url: null as string | null,
    documento_pdf_url: null as string | null,
    registro_civil_url: null as string | null,
    errors: [] as string[]
  };
  
  try {
    // Subir foto de perfil
    if (files.foto_perfil) {
      const photoResult = await uploadProfilePhoto(files.foto_perfil, documento);
      if (photoResult.success) {
        results.foto_perfil_url = photoResult.url!;
      } else {
        results.errors.push(`Foto de perfil: ${photoResult.error}`);
      }
    }
    
    // Subir documento PDF
    if (files.documento_pdf) {
      const docResult = await uploadDocumentPDF(files.documento_pdf, documento);
      if (docResult.success) {
        results.documento_pdf_url = docResult.url!;
      } else {
        results.errors.push(`Documento PDF: ${docResult.error}`);
      }
    }
    
    // Subir registro civil PDF
    if (files.registro_civil) {
      const registroResult = await uploadRegistroCivilPDF(files.registro_civil, documento);
      if (registroResult.success) {
        results.registro_civil_url = registroResult.url!;
      } else {
        results.errors.push(`Registro civil: ${registroResult.error}`);
      }
    }
    
    return results;
    
  } catch (error: any) {
    results.errors.push(`Error general: ${error.message}`);
    return results;
  }
};

// Función para eliminar archivo del storage
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('jugadores')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};

// Función para extraer el path del archivo desde la URL
export const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const storagePrefix = `${supabaseUrl}/storage/v1/object/public/jugadores/`;
    
    if (url.startsWith(storagePrefix)) {
      return url.replace(storagePrefix, '');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting file path:', error);
    return null;
  }
};

// ===========================================
// FUNCIONES EXISTENTES (SIN CAMBIOS)
// ===========================================

// Helper functions para la autenticación
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getUserProfile = async (): Promise<{
  data: Usuario | null
  error: any
} | null> => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      escuela:escuelas(*)
    `)
    .eq('id', user.id)
    .single()
    
  return { data, error }
}

export const checkUserRole = async (): Promise<UserRole | null> => {
  const profile = await getUserProfile()
  return profile?.data?.rol || null
}

// Función para verificar si el usuario es admin
export const isAdmin = async (): Promise<boolean> => {
  const role = await checkUserRole()
  return role === 'admin'
}

// Función para verificar si el usuario es entrenador
export const isEntrenador = async (): Promise<boolean> => {
  const role = await checkUserRole()
  return role === 'entrenador'
}

// Función para obtener la escuela del usuario
export const getUserEscuela = async () => {
  const profile = await getUserProfile()
  return profile?.data?.escuela || null
}

// Función para obtener todos los jugadores (solo para admins)
export const getAllJugadores = async () => {
  console.log('=== DEBUG GET ALL JUGADORES ===');
  
  try {
    const { data, error } = await supabase
      .from('jugadores')
      .select(`
        *,
        categoria:categorias(*),
        escuela:escuelas(*)
      `)
      .eq('activo', true)
      .order('apellido', { ascending: true });
    
    console.log('getAllJugadores result:', { data, error });
    console.log('Number of players found:', data?.length || 0);
    
    if (error) {
      console.error('Error in getAllJugadores:', error);
    }
    
    console.log('=== END DEBUG GET ALL JUGADORES ===');
    return { data: data as Jugador[] | null, error };
    
  } catch (catchError) {
    console.error('Catch error in getAllJugadores:', catchError);
    return { data: null, error: catchError };
  }
}

// Función para obtener jugadores por escuela (para entrenadores)
export const getJugadoresByEscuela = async (escuelaId: string) => {
  console.log('=== DEBUG GET JUGADORES BY ESCUELA ===');
  console.log('Escuela ID:', escuelaId);
  
  try {
    const { data, error } = await supabase
      .from('jugadores')
      .select(`
        *,
        categoria:categorias(*),
        escuela:escuelas(*)
      `)
      .eq('escuela_id', escuelaId)
      .eq('activo', true)
      .order('apellido', { ascending: true });
    
    console.log('getJugadoresByEscuela result:', { data, error });
    console.log('Number of players found:', data?.length || 0);
    
    if (error) {
      console.error('Error in getJugadoresByEscuela:', error);
    }
    
    console.log('=== END DEBUG GET JUGADORES BY ESCUELA ===');
    return { data: data as Jugador[] | null, error };
    
  } catch (catchError) {
    console.error('Catch error in getJugadoresByEscuela:', catchError);
    return { data: null, error: catchError };
  }
}

// Función para obtener todas las categorías
export const getCategorias = async () => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre', { ascending: true })
  
  return { data, error }
}

// Función para obtener todas las escuelas
export const getEscuelas = async () => {
  const { data, error } = await supabase
    .from('escuelas')
    .select('*')
    .order('nombre', { ascending: true })
  
  return { data, error }
}

// Función para crear un nuevo jugador
export const createJugador = async (jugador: JugadorInsert) => {
  console.log('=== DEBUG CREATE JUGADOR ===');
  console.log('Received jugador data:', jugador);
  
  try {
    console.log('Attempting to insert into jugadores table...');
    
    const { data, error } = await supabase
      .from('jugadores')
      .insert(jugador)
      .select(`
        *,
        categoria:categorias(*),
        escuela:escuelas(*)
      `)
      .single();
    
    console.log('Supabase response data:', data);
    console.log('Supabase response error:', error);
    
    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }
    
    console.log('=== END DEBUG CREATE JUGADOR ===');
    return { data: data as Jugador | null, error };
    
  } catch (catchError) {
    console.error('Catch error in createJugador:', catchError);
    console.log('=== END DEBUG CREATE JUGADOR ===');
    return { data: null, error: catchError };
  }
};

// Función para actualizar un jugador
export const updateJugador = async (id: string, updates: JugadorUpdate) => {
  const { data, error } = await supabase
    .from('jugadores')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      categoria:categorias(*),
      escuela:escuelas(*)
    `)
    .single()
  
  return { data: data as Jugador | null, error }
}

// =====================================
// FUNCIONES DE ELIMINACIÓN MEJORADAS
// =====================================

// Función para desactivar un jugador (eliminación lógica)
export const deactivateJugador = async (id: string) => {
  console.log('=== DEBUG DEACTIVATE JUGADOR ===');
  console.log('Deactivating player with ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('jugadores')
      .update({ 
        activo: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        categoria:categorias(*),
        escuela:escuelas(*)
      `)
      .single();
    
    console.log('Deactivate result:', { data, error });
    console.log('=== END DEBUG DEACTIVATE JUGADOR ===');
    
    return { data: data as Jugador | null, error };
    
  } catch (catchError) {
    console.error('Catch error in deactivateJugador:', catchError);
    console.log('=== END DEBUG DEACTIVATE JUGADOR ===');
    return { data: null, error: catchError };
  }
};

// Función para eliminar físicamente un jugador de la base de datos
export const deleteJugadorPermanently = async (id: string) => {
  console.log('=== DEBUG DELETE JUGADOR PERMANENTLY ===');
  console.log('Permanently deleting player with ID:', id);
  
  try {
    // Primero verificamos si el jugador existe
    const { data: checkData, error: checkError } = await supabase
      .from('jugadores')
      .select('id, nombre, apellido, documento')
      .eq('id', id)
      .single();
    
    console.log('Player check before deletion:', { checkData, checkError });
    
    if (checkError) {
      console.error('Player not found before deletion:', checkError);
      return { data: null, error: checkError };
    }
    
    // Ahora eliminamos el jugador permanentemente
    const { data, error } = await supabase
      .from('jugadores')
      .delete()
      .eq('id', id);
    
    console.log('Delete operation result:', { data, error });
    
    if (error) {
      console.error('Error during deletion:', error);
      return { data: null, error };
    }
    
    // Verificar que realmente se eliminó
    const { data: verifyData, error: verifyError } = await supabase
      .from('jugadores')
      .select('id')
      .eq('id', id)
      .single();
    
    console.log('Verification after deletion:', { verifyData, verifyError });
    
    if (verifyData) {
      console.error('Player still exists after deletion!');
      return { data: null, error: { message: 'El jugador no pudo ser eliminado completamente' } };
    }
    
    console.log('Player successfully deleted from database');
    console.log('=== END DEBUG DELETE JUGADOR PERMANENTLY ===');
    
    // Retornamos los datos del jugador que se eliminó
    return { data: checkData, error: null };
    
  } catch (catchError) {
    console.error('Catch error in deleteJugadorPermanently:', catchError);
    console.log('=== END DEBUG DELETE JUGADOR PERMANENTLY ===');
    return { data: null, error: catchError };
  }
};

// Función principal de eliminación (puedes elegir cuál usar)
export const deleteJugador = async (id: string, permanent: boolean = false) => {
  if (permanent) {
    return await deleteJugadorPermanently(id);
  } else {
    return await deactivateJugador(id);
  }
};

// Función para restaurar un jugador desactivado
export const restoreJugador = async (id: string) => {
  console.log('=== DEBUG RESTORE JUGADOR ===');
  console.log('Restoring player with ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('jugadores')
      .update({ 
        activo: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        categoria:categorias(*),
        escuela:escuelas(*)
      `)
      .single();
    
    console.log('Restore result:', { data, error });
    console.log('=== END DEBUG RESTORE JUGADOR ===');
    
    return { data: data as Jugador | null, error };
    
  } catch (catchError) {
    console.error('Catch error in restoreJugador:', catchError);
    console.log('=== END DEBUG RESTORE JUGADOR ===');
    return { data: null, error: catchError };
  }
};

// Función para obtener jugadores inactivos (para poder restaurarlos)
export const getInactiveJugadores = async (escuelaId?: string) => {
  let query = supabase
    .from('jugadores')
    .select(`
      *,
      categoria:categorias(*),
      escuela:escuelas(*)
    `)
    .eq('activo', false)
    .order('apellido', { ascending: true });
    
  if (escuelaId) {
    query = query.eq('escuela_id', escuelaId);
  }
  
  const { data, error } = await query;
  return { data: data as Jugador[] | null, error };
};

// =====================================
// RESTO DE FUNCIONES (SIN CAMBIOS)
// =====================================

// Función para crear un nuevo usuario (solo admins)
export const createUsuario = async (usuario: UsuarioInsert) => {
  const { data, error } = await supabase
    .from('usuarios')
    .insert(usuario)
    .select(`
      *,
      escuela:escuelas(*)
    `)
    .single()
  
  return { data: data as Usuario | null, error }
}

// Función para actualizar un usuario
export const updateUsuario = async (id: string, updates: UsuarioUpdate) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      escuela:escuelas(*)
    `)
    .single()
  
  return { data: data as Usuario | null, error }
}

// Función para obtener todos los usuarios (solo admins)
export const getAllUsuarios = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      escuela:escuelas(*)
    `)
    .order('nombre', { ascending: true })
  
  return { data: data as Usuario[] | null, error }
}

// Tipos para las nuevas tablas de ubicaciones
export type Pais = {
  id: string;
  nombre: string;
  codigo: string | null;
  created_at: string | null;
}

export type Departamento = {
  id: string;
  nombre: string;
  pais_id: string;
  created_at: string | null;
}

export type Ciudad = {
  id: string;
  nombre: string;
  departamento_id: string;
  created_at: string | null;
}

// Función para obtener todos los países
export const getPaises = async () => {
  console.log('Getting países...');
  const { data, error } = await supabase
    .from('paises')
    .select('*')
    .order('nombre', { ascending: true })
  
  console.log('Países result:', { data, error });
  return { data: data as Pais[] | null, error }
}

// Función para obtener departamentos por país
export const getDepartamentosByPais = async (paisId: string) => {
  console.log('Getting departamentos for país:', paisId);
  const { data, error } = await supabase
    .from('departamentos')
    .select('*')
    .eq('pais_id', paisId)
    .order('nombre', { ascending: true })
  
  console.log('Departamentos result:', { data, error });
  return { data: data as Departamento[] | null, error }
}

// Función para obtener ciudades por departamento
export const getCiudadesByDepartamento = async (departamentoId: string) => {
  console.log('Getting ciudades for departamento:', departamentoId);
  const { data, error } = await supabase
    .from('ciudades')
    .select('*')
    .eq('departamento_id', departamentoId)
    .order('nombre', { ascending: true })
  
  console.log('Ciudades result:', { data, error });
  return { data: data as Ciudad[] | null, error }
}

