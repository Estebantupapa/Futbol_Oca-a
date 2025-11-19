export interface ExcelPlayerData {
  documento: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  pais?: string;
  departamento?: string;
  ciudad?: string;
  eps?: string;
  tipo_eps?: string;
  categoria_nombre: string;
  escuela_nombre: string;
  documento_pdf_url?: string | null;
  registro_civil_url?: string | null;
  foto_perfil_url?: string | null;
}

export interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  errors: string[];
  failedImports: FailedImport[];
}

export interface FailedImport {
  row: number;
  player: ExcelPlayerData;
  error: string;
}

export interface ExcelValidationError {
  row: number;
  field: string;
  message: string;
}