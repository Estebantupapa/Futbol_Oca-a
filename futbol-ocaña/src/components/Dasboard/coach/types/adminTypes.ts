import { Usuario, Escuela, Jugador, Categoria } from '../../../../services/supabaseClient';

export interface AdminDashboardProps {
  onLogout: () => void;
  currentUser: Usuario;
}

export interface AdminHeaderProps {
  currentUser: Usuario;
  isDarkMode: boolean;
  showHamburgerMenu: boolean;
  onToggleDarkMode: () => void;
  onToggleHamburgerMenu: () => void;
  onViewProfile: () => void;
  onAddAdmin: () => void;
  onAddCoach: () => void;
  onAddSchool: () => void;
  onLogout: () => void;
  hamburgerMenuRef: React.RefObject<HTMLDivElement>;
}

export interface AdminSidebarProps {
  searchTerm: string;
  selectedCategory: string;
  selectedSchool: string;
  showCategoryDropdown: boolean;
  showSchoolDropdown: boolean;
  players: Jugador[];
  filteredPlayers: Jugador[];
  categorias: Categoria[];
  escuelas: Escuela[];
  currentUser: Usuario;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onCategorySelect: (categoryId: string) => void;
  onSchoolSelect: (schoolId: string) => void;
  onClearCategory: () => void;
  onClearSchool: () => void;
  onToggleCategoryDropdown: () => void;
  onToggleSchoolDropdown: () => void;
  onPlayerClick: (player: Jugador) => void;
}

export interface AddAdminModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (adminData: any) => void;
}

export interface AddCoachModalProps {
  show: boolean;
  escuelas: Escuela[];
  onClose: () => void;
  onSubmit: (coachData: any) => void;
}

export interface AddSchoolModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (schoolData: any) => void;
}

export interface AdminPlayerItemProps {
  player: Jugador;
  onClick: (player: Jugador) => void;
  // NUEVAS PROPS AGREGADAS:
  onShowPeaceAndSafe: (player: Jugador) => void;
  onEditPlayer: (player: Jugador) => void;
  onDeletePlayer: (player: Jugador) => void;
}

// En adminTypes.ts, actualiza AdminPlayerModalProps:
export interface AdminPlayerModalProps {
  player: Jugador;
  categorias: Categoria[];
  escuelas: Escuela[];
  onClose: () => void;
  onPrint: () => void;
  onDownloadID: () => void;
  onDownloadRegister: () => void;
  onDocumentOpen: (url: string, filename: string) => void;
  onDeletePlayer: (player: Jugador) => void;
  onUpdatePlayerSchool: (playerId: string, escuelaId: string) => Promise<void>;
}