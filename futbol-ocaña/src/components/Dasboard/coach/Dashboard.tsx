import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Dashboard.css';
import { 
  Usuario, 
  Jugador, 
  Categoria, 
  Escuela,
  Pais,
  Departamento,
  Ciudad,
  getAllJugadores,
  getJugadoresByEscuela,
  getCategorias,
  getEscuelas,
  getPaises,
  getDepartamentosByPais,
  getCiudadesByDepartamento,
  getUserProfile,
  updateJugador,
  deleteJugador,
  createJugador
} from '../../../services/supabaseClient';
import CoachHeader from './components/CoachHeader';
import CoachSidebar from './components/CoachSidebar';
import PlayerModal from './components/PlayerModal';
import AddPlayerModal from './components/AddPlayerModal';
import ProfileModal from './components/ProfileModal';
import { useFileUpload } from './hooks/useFileUpload';

interface DashboardProps {
  onLogout: () => void;
  currentUser: Usuario;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, currentUser }) => {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('');
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Jugador[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  
  // Estados para ubicaciones
  const [paises, setPaises] = useState<Pais[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [selectedPaisId, setSelectedPaisId] = useState<string>('');
  const [selectedDepartamentoId, setSelectedDepartamentoId] = useState<string>('');

  // Estado para controlar operaciones bloqueantes
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  
  // Estados para ubicaciones del modal de edición
  const [editPaises, setEditPaises] = useState<Pais[]>([]);
  const [editDepartamentos, setEditDepartamentos] = useState<Departamento[]>([]);
  const [editCiudades, setEditCiudades] = useState<Ciudad[]>([]);
  const [editSelectedPaisId, setEditSelectedPaisId] = useState<string>('');
  const [editSelectedDepartamentoId, setEditSelectedDepartamentoId] = useState<string>('');
  
  // Nuevo estado para controlar si hay documentos abiertos
  const [documentOpened, setDocumentOpened] = useState(false);
  
  // Estados para el menú hamburguesa
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const hamburgerMenuRef = useRef<HTMLDivElement>(null);
  
  // Estados para el modal de perfil del usuario
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<Usuario | null>(null);
  
  // Estados para modales de jugador
  const [selectedPlayer, setSelectedPlayer] = useState<Jugador | null>(null);
  const [originalPlayer, setOriginalPlayer] = useState<Jugador | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    player?: Jugador;
    message: string;
  } | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Hook para manejo de archivos
  const { files, fileErrors, handleFileSelect, uploadFiles, resetFiles } = useFileUpload();

  // Estado inicial del nuevo jugador
  const initialPlayerState = useMemo(() => ({
    documento: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    pais: '',
    departamento: '',
    ciudad: '',
    categoria_id: '',
    escuela_id: currentUser.rol === 'entrenador' ? currentUser.escuela_id || '' : '',
    eps: '',
    tipo_eps: 'Subsidiado' as const
  }), [currentUser.rol, currentUser.escuela_id]);

  const [newPlayer, setNewPlayer] = useState<Partial<Jugador>>(initialPlayerState);

  // FUNCIÓN PARA RECARGAR PLAYERS
  const reloadPlayers = useCallback(async () => {
    try {
      let playersResult;

      if (currentUser.rol === 'admin') {
        playersResult = await getAllJugadores();
      } else if (currentUser.escuela_id) {
        playersResult = await getJugadoresByEscuela(currentUser.escuela_id);
      } else {
        throw new Error('No se pudo determinar la escuela del usuario');
      }

      if (playersResult.error) {
        throw playersResult.error;
      }

      const playersData = playersResult.data || [];
      setPlayers(playersData);
      setFilteredPlayers(playersData);
      
    } catch (err: any) {
      console.error('Error reloading players:', err);
      setError(err.message || 'Error recargando jugadores');
    }
  }, [currentUser.rol, currentUser.escuela_id]);

  // EFECTO PRINCIPAL - SE EJECUTA UNA SOLA VEZ AL MONTAR
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar categorías y escuelas en paralelo
        const [categoriasResult, escuelasResult, paisesResult] = await Promise.all([
          getCategorias(),
          getEscuelas(),
          getPaises()
        ]);

        if (categoriasResult.error) throw categoriasResult.error;
        if (escuelasResult.error) throw escuelasResult.error;
        if (paisesResult.error) throw paisesResult.error;

        setCategorias(categoriasResult.data || []);
        setEscuelas(escuelasResult.data || []);
        
        const paisesData = paisesResult.data || [];
        setPaises(paisesData);

        // Configurar Colombia por defecto
        const colombia = paisesData.find(p => p.nombre === 'Colombia');
        if (colombia) {
          setSelectedPaisId(colombia.id);
          setNewPlayer(prev => ({ ...prev, pais: colombia.nombre }));
          
          // Cargar departamentos de Colombia
          const departamentosResult = await getDepartamentosByPais(colombia.id);
          if (!departamentosResult.error) {
            setDepartamentos(departamentosResult.data || []);
          }
        }

        // Cargar jugadores
        await reloadPlayers();

      } catch (err: any) {
        console.error('Error loading initial data:', err);
        setError(err.message || 'Error cargando datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [currentUser.rol, currentUser.escuela_id, reloadPlayers]);

  // Filtrar jugadores
  useEffect(() => {
    const filtered = players.filter(player => {
      const matchesSearch = searchTerm === '' || 
        `${player.nombre} ${player.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.documento.includes(searchTerm);
      
      const matchesCategory = !selectedCategory || player.categoria_id === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    setFilteredPlayers(filtered);
  }, [searchTerm, players, selectedCategory]);

  // Handlers para el Header
  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  const handleToggleHamburgerMenu = useCallback(() => {
    setShowHamburgerMenu(!showHamburgerMenu);
  }, [showHamburgerMenu]);

  const handleViewProfile = useCallback(async () => {
    setShowHamburgerMenu(false);
    await loadUserProfile();
    setShowProfileModal(true);
  }, []);

  const handleAddPlayer = useCallback(() => {
    setShowHamburgerMenu(false);
    setShowAddModal(true);
  }, []);

  // Handlers para el Sidebar
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
  }, []);

  const handleClearCategory = useCallback(() => {
    setSelectedCategory('');
    setShowCategoryDropdown(false);
  }, []);

  const handleToggleCategoryDropdown = useCallback(() => {
    setShowCategoryDropdown(!showCategoryDropdown);
  }, [showCategoryDropdown]);

  const handlePlayerClick = useCallback((player: Jugador) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  }, []);

  // Función para cargar el perfil del usuario
  const loadUserProfile = useCallback(async () => {
    try {
      const result = await getUserProfile();
      if (result?.data) {
        setUserProfile(result.data);
      }
    } catch (error) {
      console.error('Error cargando perfil de usuario:', error);
      setError('Error al cargar el perfil');
    }
  }, []);

  // Función para manejar cambios en inputs
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'pais') {
      const selectedPais = paises.find(p => p.nombre === value);
      if (selectedPais) {
        setSelectedPaisId(selectedPais.id);
        setSelectedDepartamentoId('');
        setCiudades([]);
        loadDepartamentosByPais(selectedPais.id);
        setNewPlayer(prev => ({
          ...prev,
          [name]: value,
          departamento: '',
          ciudad: ''
        }));
      }
    } else if (name === 'departamento') {
      const selectedDepartamento = departamentos.find(d => d.nombre === value);
      if (selectedDepartamento) {
        setSelectedDepartamentoId(selectedDepartamento.id);
        loadCiudadesByDepartamento(selectedDepartamento.id);
        setNewPlayer(prev => ({
          ...prev,
          [name]: value,
          ciudad: ''
        }));
      }
    } else {
      setNewPlayer(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, [paises, departamentos]);

  // Funciones de carga de ubicaciones
  const loadDepartamentosByPais = useCallback(async (paisId: string) => {
    try {
      const result = await getDepartamentosByPais(paisId);
      if (result.error) throw result.error;
      
      const departamentosData = result.data || [];
      setDepartamentos(departamentosData);
      setCiudades([]);
      setSelectedDepartamentoId('');
      setNewPlayer(prev => ({ ...prev, departamento: '', ciudad: '' }));
      
    } catch (err: any) {
      console.error('Error loading departamentos:', err);
      setError('Error cargando departamentos');
    }
  }, []);

  const loadCiudadesByDepartamento = useCallback(async (departamentoId: string) => {
    try {
      const result = await getCiudadesByDepartamento(departamentoId);
      if (result.error) throw result.error;
      
      const ciudadesData = result.data || [];
      setCiudades(ciudadesData);
      setNewPlayer(prev => ({ ...prev, ciudad: '' }));
      
    } catch (err: any) {
      console.error('Error loading ciudades:', err);
      setError('Error cargando ciudades');
    }
  }, []);

  // Funciones de carga de ubicaciones para edición
  const loadEditDepartamentosByPais = useCallback(async (paisId: string) => {
    try {
      const result = await getDepartamentosByPais(paisId);
      if (result.error) throw result.error;
      
      const departamentosData = result.data || [];
      setEditDepartamentos(departamentosData);
      setEditCiudades([]);
      setEditSelectedDepartamentoId('');
      
    } catch (err: any) {
      console.error('Error loading edit departamentos:', err);
    }
  }, []);

  const loadEditCiudadesByDepartamento = useCallback(async (departamentoId: string) => {
    try {
      const result = await getCiudadesByDepartamento(departamentoId);
      if (result.error) throw result.error;
      
      const ciudadesData = result.data || [];
      setEditCiudades(ciudadesData);
      
    } catch (err: any) {
      console.error('Error loading edit ciudades:', err);
    }
  }, []);

  // Función para resetear formulario
  const resetPlayerForm = useCallback(() => {
    setNewPlayer(initialPlayerState);
    setSelectedPaisId('');
    setSelectedDepartamentoId('');
    setDepartamentos([]);
    setCiudades([]);
    resetFiles();
    setError(null);
  }, [initialPlayerState, resetFiles]);

  // Función para agregar jugador con archivos
  const handleAddPlayerSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsProcessing(true);
      setProcessingMessage('Creando jugador...');
      setError(null);
      
      // Validar campos requeridos
      if (!newPlayer.documento || !newPlayer.nombre || !newPlayer.apellido || 
          !newPlayer.fecha_nacimiento || !newPlayer.pais || !newPlayer.departamento || 
          !newPlayer.ciudad || !newPlayer.categoria_id || !newPlayer.escuela_id || !newPlayer.eps) {
        setError('Todos los campos son obligatorios');
        return;
      }

      // Validar que al menos la foto esté seleccionada
      if (!files.foto_perfil) {
        setError('La foto de perfil es obligatoria');
        return;
      }

      // Subir archivos
      const uploadResults = await uploadFiles(newPlayer.documento);
      
      if (!uploadResults) {
        return;
      }

      // Crear datos del jugador con URLs de archivos
      const playerData = {
        documento: newPlayer.documento,
        nombre: newPlayer.nombre,
        apellido: newPlayer.apellido,
        fecha_nacimiento: newPlayer.fecha_nacimiento,
        pais: newPlayer.pais,
        departamento: newPlayer.departamento,
        ciudad: newPlayer.ciudad,
        categoria_id: newPlayer.categoria_id,
        escuela_id: newPlayer.escuela_id,
        eps: newPlayer.eps,
        tipo_eps: newPlayer.tipo_eps || 'Subsidiado',
        foto_perfil_url: uploadResults.foto_perfil_url,
        documento_pdf_url: uploadResults.documento_pdf_url,
        registro_civil_url: uploadResults.registro_civil_url
      };

      const result = await createJugador(playerData);
      
      if (result.error) {
        const error = result.error as any;
        if (error.code === '23505') {
          setError('Ya existe un jugador con este documento');
        } else {
          setError(`Error: ${error.message || 'Error agregando jugador'}`);
        }
        return;
      }

      await reloadPlayers();
      setShowAddModal(false);
      resetPlayerForm();
      
    } catch (err: any) {
      console.error('Error adding player with files:', err);
      setError(err.message || 'Error agregando jugador');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  }, [newPlayer, files, uploadFiles, reloadPlayers, resetPlayerForm]);

  // Función para manejar cambios en edición
  const handleEditInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (!selectedPlayer) return;

    setSelectedPlayer(prev => prev ? { ...prev, [name]: value } : null);

    if (name === 'pais') {
      const selectedPais = editPaises.find(p => p.nombre === value);
      if (selectedPais) {
        setEditSelectedPaisId(selectedPais.id);
        setEditSelectedDepartamentoId('');
        setEditCiudades([]);
        await loadEditDepartamentosByPais(selectedPais.id);
        setSelectedPlayer(prev => prev ? {
          ...prev,
          pais: value,
          departamento: '',
          ciudad: ''
        } : null);
      }
    } else if (name === 'departamento') {
      const selectedDepartamento = editDepartamentos.find(d => d.nombre === value);
      if (selectedDepartamento) {
        setEditSelectedDepartamentoId(selectedDepartamento.id);
        await loadEditCiudadesByDepartamento(selectedDepartamento.id);
        setSelectedPlayer(prev => prev ? {
          ...prev,
          departamento: value,
          ciudad: ''
        } : null);
      }
    }
  }, [selectedPlayer, editPaises, editDepartamentos, loadEditDepartamentosByPais, loadEditCiudadesByDepartamento]);

  // Función para abrir modal del jugador
  const handlePlayerClickDetailed = useCallback(async (player: Jugador) => {
    setSelectedPlayer({...player});
    setOriginalPlayer({...player});
    setShowPlayerModal(true);
    setIsEditing(false);
    
    // Cargar países para edición
    const paisesResult = await getPaises();
    if (!paisesResult.error) {
      setEditPaises(paisesResult.data || []);
      
      // Si el jugador tiene país, configurar ubicaciones
      if (player.pais) {
        const paisData = paisesResult.data?.find(p => p.nombre === player.pais);
        if (paisData) {
          setEditSelectedPaisId(paisData.id);
          await loadEditDepartamentosByPais(paisData.id);
          
          if (player.departamento) {
            const deptosResult = await getDepartamentosByPais(paisData.id);
            if (!deptosResult.error) {
              const deptoData = deptosResult.data?.find(d => d.nombre === player.departamento);
              if (deptoData) {
                setEditSelectedDepartamentoId(deptoData.id);
                await loadEditCiudadesByDepartamento(deptoData.id);
              }
            }
          }
        }
      }
    }
  }, [loadEditDepartamentosByPais, loadEditCiudadesByDepartamento]);

  // Función para actualizar jugador
  const handleUpdatePlayer = useCallback(async () => {
    if (!selectedPlayer || !originalPlayer) return;

    try {
      setIsSaving(true);
      setError(null);
      
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
      
      await reloadPlayers();
      setOriginalPlayer({...selectedPlayer});
      setIsEditing(false);
      
    } catch (err: any) {
      console.error('Error updating player:', err);
      setError(err.message || 'Error actualizando jugador');
    } finally {
      setIsSaving(false);
    }
  }, [selectedPlayer, originalPlayer, reloadPlayers]);

  // Función para cancelar edición
  const handleCancelEdit = useCallback(() => {
    if (originalPlayer) {
      setSelectedPlayer({...originalPlayer});
    }
    setIsEditing(false);
    setError(null);
  }, [originalPlayer]);

  // Función para eliminar jugador
  const handleDeletePlayer = useCallback(async (playerId: string) => {
    if (!selectedPlayer) {
      setError('No se ha seleccionado ningún jugador');
      return;
    }
    
    const playerName = `${selectedPlayer.nombre} ${selectedPlayer.apellido}`;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${playerName}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    
    try {
      setIsSaving(true);
      const result = await deleteJugador(playerId, true);
      
      if (result.error) {
        const error = result.error as any;
        if (error.code === '23503') {
          setError('No se puede eliminar el jugador porque tiene registros relacionados');
        } else {
          setError(`Error eliminando jugador: ${error.message || 'Error desconocido'}`);
        }
        return;
      }
      
      await reloadPlayers();
      setShowPlayerModal(false);
      setSelectedPlayer(null);
      setOriginalPlayer(null);
      
    } catch (err: any) {
      console.error('Error deleting player:', err);
      setError(err.message || 'Error eliminando jugador');
    } finally {
      setIsSaving(false);
    }
  }, [selectedPlayer, reloadPlayers]);

  // Función para manejar la apertura de documentos
  const handleDocumentOpen = useCallback((url: string, filename: string) => {
    setDocumentOpened(true);
    
    const newWindow = window.open('', '_blank');
    
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { margin: 0; padding: 20px; background: #f5f5f5; }
              .container { max-width: 100%; height: 100vh; }
              iframe { width: 100%; height: 100%; border: none; }
              .header { padding: 10px; background: #fff; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
              .btn { padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: button; }
            </style>
          </head>
          <body>
            <div class="header">
              <h4>${filename}</h4>
              <button class="btn" onclick="window.close()">Cerrar</button>
            </div>
            <div class="container">
              <iframe src="${url}" title="${filename}"></iframe>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.focus();
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    setTimeout(() => {
      setDocumentOpened(false);
    }, 500);
  }, []);

  // Función para cerrar modal del jugador
  const closePlayerModal = useCallback(async () => {
    if (isProcessing) {
      const confirmed = window.confirm('Hay una operación en progreso. ¿Estás seguro de que deseas cerrar?');
      if (!confirmed) return;
    }
    
    if (documentOpened) {
      setDocumentOpened(false);
    }
    
    setIsProcessing(false);
    setProcessingMessage('');
    
    setShowPlayerModal(false);
    setSelectedPlayer(null);
    setOriginalPlayer(null);
    setIsEditing(false);
    setEditSelectedPaisId('');
    setEditSelectedDepartamentoId('');
    setEditDepartamentos([]);
    setEditCiudades([]);
    setError(null);
  }, [isProcessing, documentOpened]);

  // Función para cerrar modal de agregar jugador
  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    resetPlayerForm();
  }, [resetPlayerForm]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('category-dropdown');
      const button = document.getElementById('category-button');
      const hamburgerMenu = hamburgerMenuRef.current;
      
      if (dropdown && button && 
          !dropdown.contains(event.target as Node) && 
          !button.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      
      // Cerrar menú hamburguesa si se hace clic fuera
      if (hamburgerMenu && showHamburgerMenu && !hamburgerMenu.contains(event.target as Node)) {
        setShowHamburgerMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHamburgerMenu]);

  // Loading state
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
      <CoachHeader
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        showHamburgerMenu={showHamburgerMenu}
        onToggleDarkMode={handleToggleDarkMode}
        onToggleHamburgerMenu={handleToggleHamburgerMenu}
        onViewProfile={handleViewProfile}
        onAddPlayer={handleAddPlayer}
        onLogout={onLogout}
        hamburgerMenuRef={hamburgerMenuRef}
      />

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

      {isProcessing && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="bg-white rounded p-4 text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Procesando...</span>
            </div>
            <p className="mb-0">{processingMessage}</p>
          </div>
        </div>
      )}

      <div className="dashboard-body">
        <div className="container-fluid h-100">
          <div className="row h-100">
            <div className="col-lg-4 col-xl-3">
              <CoachSidebar
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                showCategoryDropdown={showCategoryDropdown}
                players={players}
                filteredPlayers={filteredPlayers}
                categorias={categorias}
                currentUser={currentUser}
                loading={loading}
                onSearchChange={handleSearchChange}
                onCategorySelect={handleCategorySelect}
                onClearCategory={handleClearCategory}
                onToggleCategoryDropdown={handleToggleCategoryDropdown}
                onPlayerClick={handlePlayerClickDetailed}
              />
            </div>

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
                        onChange={(e) => setSelectedDocument(e.target.value)}
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
                            onClick={() => searchResult.player && handlePlayerClickDetailed(searchResult.player)}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileModal
        show={showProfileModal}
        userProfile={userProfile}
        onClose={() => setShowProfileModal(false)}
      />

      <AddPlayerModal
        show={showAddModal}
        newPlayer={newPlayer}
        paises={paises}
        departamentos={departamentos}
        ciudades={ciudades}
        categorias={categorias}
        escuelas={escuelas}
        selectedPaisId={selectedPaisId}
        selectedDepartamentoId={selectedDepartamentoId}
        currentUser={currentUser}
        isUploading={isProcessing}
        fileErrors={fileErrors}
        onClose={closeAddModal}
        onSubmit={handleAddPlayerSubmit}
        onInputChange={handleInputChange}
        onFileSelect={handleFileSelect}
        onLoadDepartamentos={loadDepartamentosByPais}
        onLoadCiudades={loadCiudadesByDepartamento}
      />

      {showPlayerModal && selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          originalPlayer={originalPlayer}
          isEditing={isEditing}
          isSaving={isSaving}
          documentOpened={documentOpened}
          categorias={categorias}
          escuelas={escuelas}
          paises={paises}
          departamentos={departamentos}
          ciudades={ciudades}
          editPaises={editPaises}
          editDepartamentos={editDepartamentos}
          editCiudades={editCiudades}
          editSelectedPaisId={editSelectedPaisId}
          editSelectedDepartamentoId={editSelectedDepartamentoId}
          onClose={closePlayerModal}
          onEdit={() => setIsEditing(true)}
          onSave={handleUpdatePlayer}
          onCancelEdit={handleCancelEdit}
          onDelete={handleDeletePlayer}
          onInputChange={handleEditInputChange}
          onPrint={() => {/* TODO: Implementar print */}}
          onDownloadID={() => {/* TODO: Implementar download ID */}}
          onDownloadRegister={() => {/* TODO: Implementar download register */}}
          onDocumentOpen={handleDocumentOpen}
          onLoadEditDepartamentos={loadEditDepartamentosByPais}
          onLoadEditCiudades={loadEditCiudadesByDepartamento}
        />
      )}
    </div>
  );
};

export default Dashboard;