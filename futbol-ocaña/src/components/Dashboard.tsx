import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Player {
  id: string;
  name: string;
  document: string;
  avatar: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  country: string;
  department: string;
  city: string;
  category: string;
  club: string;
  eps: string;
  epsType: string;
}

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('0000000000');
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    player?: Player;
    message: string;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    id: '',
    name: '',
    document: '',
    avatar: '/src/assets/default-avatar.png',
    firstName: '',
    lastName: '',
    birthDate: '',
    country: '',
    department: '',
    city: '',
    category: '',
    club: '',
    eps: '',
    epsType: ''
  });

  // Datos de ejemplo de los jugadores
  useEffect(() => {
    const mockPlayers: Player[] = [
      {
        id: '1',
        name: 'SEBASTIAN DAVID PULIDO PARRA',
        document: '5863706',
        avatar: '/src/assets/avatar1.png',
        firstName: 'SEBASTIAN DAVID',
        lastName: 'PULIDO PARRA',
        birthDate: '21/12/2012',
        country: 'Colombia',
        department: 'Norte de Santander',
        city: 'Ocaña',
        category: 'Infantil Proceso',
        club: 'Athletic FC',
        eps: 'nueva eps',
        epsType: 'Subsidiado'
      },
      {
        id: '2',
        name: 'SERGIO ANDRES ARIAS CLAVIJO',
        document: '1092183395',
        avatar: '/src/assets/avatar2.png',
        firstName: 'SERGIO ANDRES',
        lastName: 'ARIAS CLAVIJO',
        birthDate: '15/08/2011',
        country: 'Colombia',
        department: 'Norte de Santander',
        city: 'Ocaña',
        category: 'Infantil Proceso',
        club: 'Athletic FC',
        eps: 'nueva eps',
        epsType: 'Subsidiado'
      },
      {
        id: '3',
        name: 'RHONUM FRAMEL SALAS BALLESTEROS',
        document: '1092183896',
        avatar: '/src/assets/avatar3.png',
        firstName: 'RHONUM FRAMEL',
        lastName: 'SALAS BALLESTEROS',
        birthDate: '03/05/2012',
        country: 'Colombia',
        department: 'Norte de Santander',
        city: 'Ocaña',
        category: 'Infantil Proceso',
        club: 'Athletic FC',
        eps: 'nueva eps',
        epsType: 'Subsidiado'
      },
      {
        id: '4',
        name: 'RAFAEL DAVID GALVAN ORTIZ',
        document: '1092737543',
        avatar: '/src/assets/avatar4.png',
        firstName: 'RAFAEL DAVID',
        lastName: 'GALVAN ORTIZ',
        birthDate: '28/09/2011',
        country: 'Colombia',
        department: 'Norte de Santander',
        city: 'Ocaña',
        category: 'Infantil Proceso',
        club: 'Athletic FC',
        eps: 'nueva eps',
        epsType: 'Subsidiado'
      },
      {
        id: '5',
        name: 'JOHAN SEBASTIAN CASTELLANO ROJAS',
        document: '1092737325',
        avatar: '/src/assets/avatar5.png',
        firstName: 'JOHAN SEBASTIAN',
        lastName: 'CASTELLANO ROJAS',
        birthDate: '12/03/2012',
        country: 'Colombia',
        department: 'Norte de Santander',
        city: 'Ocaña',
        category: 'Infantil Proceso',
        club: 'Athletic FC',
        eps: 'nueva eps',
        epsType: 'Subsidiado'
      },
      {
        id: '6',
        name: 'MATHIAS JOSE PAREDES VANEGAS',
        document: '1091671408',
        avatar: '/src/assets/avatar6.png',
        firstName: 'MATHIAS JOSE',
        lastName: 'PAREDES VANEGAS',
        birthDate: '07/11/2011',
        country: 'Colombia',
        department: 'Norte de Santander',
        city: 'Ocaña',
        category: 'Infantil Proceso',
        club: 'Athletic FC',
        eps: 'nueva eps',
        epsType: 'Subsidiado'
      },
      {
        id: '7',
        name: 'SERGIO ESTEBAN BARBOSA SANCHEZ',
        document: '1097115362',
        avatar: '/src/assets/avatar7.png',
        firstName: 'SERGIO ESTEBAN',
        lastName: 'BARBOSA SANCHEZ',
        birthDate: '19/06/2012',
        country: 'Colombia',
        department: 'Norte de Santander',
        city: 'Ocaña',
        category: 'Infantil Proceso',
        club: 'Athletic FC',
        eps: 'nueva eps',
        epsType: 'Subsidiado'
      },
      {
        id: '8',
        name: 'PHIER SANTIAGO SANCHEZ ALFONSO',
        document: '1091672072',
        avatar: '/src/assets/avatar8.png',
        firstName: 'PHIER SANTIAGO',
        lastName: 'SANCHEZ ALFONSO',
        birthDate: '25/01/2012',
        country: 'Colombia',
        department: 'Norte de Santander',
        city: 'Ocaña',
        category: 'Infantil Proceso',
        club: 'Athletic FC',
        eps: 'nueva eps',
        epsType: 'Subsidiado'
      },
      {
        id: '9',
        name: 'KATHERIN PEREZ CACERES',
        document: '1092184765',
        avatar: '/src/assets/avatar9.png',
        firstName: 'KATHERIN',
        lastName: 'PEREZ CACERES',
        birthDate: '14/04/2012',
        country: 'Colombia',
        department: 'Norte de Santander',
        city: 'Ocaña',
        category: 'Infantil Proceso',
        club: 'Athletic FC',
        eps: 'nueva eps',
        epsType: 'Subsidiado'
      },
      {
        id: '10',
        name: 'DIEGO ALEJANDRO PABON RANGEL',
        document: '1092190584',
        avatar: '/src/assets/avatar10.png',
        firstName: 'DIEGO ALEJANDRO',
        lastName: 'PABON RANGEL',
        birthDate: '30/10/2011',
        country: 'Colombia',
        department: 'Norte de Santander',
        city: 'Ocaña',
        category: 'Infantil Proceso',
        club: 'Athletic FC',
        eps: 'nueva eps',
        epsType: 'Subsidiado'
      }
    ];
    
    setPlayers(mockPlayers);
    setFilteredPlayers(mockPlayers);
  }, []);

  // Filtrar jugadores basado en la búsqueda
  useEffect(() => {
    const filtered = players.filter(player =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.document.includes(searchTerm)
    );
    setFilteredPlayers(filtered);
  }, [searchTerm, players]);

  const handleLogout = () => {
    onLogout();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedDocument(value);
    
    if (value.trim()) {
      const foundPlayer = players.find(player => player.document === value.trim());
      
      if (foundPlayer) {
        setSearchResult({
          found: true,
          player: foundPlayer,
          message: `Jugador encontrado en el equipo ${foundPlayer.club}`
        });
      } else {
        setSearchResult({
          found: false,
          message: 'Jugador no encontrado'
        });
      }
    } else {
      setSearchResult(null);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setSelectedPlayer(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPlayer(prev => ({
      ...prev,
      [name]: value,
      name: `${prev.firstName} ${prev.lastName}`.trim() || prev.name
    }));
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = (players.length + 1).toString();
    setPlayers(prev => [...prev, { ...newPlayer, id: newId }]);
    setFilteredPlayers(prev => [...prev, { ...newPlayer, id: newId }]);
    setShowAddModal(false);
    setNewPlayer({
      id: '',
      name: '',
      document: '',
      avatar: '/src/assets/default-avatar.png',
      firstName: '',
      lastName: '',
      birthDate: '',
      country: '',
      department: '',
      city: '',
      category: '',
      club: '',
      eps: '',
      epsType: ''
    });
    setSearchResult(null);
    setSelectedDocument('0000000000');
  };

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : ''}`}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-auto">
              <div className="logo-section d-flex align-items-center">
                <img 
                  src="/src/assets/logo-oceañero.png" 
                  alt="Logo" 
                  className="header-logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/4caf50/ffffff?text=O';
                  }}
                />
                <div className="company-info">
                  <h5 className="company-title mb-0">Corporación de</h5>
                  <h5 className="company-title mb-0">Futbol Oceañero</h5>
                </div>
              </div>
            </div>
            <div className="col"></div>
            <div className="col-auto">
              <div className="user-section d-flex align-items-center">
                <button 
                  className="btn btn-sm theme-toggle me-3"
                  onClick={toggleDarkMode}
                  title={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button 
                  className="btn btn-warning btn-sm me-3"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
                <span className="user-name">Jorge</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        <div className="container-fluid h-100">
          <div className="row h-100">
            {/* Sidebar con lista de jugadores */}
            <div className="col-lg-4 col-xl-3">
              <div className="sidebar">
                <div className="search-section">
                  <div className="d-flex align-items-center mb-3">
                    <button className="btn btn-outline-secondary btn-sm me-2">
                      ⚙️
                    </button>
                    <div className="search-input-container flex-grow-1">
                      <input
                        type="text"
                        className="form-control search-input"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                      {searchTerm && (
                        <button 
                          className="btn btn-sm search-clear"
                          onClick={clearSearch}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="players-list">
                  {filteredPlayers.map((player) => (
                    <div 
                      key={player.id} 
                      className="player-item"
                      onClick={() => handlePlayerClick(player)}
                    >
                      <div className="player-avatar">
                        <img 
                          src={player.avatar} 
                          alt={player.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/cccccc/666666?text=👤';
                          }}
                        />
                      </div>
                      <div className="player-info">
                        <div className="player-document">{player.document}</div>
                        <div className="player-name">{player.name}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={() => setShowAddModal(true)}
                >
                  Agregar Jugador
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className="col-lg-8 col-xl-9">
              <div className="main-content">
                <div className="search-document-section">
                  <h4 className="section-title">BUSCAR POR DOCUMENTO</h4>
                  
                  <div className="document-search-form">
                    <label htmlFor="documento" className="form-label">DOCUMENTO</label>
                    <div className="document-input-container">
                      <span className="input-icon">🆔</span>
                      <input
                        type="text"
                        className="form-control document-input"
                        id="documento"
                        value={selectedDocument}
                        onChange={handleDocumentChange}
                        placeholder="0000000000"
                      />
                    </div>
                  </div>

                  {searchResult && (
                    <div className="search-result mt-3">
                      {searchResult.found ? (
                        <div className="alert alert-success py-2 px-3">
                          <p>Jugador encontrado: {searchResult.player?.name}</p>
                          <p>Equipo/Club: {searchResult.player?.club}</p>
                        </div>
                      ) : (
                        <div className="alert alert-warning py-2 px-3">
                          <p>{searchResult.message}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de información del jugador */}
      {showPlayerModal && selectedPlayer && (
        <div className="modal-overlay" onClick={closePlayerModal}>
          <div className="player-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">INFORMACIÓN DEL USUARIO</h3>
              <button className="close-button" onClick={closePlayerModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="photo-section">
                    <h5>FOTO</h5>
                    <div className="photo-container">
                      <img 
                        src={selectedPlayer.avatar} 
                        alt={selectedPlayer.name}
                        className="player-photo"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x150/cccccc/666666?text=👤';
                        }}
                      />
                      <button className="photo-search-btn">🔍</button>
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="info-section">
                    <div className="info-field">
                      <label>DOCUMENTO</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          value={selectedPlayer.document} 
                          readOnly 
                          className="form-control readonly-input"
                        />
                        <button className="input-group-btn">✏️</button>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>NOMBRE</label>
                          <input 
                            type="text" 
                            value={selectedPlayer.firstName} 
                            readOnly 
                            className="form-control readonly-input"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>APELLIDO</label>
                          <input 
                            type="text" 
                            value={selectedPlayer.lastName} 
                            readOnly 
                            className="form-control readonly-input"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>NACIMIENTO</label>
                          <input 
                            type="text" 
                            value={selectedPlayer.birthDate} 
                            readOnly 
                            className="form-control readonly-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>PAÍS</label>
                          <input 
                            type="text" 
                            value={selectedPlayer.country} 
                            readOnly 
                            className="form-control readonly-input"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>DEPARTAMENTO</label>
                          <input 
                            type="text" 
                            value={selectedPlayer.department} 
                            readOnly 
                            className="form-control readonly-input"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>CIUDAD</label>
                          <input 
                            type="text" 
                            value={selectedPlayer.city} 
                            readOnly 
                            className="form-control readonly-input"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="info-field">
                      <label>CATEGORÍA</label>
                      <input 
                        type="text" 
                        value={selectedPlayer.category} 
                        readOnly 
                        className="form-control readonly-input"
                      />
                    </div>

                    <div className="info-field">
                      <label>CLUB O ESCUELA</label>
                      <input 
                        type="text" 
                        value={selectedPlayer.club} 
                        readOnly 
                        className="form-control readonly-input"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="info-field">
                          <label>EPS</label>
                          <input 
                            type="text" 
                            value={selectedPlayer.eps} 
                            readOnly 
                            className="form-control readonly-input"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-field">
                          <label>TIPO DE EPS</label>
                          <input 
                            type="text" 
                            value={selectedPlayer.epsType} 
                            readOnly 
                            className="form-control readonly-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary action-btn">
                  🖨️ IMPRIMIR
                </button>
                <button className="btn btn-success action-btn">
                  ⬇️ DESCARGAR ID
                </button>
                <button className="btn btn-info action-btn">
                  ⬇️ DESCARGAR REGISTRO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar jugador */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-player-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">AGREGAR JUGADOR</h3>
              <button className="close-button" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleAddPlayer}>
                <div className="mb-2">
                  <label htmlFor="document" className="form-label">Documento</label>
                  <input
                    type="text"
                    className="form-control"
                    id="document"
                    name="document"
                    value={newPlayer.document}
                    onChange={handleInputChange}
                    placeholder="123"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="firstName" className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    name="firstName"
                    value={newPlayer.firstName}
                    onChange={handleInputChange}
                    placeholder="..."
                    required
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="lastName" className="form-label">Apellido</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastName"
                    name="lastName"
                    value={newPlayer.lastName}
                    onChange={handleInputChange}
                    placeholder="..."
                    required
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="birthDate" className="form-label">Nacimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    id="birthDate"
                    name="birthDate"
                    value={newPlayer.birthDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="country" className="form-label">País</label>
                  <select
                    className="form-control"
                    id="country"
                    name="country"
                    value={newPlayer.country}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="Colombia">Colombia</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label htmlFor="department" className="form-label">Departamento</label>
                  <select
                    className="form-control"
                    id="department"
                    name="department"
                    value={newPlayer.department}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="Norte de Santander">Norte de Santander</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label htmlFor="city" className="form-label">Ciudad</label>
                  <select
                    className="form-control"
                    id="city"
                    name="city"
                    value={newPlayer.city}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="Ocaña">Ocaña</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label htmlFor="category" className="form-label">Categoría</label>
                  <input
                    type="text"
                    className="form-control"
                    id="category"
                    name="category"
                    value={newPlayer.category}
                    onChange={handleInputChange}
                    placeholder="Seleccione"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="club" className="form-label">Club o Escuela</label>
                  <input
                    type="text"
                    className="form-control"
                    id="club"
                    name="club"
                    value={newPlayer.club}
                    onChange={handleInputChange}
                    placeholder="Seleccione"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="eps" className="form-label">EPS</label>
                  <input
                    type="text"
                    className="form-control"
                    id="eps"
                    name="eps"
                    value={newPlayer.eps}
                    onChange={handleInputChange}
                    placeholder="..."
                    required
                  />
                </div>
                <div className="mb-2">
                  <label htmlFor="epsType" className="form-label">Tipo de EPS</label>
                  <select
                    className="form-control"
                    id="epsType"
                    name="epsType"
                    value={newPlayer.epsType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione</option>
                    <option value="Subsidiado">Subsidiado</option>
                    <option value="Contributivo">Contributivo</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-success action-btn">
                    Crear Usuario
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary action-btn"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-container {
    height: 100vh;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
  }

  /* MODO OSCURO */
  .dashboard-container.dark-theme {
    background: #1a1a1a;
    color: #e0e0e0;
  }

  .dashboard-header {
    background: white;
    border-bottom: 1px solid #e9ecef;
    padding: 1rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }

  .dark-theme .dashboard-header {
    background: #2d2d2d;
    border-bottom: 1px solid #404040;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .logo-section {
    gap: 0.75rem;
  }

  .header-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  .company-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2c3e50;
    line-height: 1.2;
    transition: color 0.3s ease;
  }

  .dark-theme .company-title {
    color: #e0e0e0;
  }

  .user-section {
    gap: 0.5rem;
  }

  .theme-toggle {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #6c757d;
    border-radius: 6px;
    padding: 0.375rem 0.75rem;
    transition: all 0.3s ease;
  }

  .dark-theme .theme-toggle {
    background: #404040;
    border: 1px solid #555;
    color: #e0e0e0;
  }

  .theme-toggle:hover {
    transform: scale(1.1);
  }

  .user-name {
    font-weight: 500;
    color: #2c3e50;
    transition: color 0.3s ease;
  }

  .dark-theme .user-name {
    color: #e0e0e0;
  }

  .dashboard-body {
    flex: 1;
    overflow: hidden;
  }

  .sidebar {
    background: white;
    height: 100%;
    border-right: 1px solid #e9ecef;
    padding: 1.5rem;
    overflow-y: auto;
    transition: all 0.3s ease;
  }

  .dark-theme .sidebar {
    background: #2d2d2d;
    border-right: 1px solid #404040;
  }

  .search-input-container {
    position: relative;
  }

  .search-input {
    padding-left: 0.75rem;
    padding-right: 2.5rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }

  .dark-theme .search-input {
    background: #404040;
    border: 1px solid #555;
    color: #e0e0e0;
  }

  .dark-theme .search-input::placeholder {
    color: #999;
  }

  .search-clear {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #6c757d;
    padding: 0.25rem;
    transition: color 0.3s ease;
  }

  .dark-theme .search-clear {
    color: #ccc;
  }

  .players-list {
    margin-top: 1rem;
  }

  .player-item {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    gap: 0.75rem;
  }

  .dark-theme .player-item {
    background: #404040;
  }

  .player-item:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }

  .dark-theme .player-item:hover {
    background: #4a4a4a;
  }

  .player-avatar img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #dee2e6;
    transition: border-color 0.3s ease;
  }

  .dark-theme .player-avatar img {
    border: 2px solid #555;
  }

  .player-info {
    flex: 1;
    min-width: 0;
  }

  .player-document {
    font-size: 0.85rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.25rem;
    transition: color 0.3s ease;
  }

  .dark-theme .player-document {
    color: #e0e0e0;
  }

  .player-name {
    font-size: 0.8rem;
    color: #6c757d;
    line-height: 1.3;
    word-wrap: break-word;
    transition: color 0.3s ease;
  }

  .dark-theme .player-name {
    color: #bbb;
  }

  .main-content {
    padding: 2rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-document-section {
    background: white;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    text-align: center;
    min-width: 400px;
    transition: all 0.3s ease;
  }

  .dark-theme .search-document-section {
    background: #2d2d2d;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  }

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 2rem;
    letter-spacing: 0.5px;
    transition: color 0.3s ease;
  }

  .dark-theme .section-title {
    color: #e0e0e0;
  }

  .form-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #495057;
    margin-bottom: 0.75rem;
    display: block;
    text-align: left;
    transition: color 0.3s ease;
  }

  .dark-theme .form-label {
    color: #ccc;
  }

  .document-input-container {
    position: relative;
  }

  .input-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    font-size: 1rem;
    z-index: 2;
    transition: color 0.3s ease;
  }

  .dark-theme .input-icon {
    color: #999;
  }

  .document-input {
    padding: 1rem 1rem 1rem 2.75rem;
    font-size: 1.1rem;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    background: #f8f9fa;
    transition: all 0.3s ease;
    width: 100%;
  }

  .dark-theme .document-input {
    background: #404040;
    border: 2px solid #555;
    color: #e0e0e0;
  }

  .dark-theme .document-input::placeholder {
    color: #999;
  }

  .document-input:focus {
    border-color: #4caf50;
    box-shadow: 0 0 0 0.2rem rgba(76, 175, 80, 0.25);
    background: white;
  }

  .dark-theme .document-input:focus {
    background: #4a4a4a;
    border-color: #4caf50;
  }

  @media (max-width: 992px) {
    .sidebar {
      border-right: none;
      border-bottom: 1px solid #e9ecef;
      height: auto;
      max-height: 300px;
    }
    
    .dark-theme .sidebar {
      border-bottom: 1px solid #404040;
    }
    
    .search-document-section {
      min-width: auto;
      margin: 1rem;
    }
  }

  @media (max-width: 576px) {
    .company-title {
      font-size: 0.75rem;
    }
    
    .main-content {
      padding: 1rem;
    }
    
    .search-document-section {
      padding: 1.5rem;
    }
  }

  /* MODAL STYLES */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .player-modal, .add-player-modal {
    background: white;
    border-radius: 12px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  }

  .dark-theme .player-modal, .dark-theme .add-player-modal {
    background: #2d2d2d;
    color: #e0e0e0;
  }

  .modal-header {
    background: #f8f9fa;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 12px 12px 0 0;
  }

  .dark-theme .modal-header {
    background: #404040;
    border-bottom: 1px solid #555;
  }

  .modal-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .dark-theme .modal-title {
    color: #e0e0e0;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.3s ease;
  }

  .close-button:hover {
    color: #dc3545;
  }

  .dark-theme .close-button {
    color: #ccc;
  }

  .modal-body {
    padding: 2rem;
  }

  .photo-section h5 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dark-theme .photo-section h5 {
    color: #ccc;
  }

  .photo-container {
    position: relative;
    display: inline-block;
  }

  .player-photo {
    width: 150px;
    height: 150px;
    border-radius: 8px;
    object-fit: cover;
    border: 3px solid #e9ecef;
  }

  .dark-theme .player-photo {
    border: 3px solid #555;
  }

  .photo-search-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .photo-search-btn:hover {
    background: white;
    transform: scale(1.1);
  }

  .info-section {
    padding-left: 1rem;
  }

  .info-field {
    margin-bottom: 1.5rem;
  }

  .info-field label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .dark-theme .info-field label {
    color: #ccc;
  }

  .readonly-input {
    background: #f8f9fa !important;
    border: 1px solid #dee2e6;
    color: #495057;
    font-size: 0.9rem;
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
  }

  .dark-theme .readonly-input {
    background: #404040 !important;
    border: 1px solid #555;
    color: #e0e0e0;
  }

  .input-group {
    position: relative;
  }

  .input-group-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #6c757d;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.25rem;
  }

  .dark-theme .input-group-btn {
    color: #ccc;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e9ecef;
  }

  .dark-theme .modal-actions {
    border-top: 1px solid #555;
  }

  .action-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    .player-modal, .add-player-modal {
      margin: 0.5rem;
      max-height: 95vh;
    }
    
    .modal-body {
      padding: 1rem;
    }
    
    .info-section {
      padding-left: 0;
      margin-top: 1.5rem;
    }
    
    .modal-actions {
      flex-direction: column;
      align-items: center;
    }
    
    .action-btn {
      width: 100%;
      max-width: 300px;
    }
  }

  /* ESTILOS ADICIONALES PARA BUSCAR POR DOCUMENTO */
  .search-result {
    border-radius: 8px;
    margin-top: 1rem;
  }

  .search-result p {
    margin: 0;
    font-size: 0.9rem;
  }

  .dark-theme .search-result {
    background: #404040;
    color: #e0e0e0;
  }

  .dark-theme .alert-success {
    background: #2d4a2d;
    border-color: #45a049;
  }

  .dark-theme .alert-warning {
    background: #4a2d2d;
    border-color: #dc3545;
  }
      `}</style>
    </div>
  );
};

export default Dashboard;