import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css';
import { supabase, getUserProfile, Usuario } from '../supabaseClient';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificar si hay una sesión activa al cargar
  useEffect(() => {
    checkAuthStatus();
    
    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const profile = await getUserProfile();
          if (profile?.data) {
            setUser(profile.data);
            setIsLoggedIn(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const profile = await getUserProfile();
        if (profile?.data && profile.data.activo) {
          setUser(profile.data);
          setIsLoggedIn(true);
        } else if (profile?.data && !profile.data.activo) {
          // Usuario desactivado
          await supabase.auth.signOut();
          setError('Tu cuenta está desactivada. Contacta al administrador.');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validaciones básicas
    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('La contraseña es obligatoria');
      setIsLoading(false);
      return;
    }

    try {
      // Intentar login con Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password.trim(),
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email o contraseña incorrectos');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Por favor confirma tu email antes de iniciar sesión');
        } else if (authError.message.includes('signup_disabled')) {
          setError('El registro está deshabilitado');
        } else {
          setError(`Error de autenticación: ${authError.message}`);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Obtener el perfil del usuario
        const profile = await getUserProfile();
        
        if (profile?.error) {
          setError('Error obteniendo el perfil del usuario');
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        if (profile?.data) {
          if (!profile.data.activo) {
            setError('Tu cuenta está desactivada. Contacta al administrador.');
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
          }
          
          setUser(profile.data);
          setIsLoggedIn(true);
        } else {
          setError('No se encontró el perfil del usuario');
          await supabase.auth.signOut();
        }
      }
    } catch (error: any) {
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setUser(null);
      setFormData({
        email: '',
        password: ''
      });
      setError('');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Mostrar spinner mientras se verifica la autenticación
  if (isCheckingAuth) {
    return (
      <div className="login-container">
        <div className="login-background">
          <div className="container-fluid h-100">
            <div className="row h-100 justify-content-center align-items-center">
              <div className="col-auto">
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-2">Verificando sesión...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si está logueado, mostrar el Dashboard
  if (isLoggedIn && user) {
    return <Dashboard onLogout={handleLogout} currentUser={user} />;
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="container-fluid h-100">
          <div className="row h-100 justify-content-center align-items-center">
            <div className="col-11 col-sm-8 col-md-6 col-lg-4 col-xl-3">
              <div className="login-card">
                <div className="text-center mb-4">
                  <div className="logo-container mb-3">
                    <img 
                      src="./src/img/logo_bueno.png" 
                      alt="Logo Corporación de Futbol Ocañero" 
                      className="logo-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x50/4caf50/ffffff?text=O';
                      }}
                    />
                  </div>
                  <h4 className="company-name">
                    Corporación de<br />
                    Futbol Ocañero
                  </h4>
                </div>

                <div className="login-section-title">
                  INICIO DE SESIÓN
                </div>

                {error && (
                  <div className="alert alert-danger py-2 px-3 mb-3" role="alert">
                    <small>{error}</small>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      EMAIL <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control login-input"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      placeholder="admin@futbolocañero.com"
                      autoComplete="email"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      CONTRASEÑA <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control login-input"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      placeholder="Ingresa tu contraseña"
                      autoComplete="current-password"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn login-btn w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Ingresando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </button>
                </form>

                <div className="login-info-text">
                  Las cuentas solo pueden ser creadas por<br />
                  administradores
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;