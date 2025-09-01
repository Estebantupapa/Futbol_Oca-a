//Dashboard.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import FileUpload from './fileUpload';
import { 
  getAllJugadores, 
  getJugadoresByEscuela, 
  getCategorias, 
  getEscuelas, 
  createJugador,
  updateJugador,
  deleteJugador,
  getPaises,
  getDepartamentosByPais,
  getCiudadesByDepartamento,
  uploadPlayerFiles,
  PlayerFiles,
  Usuario,
  Jugador,
  Categoria,
  Escuela,
  JugadorInsert,
  Pais,
  Departamento,
  Ciudad
} from '../supabaseClient';

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
  
  // Estados para ubicaciones del modal de edición
  const [editPaises, setEditPaises] = useState<Pais[]>([]);
  const [editDepartamentos, setEditDepartamentos] = useState<Departamento[]>([]);
  const [editCiudades, setEditCiudades] = useState<Ciudad[]>([]);
  const [editSelectedPaisId, setEditSelectedPaisId] = useState<string>('');
  const [editSelectedDepartamentoId, setEditSelectedDepartamentoId] = useState<string>('');
  
  // Estados para archivos
  const [selectedFiles, setSelectedFiles] = useState<PlayerFiles>({});
  const [fileErrors, setFileErrors] = useState<{[key: string]: string}>({});
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Jugador | null>(null);
  const [originalPlayer, setOriginalPlayer] = useState<Jugador | null>(null);
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
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado inicial del nuevo jugador - ESTABILIZADO
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

  const [newPlayer, setNewPlayer] = useState<Partial<JugadorInsert>>(initialPlayerState);

  // FUNCIÓN PARA RECARGAR PLAYERS - SIN DEPENDENCIAS PARA EVITAR LOOPS
  const reloadPlayers = useCallback(async () => {
    console.log('=== RELOADING PLAYERS ===');
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
      
      console.log('Players reloaded successfully:', playersData.length);
      
    } catch (err: any) {
      console.error('Error reloading players:', err);
      setError(err.message || 'Error recargando jugadores');
    }
  }, []); // Sin dependencias para evitar loops

  // EFECTO PRINCIPAL - SE EJECUTA UNA SOLA VEZ AL MONTAR
  useEffect(() => {
    console.log('=== DASHBOARD MOUNTING - INITIALIZING DATA ===');
    
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

        // Cargar jugadores DIRECTAMENTE aquí para evitar dependencias
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

        console.log('Initial data loaded successfully');

      } catch (err: any) {
        console.error('Error loading initial data:', err);
        setError(err.message || 'Error cargando datos iniciales');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []); // Solo se ejecuta una vez al montar

  // Filtrar jugadores - SOLO cuando cambien las dependencias necesarias
  useEffect(() => {
    let filtered = players.filter(player =>
      `${player.nombre} ${player.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.documento.includes(searchTerm)
    );

    if (selectedCategory) {
      filtered = filtered.filter(player => player.categoria_id === selectedCategory);
    }

    setFilteredPlayers(filtered);
  }, [searchTerm, players, selectedCategory]);

  // Cerrar dropdown - SOLO una vez
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('category-dropdown');
      const button = document.getElementById('category-button');
      
      if (dropdown && button && 
          !dropdown.contains(event.target as Node) && 
          !button.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Funciones de carga de ubicaciones - ESTABLES
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

  // Funciones de manejo de archivos
  const handleFileSelect = useCallback((fileType: keyof PlayerFiles, file: File | null) => {
    setSelectedFiles(prev => ({
      ...prev,
      [fileType]: file
    }));
    
    // Limpiar error si se selecciona un archivo válido
    if (file && fileErrors[fileType]) {
      setFileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fileType];
        return newErrors;
      });
    }
  }, [fileErrors]);

  // Funciones de manejo - ESTABLES
  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
  }, []);

  const clearCategoryFilter = useCallback(() => {
    setSelectedCategory('');
    setShowCategoryDropdown(false);
  }, []);

  const toggleCategoryDropdown = useCallback(() => {
    setShowCategoryDropdown(!showCategoryDropdown);
  }, [showCategoryDropdown]);

  const getSelectedCategoryName = useCallback(() => {
    if (!selectedCategory) return 'Todas las categorías';
    const category = categorias.find(cat => cat.id === selectedCategory);
    return category?.nombre || 'Categoría desconocida';
  }, [selectedCategory, categorias]);

  const handleDocumentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [players]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  // Función para abrir modal del jugador - OPTIMIZADA
  const handlePlayerClick = useCallback(async (player: Jugador) => {
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

  const closePlayerModal = useCallback(() => {
    setShowPlayerModal(false);
    setSelectedPlayer(null);
    setOriginalPlayer(null);
    setIsEditing(false);
    setEditSelectedPaisId('');
    setEditSelectedDepartamentoId('');
    setEditDepartamentos([]);
    setEditCiudades([]);
    setError(null);
  }, []);

  // Función para manejar cambios en inputs - OPTIMIZADA
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
  }, [paises, departamentos, loadDepartamentosByPais, loadCiudadesByDepartamento]);

  // Función para manejar cambios en edición - OPTIMIZADA
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

  // Función para resetear formulario - ESTABLE CON ARCHIVOS
  const resetPlayerForm = useCallback(() => {
    setNewPlayer(initialPlayerState);
    setSelectedPaisId('');
    setSelectedDepartamentoId('');
    setDepartamentos([]);
    setCiudades([]);
    setSelectedFiles({});
    setFileErrors({});
    setError(null);
  }, [initialPlayerState]);

  // Función para agregar jugador con archivos - OPTIMIZADA
  const handleAddPlayer = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUploadingFiles(true);
      setError(null);
      
      // Validar campos requeridos
      if (!newPlayer.documento || !newPlayer.nombre || !newPlayer.apellido || 
          !newPlayer.fecha_nacimiento || !newPlayer.pais || !newPlayer.departamento || 
          !newPlayer.ciudad || !newPlayer.categoria_id || !newPlayer.escuela_id || !newPlayer.eps) {
        setError('Todos los campos son obligatorios');
        return;
      }

      // Validar que al menos la foto esté seleccionada
      if (!selectedFiles.foto_perfil) {
        setError('La foto de perfil es obligatoria');
        return;
      }

      console.log('Creating player with files...');
      
      // Subir archivos
      const uploadResults = await uploadPlayerFiles(selectedFiles, newPlayer.documento);
      
      if (uploadResults.errors.length > 0) {
        setError(`Errores al subir archivos: ${uploadResults.errors.join(', ')}`);
        return;
      }

      // Crear datos del jugador con URLs de archivos
      const playerData: JugadorInsert = {
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

      // USAR reloadPlayers PARA RECARGAR
      await reloadPlayers();
      setShowAddModal(false);
      resetPlayerForm();
      
      console.log('Player created successfully');
      
    } catch (err: any) {
      console.error('Error adding player with files:', err);
      setError(err.message || 'Error agregando jugador');
    } finally {
      setIsUploadingFiles(false);
    }
  }, [newPlayer, selectedFiles, reloadPlayers, resetPlayerForm]);

  // Función para actualizar jugador - OPTIMIZADA
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
      
      // USAR reloadPlayers PARA RECARGAR
      await reloadPlayers();
      setOriginalPlayer({...selectedPlayer});
      setIsEditing(false);
      
      console.log('Player updated successfully');
      
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

  // Función para eliminar jugador - OPTIMIZADA
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
      
      // USAR reloadPlayers PARA RECARGAR
      await reloadPlayers();
      closePlayerModal();
      
      console.log('Player deleted successfully');
      
    } catch (err: any) {
      console.error('Error deleting player:', err);
      setError(err.message || 'Error eliminando jugador');
    } finally {
      setIsSaving(false);
    }
  }, [selectedPlayer, reloadPlayers, closePlayerModal]);

  // Funciones de utilidad
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  }, []);

  const calculateAge = useCallback((birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }, []);

  // FUNCIONES PARA LOS BOTONES

  // Función para imprimir
  const handlePrint = useCallback(() => {
    if (!selectedPlayer) return;
    
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50;">Corporación de Futbol Oceañero</h1>
          <h2 style="color: #34495e;">Información del Jugador</h2>
        </div>
        
        <div style="display: flex; gap: 30px; margin-bottom: 30px;">
          <div style="flex: 1;">
            ${selectedPlayer.foto_perfil_url ? 
              `<img src="${selectedPlayer.foto_perfil_url}" alt="Foto del jugador" style="width: 200px; height: 200px; object-fit: cover; border-radius: 10px; border: 2px solid #ddd;">` :
              `<div style="width: 200px; height: 200px; background: #f0f0f0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 60px; color: #999;">👤</div>`
            }
          </div>
          <div style="flex: 2;">
            <h3 style="color: #2c3e50; margin-bottom: 20px;">${selectedPlayer.nombre} ${selectedPlayer.apellido}</h3>
            <p><strong>Documento:</strong> ${selectedPlayer.documento}</p>
            <p><strong>Edad:</strong> ${calculateAge(selectedPlayer.fecha_nacimiento)} años</p>
            <p><strong>Fecha de Nacimiento:</strong> ${formatDate(selectedPlayer.fecha_nacimiento)}</p>
            <p><strong>Categoría:</strong> ${selectedPlayer.categoria?.nombre || 'Sin categoría'}</p>
            <p><strong>Escuela:</strong> ${selectedPlayer.escuela?.nombre || 'Sin escuela'}</p>
          </div>
        </div>
        
        <div style="border-top: 2px solid #eee; padding-top: 20px;">
          <h4 style="color: #2c3e50; margin-bottom: 15px;">Información de Ubicación</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
            <div><strong>País:</strong><br>${selectedPlayer.pais}</div>
            <div><strong>Departamento:</strong><br>${selectedPlayer.departamento}</div>
            <div><strong>Ciudad:</strong><br>${selectedPlayer.ciudad}</div>
          </div>
        </div>
        
        <div style="border-top: 2px solid #eee; padding-top: 20px; margin-top: 20px;">
          <h4 style="color: #2c3e50; margin-bottom: 15px;">Información Médica</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div><strong>EPS:</strong><br>${selectedPlayer.eps}</div>
            <div><strong>Tipo de EPS:</strong><br>${selectedPlayer.tipo_eps}</div>
          </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 12px;">
          <p>Documento generado el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Información del Jugador - ${selectedPlayer.nombre} ${selectedPlayer.apellido}</title>
            <style>
              @media print {
                body { margin: 0; }
                @page { margin: 1cm; }
              }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }, [selectedPlayer]);

  // Función para generar PDF de identificación
  const handleDownloadID = useCallback(async () => {
    if (!selectedPlayer) return;

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      pdf.setFont('helvetica');
      
      // Header
      pdf.setFillColor(52, 152, 219);
      pdf.rect(0, 0, 210, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text('CORPORACIÓN DE FUTBOL OCEAÑERO', 105, 12, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('IDENTIFICACIÓN DE JUGADOR', 105, 20, { align: 'center' });

      pdf.setTextColor(0, 0, 0);
      let yPosition = 40;
      
      // Información del jugador
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${selectedPlayer.nombre} ${selectedPlayer.apellido}`, 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Documento: ${selectedPlayer.documento}`, 20, yPosition);
      
      yPosition += 8;
      pdf.text(`Edad: ${calculateAge(selectedPlayer.fecha_nacimiento)} años`, 20, yPosition);
      
      yPosition += 8;
      pdf.text(`Fecha de Nacimiento: ${formatDate(selectedPlayer.fecha_nacimiento)}`, 20, yPosition);
      
      yPosition += 15;
      
      // Ubicación
      pdf.setFont('helvetica', 'bold');
      pdf.text('UBICACIÓN:', 20, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`País: ${selectedPlayer.pais}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Departamento: ${selectedPlayer.departamento}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Ciudad: ${selectedPlayer.ciudad}`, 20, yPosition);
      
      yPosition += 15;
      
      // Información deportiva
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMACIÓN DEPORTIVA:', 20, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Categoría: ${selectedPlayer.categoria?.nombre || 'Sin categoría'}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Escuela: ${selectedPlayer.escuela?.nombre || 'Sin escuela'}`, 20, yPosition);
      
      yPosition += 15;
      
      // Información médica
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMACIÓN MÉDICA:', 20, yPosition);
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`EPS: ${selectedPlayer.eps}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Tipo de EPS: ${selectedPlayer.tipo_eps}`, 20, yPosition);

      // Agregar foto si existe
      if (selectedPlayer.foto_perfil_url) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve) => {
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const maxWidth = 40;
                const maxHeight = 50;
                
                canvas.width = maxWidth;
                canvas.height = maxHeight;
                
                if (ctx) {
                  ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
                  const imgData = canvas.toDataURL('image/jpeg', 0.8);
                  pdf.addImage(imgData, 'JPEG', 150, 35, maxWidth, maxHeight);
                }
                resolve(true);
              } catch (err) {
                console.warn('Error procesando imagen:', err);
                resolve(false);
              }
            };
            img.onerror = () => resolve(false);
            img.src = selectedPlayer.foto_perfil_url!;
          });
        } catch (err) {
          console.warn('Error cargando imagen:', err);
        }
      }

      // Footer
      const now = new Date();
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generado el ${now.toLocaleDateString('es-CO')} a las ${now.toLocaleTimeString('es-CO')}`, 105, 280, { align: 'center' });

      const filename = `ID_${selectedPlayer.nombre}_${selectedPlayer.apellido}_${selectedPlayer.documento}.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('Error generando el PDF de identificación');
    }
  }, [selectedPlayer]);

  // Función para descargar registro
  const handleDownloadRegister = useCallback(() => {
    if (!selectedPlayer) return;

    if (selectedPlayer.registro_civil_url) {
      const link = document.createElement('a');
      link.href = selectedPlayer.registro_civil_url;
      link.download = `Registro_Civil_${selectedPlayer.nombre}_${selectedPlayer.apellido}_${selectedPlayer.documento}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (selectedPlayer.documento_pdf_url) {
      const link = document.createElement('a');
      link.href = selectedPlayer.documento_pdf_url;
      link.download = `Documento_${selectedPlayer.nombre}_${selectedPlayer.apellido}_${selectedPlayer.documento}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setError('No hay documentos disponibles para descargar');
    }
  }, [selectedPlayer]);

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

  // RENDER PRINCIPAL
  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : ''}`}>
      {/* Header */}
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

      {/* Error Alert */}
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
                    {/* Botón de categorías */}
                    <div className="position-relative me-2">
                      <button 
                        id="category-button"
                        className={`btn btn-outline-secondary btn-sm d-flex align-items-center ${selectedCategory ? 'btn-primary text-white' : ''}`}
                        onClick={toggleCategoryDropdown}
                        title="Filtrar por categoría"
                      >
                        <span className="me-1">📋</span>
                        <span className="d-none d-md-inline">
                          {selectedCategory ? '✓' : ''}
                        </span>
                      </button>
                      
                      {showCategoryDropdown && (
                        <div 
                          id="category-dropdown"
                          className="position-absolute bg-white border rounded shadow-sm mt-1"
                          style={{ 
                            zIndex: 1000, 
                            minWidth: '200px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            left: 0
                          }}
                        >
                          <div className="p-2">
                            <div className="fw-bold mb-2 text-muted small">Filtrar por categoría:</div>
                            
                            <button
                              className={`btn btn-sm w-100 mb-1 text-start ${!selectedCategory ? 'btn-primary' : 'btn-outline-secondary'}`}
                              onClick={clearCategoryFilter}
                            >
                              <span className="me-2">🏆</span>
                              Todas las categorías
                              {!selectedCategory && <span className="float-end">✓</span>}
                            </button>
                            
                            {categorias.map(categoria => (
                              <button
                                key={categoria.id}
                                className={`btn btn-sm w-100 mb-1 text-start ${
                                  selectedCategory === categoria.id ? 'btn-primary' : 'btn-outline-secondary'
                                }`}
                                onClick={() => handleCategorySelect(categoria.id)}
                              >
                                <span className="me-2">⚽</span>
                                {categoria.nombre}
                                {selectedCategory === categoria.id && <span className="float-end">✓</span>}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Barra de búsqueda */}
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
                  
                  {/* Mostrar filtro activo */}
                  {selectedCategory && (
                    <div className="mb-3">
                      <span className="badge bg-primary d-flex align-items-center justify-content-between">
                        <span>📋 {getSelectedCategoryName()}</span>
                        <button 
                          className="btn btn-sm p-0 ms-2 text-white border-0 bg-transparent"
                          onClick={clearCategoryFilter}
                          style={{ fontSize: '12px', lineHeight: '1' }}
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  )}
                  
                  {/* Estadísticas rápidas */}
                  <div className="stats-section mb-3">
                    <div className="small text-muted">
                      {selectedCategory || searchTerm ? (
                        <>
                          Mostrando: <strong>{filteredPlayers.length}</strong> de {players.length}
                          {selectedCategory && (
                            <div className="mt-1">
                              Categoría: <strong>{getSelectedCategoryName()}</strong>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          Total jugadores: <strong>{filteredPlayers.length}</strong>
                          {currentUser.rol === 'admin' && (
                            <span> de {players.length}</span>
                          )}
                        </>
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
                        {player.foto_perfil_url ? (
                          <img 
                            src={player.foto_perfil_url} 
                            alt={`${player.nombre} ${player.apellido}`}
                            className="avatar-image"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        <div className="avatar-placeholder" style={player.foto_perfil_url ? {display: 'none'} : {}}>
                          👤
                        </div>
                      </div>
                      <div className="player-info">
                        <div className="player-document">{player.documento}</div>
                        <div className="player-name">{player.nombre} {player.apellido}</div>
                        <div className="player-category">
                          <small className="text-muted">
                            {player.categoria?.nombre}
                            {selectedCategory && selectedCategory === player.categoria_id && (
                              <span className="ms-1 text-primary">📋</span>
                            )}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredPlayers.length === 0 && !loading && (
                    <div className="text-center py-4">
                      <div className="text-muted">
                        {selectedCategory || searchTerm ? 
                          'No se encontraron jugadores con los filtros aplicados' : 
                          (searchTerm ? 'No se encontraron jugadores' : 'No hay jugadores registrados')
                        }
                        {(selectedCategory || searchTerm) && (
                          <div className="mt-2">
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                clearSearch();
                                clearCategoryFilter();
                              }}
                            >
                              Limpiar filtros
                            </button>
                          </div>
                        )}
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
                      
                      {/* Estadísticas por categoría */}
                      {categorias.length > 0 && (
                        <div className="mt-4">
                          <h6>Jugadores por Categoría</h6>
                          <div className="row">
                            {categorias.map(categoria => {
                              const count = players.filter(p => p.categoria_id === categoria.id).length;
                              return (
                                <div key={categoria.id} className="col-md-6 col-lg-4 mb-2">
                                  <div className="small-stat-card">
                                    <span className="category-name">{categoria.nombre}</span>
                                    <span className="category-count badge bg-primary ms-2">{count}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
              <h3 className="modal-title">
                INFORMACIÓN DEL JUGADOR
                {isSaving && (
                  <span className="ms-2">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Guardando...</span>
                    </div>
                  </span>
                )}
              </h3>
              <div className="d-flex align-items-center">
                {!isEditing ? (
                  <button 
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setIsEditing(true)}
                    disabled={isSaving}
                  >
                    ✏️ Editar
                  </button>
                ) : (
                  <>
                    <button 
                      className="btn btn-sm btn-success me-2"
                      onClick={handleUpdatePlayer}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Guardando...
                        </>
                      ) : (
                        <>💾 Guardar</>
                      )}
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary me-2"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      ✕ Cancelar
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-sm btn-danger me-2"
                  onClick={() => handleDeletePlayer(selectedPlayer.id)}
                  disabled={isSaving}
                >
                  🗑️ Eliminar
                </button>
                <button 
                  className="close-button" 
                  onClick={closePlayerModal}
                  disabled={isSaving}
                >
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
                      {selectedPlayer.foto_perfil_url ? (
                        <img 
                          src={selectedPlayer.foto_perfil_url} 
                          alt={`${selectedPlayer.nombre} ${selectedPlayer.apellido}`}
                          className="player-photo"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div 
                        className="player-photo-placeholder" 
                        style={selectedPlayer.foto_perfil_url ? {display: 'none'} : {}}
                      >
                        👤
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">
                          Edad: {calculateAge(selectedPlayer.fecha_nacimiento)} años
                        </small>
                      </div>
                      {isEditing && (
                        <div className="mt-2">
                          <small className="text-info">
                            💡 Recuerda guardar los cambios
                          </small>
                        </div>
                      )}
                    </div>

                    {/* Sección de documentos */}
                    <div className="documents-section mt-4">
                      <h5>DOCUMENTOS</h5>
                      <div className="document-links">
                        {selectedPlayer.documento_pdf_url && (
                          <div className="document-item mb-2">
                            <a 
                              href={selectedPlayer.documento_pdf_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary w-100"
                            >
                              📄 Ver Documento de Identidad
                            </a>
                          </div>
                        )}
                        {selectedPlayer.registro_civil_url && (
                          <div className="document-item mb-2">
                            <a 
                              href={selectedPlayer.registro_civil_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-secondary w-100"
                            >
                              📋 Ver Registro Civil
                            </a>
                          </div>
                        )}
                        {!selectedPlayer.documento_pdf_url && !selectedPlayer.registro_civil_url && (
                          <small className="text-muted">No hay documentos disponibles</small>
                        )}
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
                      <small className="text-muted">El documento no se puede modificar</small>
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
                          {isEditing ? (
                            <select
                              name="pais"
                              value={selectedPlayer.pais}
                              onChange={handleEditInputChange}
                              className="form-control"
                            >
                              <option value="">Seleccione un país</option>
                              {editPaises.map(pais => (
                                <option key={pais.id} value={pais.nombre}>{pais.nombre}</option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              value={selectedPlayer.pais} 
                              readOnly 
                              className="form-control readonly-input"
                            />
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>DEPARTAMENTO</label>
                          {isEditing ? (
                            <select
                              name="departamento"
                              value={selectedPlayer.departamento}
                              onChange={handleEditInputChange}
                              className="form-control"
                              disabled={!editSelectedPaisId}
                            >
                              <option value="">
                                {!editSelectedPaisId ? 'Seleccione primero un país' : 'Seleccione un departamento'}
                              </option>
                              {editDepartamentos.map(depto => (
                                <option key={depto.id} value={depto.nombre}>{depto.nombre}</option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              value={selectedPlayer.departamento} 
                              readOnly 
                              className="form-control readonly-input"
                            />
                          )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="info-field">
                          <label>CIUDAD</label>
                          {isEditing ? (
                            <select
                              name="ciudad"
                              value={selectedPlayer.ciudad}
                              onChange={handleEditInputChange}
                              className="form-control"
                              disabled={!editSelectedDepartamentoId}
                            >
                              <option value="">
                                {!editSelectedDepartamentoId ? 'Seleccione primero un departamento' : 'Seleccione una ciudad'}
                              </option>
                              {editCiudades.map(ciudad => (
                                <option key={ciudad.id} value={ciudad.nombre}>{ciudad.nombre}</option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              value={selectedPlayer.ciudad} 
                              readOnly 
                              className="form-control readonly-input"
                            />
                          )}
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
                      <small className="text-muted">La categoría no se puede modificar desde aquí</small>
                    </div>

                    <div className="info-field">
                      <label>CLUB O ESCUELA</label>
                      <input 
                        type="text" 
                        value={selectedPlayer.escuela?.nombre || 'Sin escuela'} 
                        readOnly 
                        className="form-control readonly-input"
                      />
                      <small className="text-muted">La escuela no se puede modificar desde aquí</small>
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
  <button 
    className="btn btn-primary action-btn"
    onClick={handlePrint}
    disabled={isSaving}
    title="Imprimir información del jugador"
  >
    🖨️ IMPRIMIR
  </button>
  <button 
    className="btn btn-success action-btn"
    onClick={handleDownloadID}
    disabled={isSaving}
    title="Descargar tarjeta de identificación en PDF"
  >
    ⬇️ DESCARGAR ID
  </button>
  <button 
    className="btn btn-info action-btn"
    onClick={handleDownloadRegister}
    disabled={isSaving}
    title="Descargar registro o documento oficial"
  >
    ⬇️ DESCARGAR REGISTRO
  </button>
</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar jugador CON ARCHIVOS */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-player-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                AGREGAR NUEVO JUGADOR
                {isUploadingFiles && (
                  <span className="ms-2">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Subiendo archivos...</span>
                    </div>
                  </span>
                )}
              </h3>
              <button className="close-button" onClick={() => {
                setShowAddModal(false);
                resetPlayerForm();
              }}>
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
                {/* Sección de archivos */}
                <div className="files-section mb-4">
                  <h5 className="mb-3">📁 ARCHIVOS DEL JUGADOR</h5>
                  
                  <div className="row">
                    <div className="col-md-4">
                      <FileUpload
                        type="photo"
                        label="Foto de Perfil"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        maxSize="5"
                        onFileSelect={(file) => handleFileSelect('foto_perfil', file)}
                        currentFile={selectedFiles.foto_perfil}
                        error={fileErrors.foto_perfil}
                        required={true}
                      />
                    </div>
                    
                    <div className="col-md-4">
                      <FileUpload
                        type="document"
                        label="Documento de Identidad (PDF)"
                        accept="application/pdf"
                        maxSize="10"
                        onFileSelect={(file) => handleFileSelect('documento_pdf', file)}
                        currentFile={selectedFiles.documento_pdf}
                        error={fileErrors.documento_pdf}
                      />
                    </div>
                    
                    <div className="col-md-4">
                      <FileUpload
                        type="registro"
                        label="Registro Civil (PDF)"
                        accept="application/pdf"
                        maxSize="10"
                        onFileSelect={(file) => handleFileSelect('registro_civil', file)}
                        currentFile={selectedFiles.registro_civil}
                        error={fileErrors.registro_civil}
                      />
                    </div>
                  </div>
                </div>

                <hr />

                {/* Datos personales */}
                <h5 className="mb-3">👤 DATOS PERSONALES</h5>
                
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

                <hr />

                <h5 className="mb-3">📍 UBICACIÓN</h5>
                
                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="pais" className="form-label">
                        País <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        id="pais"
                        name="pais"
                        value={newPlayer.pais || ''}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione un país</option>
                        {paises.map(pais => (
                          <option key={pais.id} value={pais.nombre}>{pais.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="departamento" className="form-label">
                        Departamento <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        id="departamento"
                        name="departamento"
                        value={newPlayer.departamento || ''}
                        onChange={handleInputChange}
                        disabled={!selectedPaisId}
                        required
                      >
                        <option value="">
                          {!selectedPaisId ? 'Seleccione primero un país' : 'Seleccione un departamento'}
                        </option>
                        {departamentos.map(depto => (
                          <option key={depto.id} value={depto.nombre}>{depto.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="ciudad" className="form-label">
                        Ciudad <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
                        id="ciudad"
                        name="ciudad"
                        value={newPlayer.ciudad || ''}
                        onChange={handleInputChange}
                        disabled={!selectedDepartamentoId}
                        required
                      >
                        <option value="">
                          {!selectedDepartamentoId ? 'Seleccione primero un departamento' : 'Seleccione una ciudad'}
                        </option>
                        {ciudades.map(ciudad => (
                          <option key={ciudad.id} value={ciudad.nombre}>{ciudad.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <hr />

                <h5 className="mb-3">⚽ INFORMACIÓN DEPORTIVA</h5>

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

                <hr />

                <h5 className="mb-3">🏥 INFORMACIÓN MÉDICA</h5>

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
                  <button 
                    type="submit" 
                    className="btn btn-success action-btn"
                    disabled={isUploadingFiles}
                  >
                    {isUploadingFiles ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creando Jugador...
                      </>
                    ) : (
                      <>✅ Crear Jugador</>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary action-btn"
                    onClick={() => {
                      setShowAddModal(false);
                      resetPlayerForm();
                    }}
                    disabled={isUploadingFiles}
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