//supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from './services/supabase.types'

// Debug: Verificar que las variables se están cargando
console.log('Variables de entorno:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Definida' : 'No definida')
console.log('Todas las variables VITE_:', import.meta.env)

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
  const { data, error } = await supabase
    .from('jugadores')
    .select(`
      *,
      categoria:categorias(*),
      escuela:escuelas(*)
    `)
    .eq('activo', true)
    .order('apellido', { ascending: true })
  
  return { data: data as Jugador[] | null, error }
}

// Función para obtener jugadores por escuela (para entrenadores)
export const getJugadoresByEscuela = async (escuelaId: string) => {
  const { data, error } = await supabase
    .from('jugadores')
    .select(`
      *,
      categoria:categorias(*),
      escuela:escuelas(*)
    `)
    .eq('escuela_id', escuelaId)
    .eq('activo', true)
    .order('apellido', { ascending: true })
  
  return { data: data as Jugador[] | null, error }
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
  const { data, error } = await supabase
    .from('jugadores')
    .insert(jugador)
    .select(`
      *,
      categoria:categorias(*),
      escuela:escuelas(*)
    `)
    .single()
  
  return { data: data as Jugador | null, error }
}

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

// Función para eliminar (desactivar) un jugador
export const deleteJugador = async (id: string) => {
  const { data, error } = await supabase
    .from('jugadores')
    .update({ activo: false })
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

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