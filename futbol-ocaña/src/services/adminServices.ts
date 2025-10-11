import { supabase, /*Usuario,*/ UsuarioInsert, /*Escuela*/ } from './supabaseClient';

// Función para crear un nuevo administrador
export const createAdmin = async (adminData: {
  email: string;
  nombre: string;
  apellido: string;
  password: string;
}) => {
  try {
    // Primero crear el usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');

    // Luego crear el registro en la tabla usuarios
    const usuarioData: UsuarioInsert = {
      id: authData.user.id,
      email: adminData.email,
      nombre: adminData.nombre,
      apellido: adminData.apellido,
      rol: 'admin',
      activo: true
    };

    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuarioData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Función para crear un nuevo entrenador
export const createCoach = async (coachData: {
  email: string;
  nombre: string;
  apellido: string;
  password: string;
  escuela_id: string;
}) => {
  try {
    // Primero crear el usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: coachData.email,
      password: coachData.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');

    // Luego crear el registro en la tabla usuarios
    const usuarioData: UsuarioInsert = {
      id: authData.user.id,
      email: coachData.email,
      nombre: coachData.nombre,
      apellido: coachData.apellido,
      rol: 'entrenador',
      escuela_id: coachData.escuela_id,
      activo: true
    };

    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuarioData)
      .select(`
        *,
        escuela:escuelas(*)
      `)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Función para crear una nueva escuela
export const createSchool = async (schoolData: {
  nombre: string;
}) => {
  try {
    const escuelaData = {
      nombre: schoolData.nombre
    };

    const { data, error } = await supabase
      .from('escuelas')
      .insert(escuelaData)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Función para obtener todos los usuarios (admins y coaches)
export const getAllUsuarios = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      escuela:escuelas(*)
    `)
    .order('nombre', { ascending: true });

  return { data, error };
};

// Función para obtener estadísticas generales
export const getAdminStats = async () => {
  try {
    const [
      { data: jugadores, error: jugadoresError },
      { data: escuelas, error: escuelasError },
      { data: usuarios, error: usuariosError },
      { data: categorias, error: categoriasError }
    ] = await Promise.all([
      supabase.from('jugadores').select('id').eq('activo', true),
      supabase.from('escuelas').select('id'),
      supabase.from('usuarios').select('id, rol').eq('activo', true),
      supabase.from('categorias').select('id')
    ]);

    if (jugadoresError || escuelasError || usuariosError || categoriasError) {
      throw new Error('Error obteniendo estadísticas');
    }

    const admins = usuarios?.filter(u => u.rol === 'admin').length || 0;
    const coaches = usuarios?.filter(u => u.rol === 'entrenador').length || 0;

    return {
      totalJugadores: jugadores?.length || 0,
      totalEscuelas: escuelas?.length || 0,
      totalAdmins: admins,
      totalCoaches: coaches,
      totalCategorias: categorias?.length || 0
    };
  } catch (error: any) {
    console.error('Error getting admin stats:', error);
    return { 
      totalJugadores: 0,
      totalEscuelas: 0,
      totalAdmins: 0,
      totalCoaches: 0,
      totalCategorias: 0,
      error: error.message 
    };
  }
};