//supabase.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      ciudades: {
        Row: {
          created_at: string | null
          departamento_id: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string | null
          departamento_id?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string | null
          departamento_id?: string | null
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "ciudades_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      departamentos: {
        Row: {
          created_at: string | null
          id: string
          nombre: string
          pais_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nombre: string
          pais_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nombre?: string
          pais_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departamentos_pais_id_fkey"
            columns: ["pais_id"]
            isOneToOne: false
            referencedRelation: "paises"
            referencedColumns: ["id"]
          },
        ]
      }
      escuelas: {
        Row: {
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      jugadores: {
        Row: {
          activo: boolean | null
          apellido: string
          categoria_id: string
          ciudad: string
          ciudad_id: string | null
          created_at: string | null
          departamento: string
          departamento_id: string | null
          documento: string
          eps: string
          escuela_id: string
          fecha_nacimiento: string
          id: string
          nombre: string
          pais: string
          pais_id: string | null
          tipo_eps: string
          updated_at: string | null
          foto_perfil_url: string | null
          documento_pdf_url: string | null
          registro_civil_url: string | null
        }
        Insert: {
          activo?: boolean | null
          apellido: string
          categoria_id: string
          ciudad: string
          ciudad_id?: string | null
          created_at?: string | null
          departamento: string
          departamento_id?: string | null
          documento: string
          eps: string
          escuela_id: string
          fecha_nacimiento: string
          id?: string
          nombre: string
          pais?: string
          pais_id?: string | null
          tipo_eps: string
          updated_at?: string | null
          foto_perfil_url?: string | null
          documento_pdf_url?: string | null
          registro_civil_url?: string | null
        }
        Update: {
          activo?: boolean | null
          apellido?: string
          categoria_id?: string
          ciudad?: string
          ciudad_id?: string | null
          created_at?: string | null
          departamento?: string
          departamento_id?: string | null
          documento?: string
          eps?: string
          escuela_id?: string
          fecha_nacimiento?: string
          id?: string
          nombre?: string
          pais?: string
          pais_id?: string | null
          tipo_eps?: string
          updated_at?: string | null
          foto_perfil_url?: string | null
          documento_pdf_url?: string | null
          registro_civil_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jugadores_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jugadores_ciudad_id_fkey"
            columns: ["ciudad_id"]
            isOneToOne: false
            referencedRelation: "ciudades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jugadores_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jugadores_escuela_id_fkey"
            columns: ["escuela_id"]
            isOneToOne: false
            referencedRelation: "escuelas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jugadores_pais_id_fkey"
            columns: ["pais_id"]
            isOneToOne: false
            referencedRelation: "paises"
            referencedColumns: ["id"]
          },
        ]
      }
      paises: {
        Row: {
          codigo: string | null
          created_at: string | null
          id: string
          nombre: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string | null
          id?: string
          nombre: string
        }
        Update: {
          codigo?: string | null
          created_at?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          activo: boolean | null
          apellido: string
          created_at: string | null
          email: string
          escuela_id: string | null
          id: string
          nombre: string
          rol: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          activo?: boolean | null
          apellido: string
          created_at?: string | null
          email: string
          escuela_id?: string | null
          id: string
          nombre: string
          rol?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          activo?: boolean | null
          apellido?: string
          created_at?: string | null
          email?: string
          escuela_id?: string | null
          id?: string
          nombre?: string
          rol?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_escuela_id_fkey"
            columns: ["escuela_id"]
            isOneToOne: false
            referencedRelation: "escuelas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_coach_club_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_players_for_coach: {
        Args: { coach_id_param: number }
        Returns: {
          id: number
          document: string
          first_name: string
          last_name: string
          full_name: string
          birth_date: string
          age: number
          category: string
          club: string
          eps: string
          eps_type: string
          avatar_url: string
          active: boolean
          created_at: string
        }[]
      }
      simple_hash: {
        Args: { password: string }
        Returns: string
      }
      validate_login: {
        Args: { doc: string; pass: string }
        Returns: {
          coach_id: number
          document: string
          first_name: string
          last_name: string
          full_name: string
          email: string
          role: string
          club_id: number
          club_name: string
          phone: string
        }[]
      }
    }
    Enums: {
      user_role: "admin" | "entrenador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      user_role: ["admin", "entrenador"],
    },
  },
} as const
