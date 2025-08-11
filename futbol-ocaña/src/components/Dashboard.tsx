import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import { 
  getAllJugadores, 
  getJugadoresByEscuela, 
  getCategorias, 
  getEscuelas, 
  createJugador,
  updateJugador,
  deleteJugador,
  Usuario,
  Jugador,
  Categoria,
  Escuela,
  JugadorInsert
} from '../supabaseClient';

interface DashboardProps {
  onLogout: () => void;
  currentUser: Usuario;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Jugador[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Jugador | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    player?: Jugador;
    message: string;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPlayer, setNewPlayer] = useState<Partial<JugadorInsert>>({
    documento: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    pais: 'Colombia',
    departamento: 'Norte de Santander',
    ciudad: 'Ocaña',
    categoria_id: '',
    escuela_id: currentUser.rol === 'entrenador' ? currentUser.escuela_id || '' : '',
    eps: '',
    tipo_eps: 'Subsidiado'
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, [currentUser]);

  // Filtrar jugadores basado en la búsqueda
  useEffect(() => {
    const filtered = players.filter(player =>
      `${player.nombre} ${player.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.documento.includes(searchTerm)
    );
    setFilteredPlayers(filtered);
  }, [searchTerm, players]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar categorías y escuelas
      const [categoriasResult, escuelasResult] = await Promise.all([
        getCategorias(),
        getEscuelas()
      ]);

      if (categoriasResult.error) throw categoriasResult.error;
      if (escuelasResult.error) throw escuelasResult.error;

      setCategorias(categoriasResult.data || []);
      setEscuelas(escuelasResult.data || []);

      // Cargar jugadores según el rol del usuario
      await loadPlayers();

    } catch (err: any) {
      console.error('Error loading initial data:', err);
      setError(err.message || 'Error cargando datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    try {
      let playersResult;

      if (currentUser.rol === 'admin') {
        playersResult = await getAllJugadores();
      } else if (currentUser.escuela_id) {
        playersResult = await getJugadoresByEscuela(currentUser.escuela_id);
      } else {
        throw new Error('No se pudo determinar la escuela del usuario');
      }

      if (playersResult.error) throw playersResult.error;

      setPlayers(playersResult.data || []);
      setFilteredPlayers(playersResult.data || []);
    } catch (err: any) {
      console.error('Error loading players:', err);
      setError(err.message || 'Error cargando jugadores');
    }
  };

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
      const foundPlayer = players.find(player => player.documento === value.trim());
      
      if (foundPlayer) {
        setSearchResult({
          found: true,
          player: foundPlayer,
          message: `Jugador encontrado en ${foundPlayer.escuela?.nombre || 'la escuela'}`
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

  const handlePlayerClick = (player: Jugador) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
    setIsEditing(false);
  };

  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setSelectedPlayer(null);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPlayer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (selectedPlayer) {
      setSelectedPlayer(prev => prev ? {
        ...prev,
        [name]: value
      } : null);
    }
  };

  // Reemplaza tu función handleAddPlayer con esta versión con debug:

// Reemplaza tu función handleAddPlayer con esta versión con debug:

const handleAddPlayer = async (e: React.FormEvent) => {
  e.preventDefault();
  
  console.log('=== DEBUG ADD PLAYER ===');
  console.log('Form data:', newPlayer);
  console.log('Current user:', currentUser);
  
  try {
    // Validar campos requeridos
    if (!newPlayer.documento || !newPlayer.nombre || !newPlayer.apellido || 
        !newPlayer.fecha_nacimiento || !newPlayer.categoria_id || 
        !newPlayer.escuela_id || !newPlayer.eps) {
      console.log('Validation failed. Missing fields:', {
        documento: !!newPlayer.documento,
        nombre: !!newPlayer.nombre,
        apellido: !!newPlayer.apellido,
        fecha_nacimiento: !!newPlayer.fecha_nacimiento,
        categoria_id: !!newPlayer.categoria_id,
        escuela_id: !!newPlayer.escuela_id,
        eps: !!newPlayer.eps
      });
      setError('Todos los campos son obligatorios');
      return;
    }

    console.log('Validation passed, creating player data...');

    const playerData: JugadorInsert = {
      documento: newPlayer.documento,
      nombre: newPlayer.nombre,
      apellido: newPlayer.apellido,
      fecha_nacimiento: newPlayer.fecha_nacimiento,
      pais: newPlayer.pais || 'Colombia',
      departamento: newPlayer.departamento || 'Norte de Santander',
      ciudad: newPlayer.ciudad || 'Ocaña',
      categoria_id: newPlayer.categoria_id,
      escuela_id: newPlayer.escuela_id,
      eps: newPlayer.eps,
      tipo_eps: newPlayer.tipo_eps || 'Subsidiado'
    };

    console.log('Player data to insert:', playerData);
    console.log('Calling createJugador...');

    const result = await createJugador(playerData);
    
    console.log('createJugador result:', result);
    
    if (result.error) {
      console.error('Error from createJugador:', result.error);
      
      // Convertir error a any para acceder a propiedades
      const error = result.error as any;
      
      if (error.code === '23505') {
        setError('Ya existe un jugador con este documento');
      } else if (error.message) {
        setError(`Error: ${error.message}`);
      } else {
        setError('Error agregando jugador');
      }
      return;
    }

    console.log('Player created successfully, reloading players...');
    
    // Recargar jugadores
    await loadPlayers();
    
    console.log('Players reloaded, closing modal...');
    
    setShowAddModal(false);
    setNewPlayer({
      documento: '',
      nombre: '',
      apellido: '',
      fecha_nacimiento: '',
      pais: 'Colombia',
      departamento: 'Norte de Santander',
      ciudad: 'Ocaña',
      categoria_id: '',
      escuela_id: currentUser.rol === 'entrenador' ? currentUser.escuela_id || '' : '',
      eps: '',
      tipo_eps: 'Subsidiado'
    });
    setError(null);

    console.log('Add player process completed successfully');
    
  } catch (err: any) {
    console.error('Error in handleAddPlayer catch block:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint
    });
    setError(err.message || 'Error agregando jugador');
  } finally {
    console.log('=== END DEBUG ADD PLAYER ===');
  }
};

  const handleUpdatePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      const updates = {
        nombre: selectedPlayer.nombre,
        apellido: selectedPlayer.apellido,
        fecha_nacimiento: selectedPlayer.fecha_nacimiento,
        pais: selectedPlayer.pais,
        departamento: selectedPlayer.departamento,
        ciudad: selectedPlayer.ciudad,
        eps: selectedPlayer.eps,
        tipo_eps: selectedPlayer.tipo_eps
      };

      const result = await updateJugador(selectedPlayer.id, updates);
      
      if (result.error) throw result.error;
      
      // Recargar jugadores
      await loadPlayers();
      setIsEditing(false);
      setError(null);
      
    } catch (err: any) {
      console.error('Error updating player:', err);
      setError(err.message || 'Error actualizando jugador');
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este jugador?')) return;

    try {
      const result = await deleteJugador(playerId);
      
      if (result.error) throw result.error;
      
      // Recargar jugadores
      await loadPlayers();
      closePlayerModal();
      setError(null);
      
    } catch (err: any) {
      console.error('Error deleting player:', err);
      setError(err.message || 'Error eliminando jugador');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando datos...</p>
        </div>
      </div>
    );
  }

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
                <span className="user-name">{currentUser.nombre} {currentUser.apellido}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="alert alert-danger m-3" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

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
                        placeholder="Buscar jugador..."
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
                  
                  {/* Estadísticas rápidas */}
                  <div className="stats-section mb-3">
                    <div className="small text-muted">
                      Total jugadores: <strong>{filteredPlayers.length}</strong>
                      {currentUser.rol === 'admin' && (
                        <span> de {players.length}</span>
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
                        <div className="avatar-placeholder">
                          👤
                        </div>
                      </div>
                      <div className="player-info">
                        <div className="player-document">{player.documento}</div>
                        <div className="player-name">{player.nombre} {player.apellido}</div>
                        <div className="player-category">
                          <small className="text-muted">{player.categoria?.nombre}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredPlayers.length === 0 && !loading && (
                    <div className="text-center py-4">
                      <div className="text-muted">
                        {searchTerm ? 'No se encontraron jugadores' : 'No hay jugadores registrados'}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={() => setShowAddModal(true)}
                >
                  ➕ Agregar Jugador
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className="col-lg-8 col-xl-9">
              <div className="main-content">
                <div className="search-document-section">
                  <h4 className="section-title">BÚSQUEDA POR DOCUMENTO</h4>
                  
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
                        placeholder="Ingrese número de documento"
                      />
                    </div>
                  </div>

                  {searchResult && (
                    <div className="search-result mt-3">
                      {searchResult.found ? (
                        <div className="alert alert-success py-2 px-3">
                          <h6 className="mb-1">✅ Jugador encontrado</h6>
                          <p className="mb-1"><strong>Nombre:</strong> {searchResult.player?.nombre} {searchResult.player?.apellido}</p>
                          <p className="mb-1"><strong>Escuela:</strong> {searchResult.player?.escuela?.nombre}</p>
                          <p className="mb-0"><strong>Categoría:</strong> {searchResult.player?.categoria?.nombre}</p>
                          <button 
                            className="btn btn-sm btn-outline-primary mt-2"
                            onClick={() => searchResult.player && handlePlayerClick(searchResult.player)}
                          >
                            Ver detalles
                          </button>
                        </div>
                      ) : (
                        <div className="alert alert-warning py-2 px-3">
                          <p className="mb-0">❌ {searchResult.message}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Panel de estadísticas para admins */}
                  {currentUser.rol === 'admin' && (
                    <div className="stats-panel mt-4">
                      <h5>Estadísticas Generales</h5>
                      <div className="row">
                        <div className="col-md-3">
                          <div className="stat-card">
                            <div className="stat-number">{players.length}</div>
                            <div className="stat-label">Total Jugadores</div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="stat-card">
                            <div className="stat-number">{escuelas.length}</div>
                            <div className="stat-label">Escuelas Activas</div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="stat-card">
                            <div className="stat-number">{categorias.length}</div>
                            <div className="stat-label">Categorías</div>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="stat-card">
                            <div className="stat-number">
                              {new Set(players.map(p => p.categoria_id)).size}
                            </div>
                            <div className="stat-label">Categorías Activas</div>
                          </div>
                        </div>
                      </div>
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
              <h3 className="modal-title">INFORMACIÓN DEL JUGADOR</h3>
              <div className="d-flex align-items-center">
                {!isEditing ? (
                  <button 
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Editar
                  </button>
                ) : (
                  <>
                    <button 
                      className="btn btn-sm btn-success me-2"
                      onClick={handleUpdatePlayer}
                    >
                      💾 Guardar
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() => {
                        setIsEditing(false);
                        // Recargar datos del jugador
                        const originalPlayer = players.find(p => p.id === selectedPlayer.id);
                        if (originalPlayer) setSelectedPlayer(originalPlayer);
                      }}
                    >
                      ✕ Cancelar
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-sm btn-danger me-2"
                  onClick={() => handleDeletePlayer(selectedPlayer.id)}
                >
                  🗑️ Eliminar
                </button>
                <button className="close-button" onClick={closePlayerModal}>
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="photo-section">
                    <h5>FOTO</h5>
                    <div className="photo-container">
                      <div className="player-photo-placeholder">
                        👤
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">
                          Edad: {calculateAge(selectedPlayer.fecha_nacimiento)} años
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="info-section">
                    <div className="info-field">
                      <label>DOCUMENTO</label>
                      <input 
                        type="text" 
                        value={selectedPlayer.documento} 
                        readOnly 
                        className="form-control readonly-input"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="info-field">
                          <label>NOMBRE</label>
                          <input 
                            type="text" 
                            name="nombre"
                            value={selectedPlayer.nombre} 
                            onChange={handleEditInputChange}
                            readOnly={!isEditing}
                            className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-field">
                          <label>APELLIDO</label>
                          <input 
                            type="text" 
                            name="apellido"
                            value={selectedPlayer.apellido} 
                            onChange={handleEditInputChange}
                            readOnly={!isEditing}
                            className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="info-field">
                      <label>FECHA DE NACIMIENTO</label>
                      <input 
                        type="date" 
                        name="fecha_nacimiento"
                        value={selectedPlayer.fecha_nacimiento} 
                        onChange={handleEditInputChange}
                        readOnly={!isEditing}
                        className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>PAÍS</label>
                          <input 
                            type="text" 
                            name="pais"
                            value={selectedPlayer.pais} 
                            onChange={handleEditInputChange}
                            readOnly={!isEditing}
                            className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>DEPARTAMENTO</label>
                          <input 
                            type="text" 
                            name="departamento"
                            value={selectedPlayer.departamento} 
                            onChange={handleEditInputChange}
                            readOnly={!isEditing}
                            className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>CIUDAD</label>
                          <input 
                            type="text" 
                            name="ciudad"
                            value={selectedPlayer.ciudad} 
                            onChange={handleEditInputChange}
                            readOnly={!isEditing}
                            className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="info-field">
                      <label>CATEGORÍA</label>
                      <input 
                        type="text" 
                        value={selectedPlayer.categoria?.nombre || 'Sin categoría'} 
                        readOnly 
                        className="form-control readonly-input"
                      />
                    </div>

                    <div className="info-field">
                      <label>CLUB O ESCUELA</label>
                      <input 
                        type="text" 
                        value={selectedPlayer.escuela?.nombre || 'Sin escuela'} 
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
                            name="eps"
                            value={selectedPlayer.eps} 
                            onChange={handleEditInputChange}
                            readOnly={!isEditing}
                            className={`form-control ${!isEditing ? 'readonly-input' : ''}`}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-field">
                          <label>TIPO DE EPS</label>
                          {isEditing ? (
                            <select 
                              name="tipo_eps"
                              value={selectedPlayer.tipo_eps} 
                              onChange={handleEditInputChange}
                              className="form-control"
                            >
                              <option value="Subsidiado">Subsidiado</option>
                              <option value="Contributivo">Contributivo</option>
                              <option value="Especial">Especial</option>
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              value={selectedPlayer.tipo_eps} 
                              readOnly 
                              className="form-control readonly-input"
                            />
                          )}
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
              <h3 className="modal-title">AGREGAR NUEVO JUGADOR</h3>
              <button className="close-button" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleAddPlayer}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="documento" className="form-label">
                        Documento <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="documento"
                        name="documento"
                        value={newPlayer.documento}
                        onChange={handleInputChange}
                        placeholder="123456789"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="fecha_nacimiento" className="form-label">
                        Fecha de Nacimiento <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="fecha_nacimiento"
                        name="fecha_nacimiento"
                        value={newPlayer.fecha_nacimiento}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="nombre" className="form-label">
                        Nombre <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="nombre"
                        name="nombre"
                        value={newPlayer.nombre}
                        onChange={handleInputChange}
                        placeholder="Nombre del jugador"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="apellido" className="form-label">
                        Apellido <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="apellido"
                        name="apellido"
                        value={newPlayer.apellido}
                        onChange={handleInputChange}
                        placeholder="Apellido del jugador"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="pais" className="form-label">País</label>
                      <select
                        className="form-control"
                        id="pais"
                        name="pais"
                        value={newPlayer.pais}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Colombia">Colombia</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="departamento" className="form-label">Departamento</label>
                      <select
                        className="form-control"
                        id="departamento"
                        name="departamento"
                        value={newPlayer.departamento}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Norte de Santander">Norte de Santander</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="ciudad" className="form-label">Ciudad</label>
                      <select
                        className="form-control"
                        id="ciudad"
                        name="ciudad"
                        value={newPlayer.ciudad}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Ocaña">Ocaña</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="categoria_id" className="form-label">
                        Categoría <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        id="categoria_id"
                        name="categoria_id"
                        value={newPlayer.categoria_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione una categoría</option>
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="escuela_id" className="form-label">
                        Club o Escuela <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        id="escuela_id"
                        name="escuela_id"
                        value={newPlayer.escuela_id}
                        onChange={handleInputChange}
                        disabled={currentUser.rol === 'entrenador'}
                        required
                      >
                        <option value="">Seleccione una escuela</option>
                        {escuelas.map(escuela => (
                          <option key={escuela.id} value={escuela.id}>{escuela.nombre}</option>
                        ))}
                      </select>
                      {currentUser.rol === 'entrenador' && (
                        <small className="text-muted">
                          Solo puedes agregar jugadores a tu escuela asignada
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="eps" className="form-label">
                        EPS <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="eps"
                        name="eps"
                        value={newPlayer.eps}
                        onChange={handleInputChange}
                        placeholder="Nueva EPS"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="tipo_eps" className="form-label">
                        Tipo de EPS <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        id="tipo_eps"
                        name="tipo_eps"
                        value={newPlayer.tipo_eps}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Subsidiado">Subsidiado</option>
                        <option value="Contributivo">Contributivo</option>
                        <option value="Especial">Especial</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-success action-btn">
                    ✅ Crear Jugador
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary action-btn"
                    onClick={() => {
                      setShowAddModal(false);
                      setError(null);
                    }}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;