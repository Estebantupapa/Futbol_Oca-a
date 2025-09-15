import React from 'react';

interface CoachHeaderProps {
  currentUser: any;
  isDarkMode: boolean;
  showHamburgerMenu: boolean;
  onToggleDarkMode: () => void;
  onToggleHamburgerMenu: () => void;
  onViewProfile: () => void;
  onAddPlayer: () => void;
  onLogout: () => void;
  hamburgerMenuRef: React.RefObject<HTMLDivElement>;
}

const CoachHeader: React.FC<CoachHeaderProps> = ({
  currentUser,
  isDarkMode,
  showHamburgerMenu,
  onToggleDarkMode,
  onToggleHamburgerMenu,
  onViewProfile,
  onAddPlayer,
  onLogout,
  hamburgerMenuRef
}) => {
  return (
    <header className="dashboard-header">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col-auto">
            <div className="logo-section d-flex align-items-center">
              <img 
                src="./src/img/logo_bueno.png" 
                alt="Logo" 
                className="header-logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/4caf50/ffffff?text=O';
                }}
              />
              <div className="company-info">
                <h5 className="company-title mb-0">Corporación de</h5>
                <h5 className="company-title mb-0">Futbol Ocañero</h5>
              </div>
            </div>
          </div>
          <div className="col"></div>
          <div className="col-auto">
            <div className="user-section d-flex align-items-center">
              <span className="badge bg-primary me-3">
                {currentUser.rol === 'admin' ? 'Administrador' : 'Entrenador'}
              </span>
              {currentUser.escuela && (
                <span className="badge bg-secondary me-3">
                  {currentUser.escuela.nombre}
                </span>
              )}
              <button 
                className="btn btn-sm theme-toggle me-3"
                onClick={onToggleDarkMode}
                title={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <div className="hamburger-menu-container position-relative" ref={hamburgerMenuRef}>
                <button 
                  className={`btn btn-sm btn-outline-secondary hamburger-button ${showHamburgerMenu ? 'menu-open' : ''}`}
                  onClick={onToggleHamburgerMenu}
                >
                  ☰
                </button>
                
                {showHamburgerMenu && (
                  <div className="hamburger-menu position-absolute bg-white border rounded shadow-sm mt-1 end-0">
                    <div className="p-2">
                      <div className="user-info p-2 border-bottom mb-2">
                        <strong>{currentUser.nombre} {currentUser.apellido}</strong>
                        <div className="small text-muted">{currentUser.email}</div>
                      </div>
                      
                      <button 
                        className="btn btn-sm w-100 mb-1 text-start"
                        onClick={onViewProfile}
                      >
                        👤 Ver mi perfil
                      </button>

                      <button
                        className="btn btn-primary w-100 mt-3"
                        onClick={onAddPlayer}
                      >
                        ➕ Agregar Jugador
                      </button>
                      
                      <button 
                        className="btn btn-sm w-100 mb-1 text-start"
                        onClick={onLogout}
                      >
                        🚪 Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <span className="user-name ms-2">{currentUser.nombre} {currentUser.apellido}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CoachHeader;