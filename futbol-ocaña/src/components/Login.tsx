import React, { useState } from 'react';
import Dashboard from './Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css'; // Importar tu archivo CSS

interface LoginForm {
  documentoIdentidad: string;
  contrasena: string;
}

const Login: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState<LoginForm>({
    documentoIdentidad: '',
    contrasena: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validaciones básicas
    if (!formData.documentoIdentidad.trim()) {
      setError('El documento de identidad es obligatorio');
      setIsLoading(false);
      return;
    }

    if (!formData.contrasena.trim()) {
      setError('La contraseña es obligatoria');
      setIsLoading(false);
      return;
    }

    // Simular un pequeño delay para la "autenticación"
    setTimeout(() => {
      // Aquí puedes agregar tu lógica de autenticación real
      // Por ahora, cualquier documento y contraseña válidos funcionarán
      
      console.log('Intentando login con:', formData);
      
      // Simulación de login exitoso
      // Puedes cambiar esta lógica por la validación real que necesites
      if (formData.documentoIdentidad.length >= 3 && formData.contrasena.length >= 3) {
        setIsLoggedIn(true);
        console.log('Login exitoso!');
      } else {
        setError('Documento o contraseña incorrectos');
      }
      
      setIsLoading(false);
    }, 1000); // 1 segundo de delay para simular autenticación
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFormData({
      documentoIdentidad: '',
      contrasena: ''
    });
    setError('');
  };

  // Si está logueado, mostrar el Dashboard
  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
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
                      src="/src/assets/logo-oceañero.png" 
                      alt="Logo Corporación de Futbol Oceañero" 
                      className="logo-img"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x50/4caf50/ffffff?text=O';
                      }}
                    />
                  </div>
                  <h4 className="company-name">
                    Corporación de<br />
                    Futbol Oceañero
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
                    <label htmlFor="documentoIdentidad" className="form-label">
                      DOCUMENTO DE IDENTIDAD <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control login-input"
                      id="documentoIdentidad"
                      name="documentoIdentidad"
                      value={formData.documentoIdentidad}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      placeholder="Ingresa tu documento"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="contrasena" className="form-label">
                      CONTRASEÑA <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control login-input"
                      id="contrasena"
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      placeholder="Ingresa tu contraseña"
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