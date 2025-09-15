import { Jugador, Categoria, Escuela, Pais, Departamento, Ciudad, Usuario, PlayerFiles } from '../../../../services/supabaseClient';

export interface SidebarProps {
  searchTerm: string;
  selectedCategory: string;
  showCategoryDropdown: boolean;
  players: Jugador[];
  filteredPlayers: Jugador[];
  categorias: Categoria[];
  currentUser: any;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onCategorySelect: (categoryId: string) => void;
  onClearCategory: () => void;
  onToggleCategoryDropdown: () => void;
  onPlayerClick: (player: Jugador) => void;
}

export interface PlayerItemProps {
  player: Jugador;
  selectedCategory?: string;
  onClick: (player: Jugador) => void;
}

export interface PlayerModalProps {
  player: Jugador | null;
  originalPlayer: Jugador | null;
  isEditing: boolean;
  isSaving: boolean;
  documentOpened: boolean;
  categorias: Categoria[];
  escuelas: Escuela[];
  paises: Pais[];
  departamentos: Departamento[];
  ciudades: Ciudad[];
  editPaises: Pais[];
  editDepartamentos: Departamento[];
  editCiudades: Ciudad[];
  editSelectedPaisId: string;
  editSelectedDepartamentoId: string;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: (playerId: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onPrint: () => void;
  onDownloadID: () => void;
  onDownloadRegister: () => void;
  onDocumentOpen: (url: string, filename: string) => void;
  onLoadEditDepartamentos: (paisId: string) => Promise<void>;
  onLoadEditCiudades: (departamentoId: string) => Promise<void>;
}

export interface AddPlayerModalProps {
  show: boolean;
  newPlayer: Partial<Jugador>;
  paises: Pais[];
  departamentos: Departamento[];
  ciudades: Ciudad[];
  categorias: Categoria[];
  escuelas: Escuela[];
  selectedPaisId: string;
  selectedDepartamentoId: string;
  currentUser: any;
  isUploading: boolean;
  fileErrors: { [key: string]: string };
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onFileSelect: (fileType: keyof PlayerFiles, file: File | null) => void; // ← CORREGIDO
  onLoadDepartamentos: (paisId: string) => Promise<void>;
  onLoadCiudades: (departamentoId: string) => Promise<void>;
}