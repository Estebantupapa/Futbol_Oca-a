import React from 'react';
import { AdminHeaderProps } from '../coach/types/adminTypes';

const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentUser,
  isDarkMode,
  showHamburgerMenu,
  onToggleDarkMode,
  onToggleHamburgerMenu,
  onViewProfile,
  onAddAdmin,
  onAddCoach,
  onAddSchool,
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
                src="/img/logo_bueno.png" 
                alt="Logo" 
                className="header-logo"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/4caf50/ffffff?text=O';
                }}
              />
              <div className="company-info">
                <h5 className="company-title mb-0">Corporación de</h5>
                <h5 className="company-title mb-0">Futbol Ocañero</h5>
                <small className="text-muted">Panel de Administración</small>
              </div>
            </div>
          </div>
          <div className="col"></div>
          <div className="col-auto">
            <div className="user-section d-flex align-items-center">
              <span className="badge bg-primary me-3">
                Administrador
              </span>
              
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
                        <div className="small text-primary">Administrador</div>
                      </div>
                      
                      <button 
                        className="btn btn-sm w-100 mb-1 text-start"
                        onClick={onViewProfile}
                      >
                        👤 Ver mi perfil
                      </button>

                      <hr className="my-2" />
                      
                      <button 
                        className="btn btn-sm w-100 mb-1 text-start"
                        onClick={onAddAdmin}
                      >
                        ➕ Agregar Administrador
                      </button>
                      
                      <button 
                        className="btn btn-sm w-100 mb-1 text-start"
                        onClick={onAddCoach}
                      >
                        👨‍🏫 Agregar Entrenador
                      </button>
                      
                      <button 
                        className="btn btn-sm w-100 mb-1 text-start"
                        onClick={onAddSchool}
                      >
                        🏫 Agregar Escuela
                      </button>
                      
                      <hr className="my-2" />
                      
                      <button 
                        className="btn btn-sm w-100 mb-1 text-start text-danger"
                        onClick={onLogout}
                      >
                        🚪 Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <span className="user-name ms-2 d-none d-md-inline">
                {currentUser.nombre} {currentUser.apellido}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;