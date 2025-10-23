import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dasboard/coach/Dashboard';
import AdminDashboard from './components/Dasboard/admin/AdminDashboard';
import { supabase } from './services/supabaseClient';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Definir el tipo de usuario
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

  useEffect(() => {
    // Verificar sesión inicial rápidamente
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Obtener perfil del usuario
          const { data: profile, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile && !error) {
            setUser(profile as Usuario);
          } else {
            console.error('Error getting profile:', error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile && !error) {
            setUser(profile as Usuario);
          } else {
            console.error('Error getting user profile:', error);
            setUser(null);
          }
        } catch (error) {
          console.error('Error getting user profile:', error);
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'INITIAL_SESSION') {
        // Ya manejado por checkSession
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando...</p>
        </div>
      </div>
    );
  }

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
        </Routes>
      </div>
    </Router>
  );
}

export default App;