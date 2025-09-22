import React, { useState, useEffect, useCallback, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../Dashboard.css';
import { 
  Usuario, 
  Jugador, 
  Categoria, 
  Escuela,
  getAllJugadores,
  getCategorias,
  getEscuelas,
  getUserProfile
} from '../../../services/supabaseClient';
import { getAdminStats } from './services/adminServices';
import AdminHeader from './adminHeader';
import AdminSidebar from './adminSidebar';
import AddAdminModal from './addAdminModal';
import AddCoachModal from './addCoachModal';
import AddSchoolModal from './addSchoolModal';
import PlayerModal from '../coach/components/PlayerModal';
import ProfileModal from '../coach/components/ProfileModal';
import DocumentViewer from '../../shared/components/DocumentViewer';

interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: Usuario;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, currentUser }) => {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [players, setPlayers] = useState<Jugador[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Jugador[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  
  // Estados para estadísticas
  const [stats, setStats] = useState({
    totalJugadores: 0,
    totalEscuelas: 0,
    totalAdmins: 0,
    totalCoaches: 0,
    totalCategorias: 0
  });

  // Estados para filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);

  // Estados para modales
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showAddCoachModal, setShowAddCoachModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  
  // Estados para jugador seleccionado
  const [selectedPlayer, setSelectedPlayer] = useState<Jugador | null>(null);
  const [userProfile, setUserProfile] = useState<Usuario | null>(null);

  // Estados de UI
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hamburgerMenuRef = useRef<HTMLDivElement>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          jugadoresResult,
          categoriasResult,
          escuelasResult,
          statsResult
        ] = await Promise.all([
          getAllJugadores(),
          getCategorias(),
          getEscuelas(),
          getAdminStats()
        ]);

        if (jugadoresResult.error) throw jugadoresResult.error;
        if (categoriasResult.error) throw categoriasResult.error;
        if (escuelasResult.error) throw escuelasResult.error;
        if (statsResult.error) throw statsResult.error;

        setPlayers(jugadoresResult.data || []);
        setFilteredPlayers(jugadoresResult.data || []);
        setCategorias(categoriasResult.data || []);
        setEscuelas(escuelasResult.data || []);
        setStats(statsResult);

      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Filtrar jugadores
  useEffect(() => {
    let filtered = players;

    if (selectedCategory) {
      filtered = filtered.filter(player => player.categoria_id === selectedCategory);
    }

    if (selectedSchool) {
      filtered = filtered.filter(player => player.escuela_id === selectedSchool);
    }

    if (searchTerm) {
      filtered = filtered.filter(player => 
        `${player.nombre} ${player.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.documento.includes(searchTerm)
      );
    }

    setFilteredPlayers(filtered);
  }, [players, selectedCategory, selectedSchool, searchTerm]);

  // Handlers del Header
  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode]);

  const handleToggleHamburgerMenu = useCallback(() => {
    setShowHamburgerMenu(!showHamburgerMenu);
  }, [showHamburgerMenu]);

  const handleViewProfile = useCallback(async () => {
    setShowHamburgerMenu(false);
    const profile = await getUserProfile();
    if (profile?.data) {
      setUserProfile(profile.data);
      setShowProfileModal(true);
    }
  }, []);

  const handleAddAdmin = useCallback(() => {
    setShowHamburgerMenu(false);
    setShowAddAdminModal(true);
  }, []);

  const handleAddCoach = useCallback(() => {
    setShowHamburgerMenu(false);
    setShowAddCoachModal(true);
  }, []);

  const handleAddSchool = useCallback(() => {
    setShowHamburgerMenu(false);
    setShowAddSchoolModal(true);
  }, []);

  // Handlers del Sidebar
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
  }, []);

  const handleSchoolSelect = useCallback((schoolId: string) => {
    setSelectedSchool(schoolId);
    setShowSchoolDropdown(false);
  }, []);

  const handleClearCategory = useCallback(() => {
    setSelectedCategory('');
  }, []);

  const handleClearSchool = useCallback(() => {
    setSelectedSchool('');
  }, []);

  const handleToggleCategoryDropdown = useCallback(() => {
    setShowCategoryDropdown(!showCategoryDropdown);
    setShowSchoolDropdown(false);
  }, [showCategoryDropdown]);

  const handleToggleSchoolDropdown = useCallback(() => {
    setShowSchoolDropdown(!showSchoolDropdown);
    setShowCategoryDropdown(false);
  }, [showSchoolDropdown]);

  const handlePlayerClick = useCallback((player: Jugador) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  }, []);

  // Handlers para crear nuevos registros
  const handleCreateAdmin = useCallback(async (adminData: any) => {
    try {
      // Lógica para crear admin (se implementará después)
      console.log('Creando admin:', adminData);
      setShowAddAdminModal(false);
      // Recargar datos después de crear
    } catch (err: any) {
      setError(err.message || 'Error creando administrador');
    }
  }, []);

  const handleCreateCoach = useCallback(async (coachData: any) => {
    try {
      // Lógica para crear coach
      console.log('Creando coach:', coachData);
      setShowAddCoachModal(false);
    } catch (err: any) {
      setError(err.message || 'Error creando entrenador');
    }
  }, []);

  const handleCreateSchool = useCallback(async (schoolData: any) => {
    try {
      // Lógica para crear escuela
      console.log('Creando escuela:', schoolData);
      setShowAddSchoolModal(false);
    } catch (err: any) {
      setError(err.message || 'Error creando escuela');
    }
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2">Cargando dashboard del administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <AdminHeader
        currentUser={currentUser}
        isDarkMode={isDarkMode}
        showHamburgerMenu={showHamburgerMenu}
        onToggleDarkMode={handleToggleDarkMode}
        onToggleHamburgerMenu={handleToggleHamburgerMenu}
        onViewProfile={handleViewProfile}
        onAddAdmin={handleAddAdmin}
        onAddCoach={handleAddCoach}
        onAddSchool={handleAddSchool}
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

      <div className="dashboard-body">
        <div className="container-fluid h-100">
          <div className="row h-100">
            {/* Sidebar */}
            <div className="col-lg-4 col-xl-3">
              <AdminSidebar
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
                selectedSchool={selectedSchool}
                showCategoryDropdown={showCategoryDropdown}
                showSchoolDropdown={showSchoolDropdown}
                players={players}
                filteredPlayers={filteredPlayers}
                categorias={categorias}
                escuelas={escuelas}
                currentUser={currentUser}
                loading={loading}
                onSearchChange={handleSearchChange}
                onCategorySelect={handleCategorySelect}
                onSchoolSelect={handleSchoolSelect}
                onClearCategory={handleClearCategory}
                onClearSchool={handleClearSchool}
                onToggleCategoryDropdown={handleToggleCategoryDropdown}
                onToggleSchoolDropdown={handleToggleSchoolDropdown}
                onPlayerClick={handlePlayerClick}
              />
            </div>

            {/* Contenido principal */}
            <div className="col-lg-8 col-xl-9">
              <div className="main-content">
                <div className="admin-stats-section">
                  <h4 className="section-title">ESTADÍSTICAS GENERALES</h4>
                  
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="stat-card bg-primary text-white">
                        <div className="stat-icon">👥</div>
                        <div className="stat-number">{stats.totalJugadores}</div>
                        <div className="stat-label">Jugadores Activos</div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="stat-card bg-success text-white">
                        <div className="stat-icon">🏫</div>
                        <div className="stat-number">{stats.totalEscuelas}</div>
                        <div className="stat-label">Escuelas</div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="stat-card bg-warning text-white">
                        <div className="stat-icon">👨‍💼</div>
                        <div className="stat-number">{stats.totalAdmins}</div>
                        <div className="stat-label">Administradores</div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="stat-card bg-info text-white">
                        <div className="stat-icon">👨‍🏫</div>
                        <div className="stat-number">{stats.totalCoaches}</div>
                        <div className="stat-label">Entrenadores</div>
                      </div>
                    </div>
                    
                    <div className="col-md-4">
                      <div className="stat-card bg-secondary text-white">
                        <div className="stat-icon">⚽</div>
                        <div className="stat-number">{stats.totalCategorias}</div>
                        <div className="stat-label">Categorías</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ProfileModal
        show={showProfileModal}
        userProfile={userProfile}
        onClose={() => setShowProfileModal(false)}
      />

      {showPlayerModal && selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          // ... otras props necesarias para el modal de jugador
          onClose={() => setShowPlayerModal(false)}
        />
      )}

      <AddAdminModal
        show={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        onSubmit={handleCreateAdmin}
      />

      <AddCoachModal
        show={showAddCoachModal}
        escuelas={escuelas}
        onClose={() => setShowAddCoachModal(false)}
        onSubmit={handleCreateCoach}
      />

      <AddSchoolModal
        show={showAddSchoolModal}
        onClose={() => setShowAddSchoolModal(false)}
        onSubmit={handleCreateSchool}
      />
    </div>
  );
};

export default AdminDashboard;