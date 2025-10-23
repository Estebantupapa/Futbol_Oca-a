import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dasboard/coach/Dashboard';
import AdminDashboard from './components/Dasboard/admin/AdminDashboard';
import { supabase } from './services/supabaseClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'entrenador';
  activo: boolean | null;
  escuela_id: string | null;
  created_at: string | null;
}

function App() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // ✅ Función optimizada para verificar sesión
  const checkSession = useCallback(async () => {
    try {
      console.log('🔍 Verificando sesión...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error obteniendo sesión:', sessionError);
        setUser(null);
        return;
      }

      if (session?.user) {
        console.log('👤 Usuario encontrado en sesión:', session.user.email);
        
        // Obtener perfil del usuario con timeout
        const profilePromise = supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout obteniendo perfil')), 10000)
        );

        try {
          const { data: profile, error: profileError } = await Promise.race([profilePromise, timeoutPromise]) as any;
          
          if (profileError) {
            console.error('Error obteniendo perfil:', profileError);
            setUser(null);
          } else if (profile) {
            console.log('✅ Perfil cargado:', profile.nombre);
            setUser(profile as Usuario);
          } else {
            setUser(null);
          }
        } catch (timeoutError) {
          console.error('Timeout obteniendo perfil:', timeoutError);
          setUser(null);
        }
      } else {
        console.log('❌ No hay sesión activa');
        setUser(null);
      }
    } catch (error) {
      console.error('💥 Error crítico en checkSession:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!mounted) return;

      await checkSession();

      // ✅ Suscripción optimizada a cambios de auth
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;

          console.log('🔄 Cambio de estado de auth:', event);
          
          switch (event) {
            case 'SIGNED_IN':
              if (session?.user) {
                await checkSession();
              }
              break;
              
            case 'SIGNED_OUT':
              setUser(null);
              setLoading(false);
              break;
              
            case 'TOKEN_REFRESHED':
              // No hacer nada, ya está autenticado
              break;
              
            default:
              console.log('Evento de auth no manejado:', event);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [checkSession]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error durante logout:', error);
    }
  }, []);

  // ✅ Loading optimizado
  if (loading && !authChecked) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 Estado actual - User:', user ? `${user.nombre} (${user.rol})` : 'null', 'Loading:', loading);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              !user ? (
                <Login />
              ) : (
                <Navigate 
                  to={user.rol === 'admin' ? '/admin-dashboard' : '/coach-dashboard'} 
                  replace 
                />
              )
            } 
          />
          
          <Route 
            path="/coach-dashboard" 
            element={
              user ? (
                user.rol === 'entrenador' ? (
                  <Dashboard onLogout={handleLogout} currentUser={user} />
                ) : (
                  <Navigate to="/admin-dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/admin-dashboard" 
            element={
              user ? (
                user.rol === 'admin' ? (
                  <AdminDashboard onLogout={handleLogout} currentUser={user} />
                ) : (
                  <Navigate to="/coach-dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/" 
            element={
              <Navigate 
                to={user ? (user.rol === 'admin' ? '/admin-dashboard' : '/coach-dashboard') : '/login'} 
                replace 
              />
            } 
          />

          {/* Ruta de fallback */}
          <Route 
            path="*" 
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;