export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      login_otps: {
        Row: {
          codigo: string
          criado_em: string
          email: string
          expira_em: string
          id: string
          tentativas: number
          usado: boolean
        }
        Insert: {
          codigo: string
          criado_em?: string
          email: string
          expira_em: string
          id?: string
          tentativas?: number
          usado?: boolean
        }
        Update: {
          codigo?: string
          criado_em?: string
          email?: string
          expira_em?: string
          id?: string
          tentativas?: number
          usado?: boolean
        }
        Relationships: []
      }
      review_audit_log: {
        Row: {
          acao: string
          ciclo: string
          criado_em: string
          detalhe: string | null
          email: string | null
          id: string
          unit_slug: string
          user_id: string
        }
        Insert: {
          acao: string
          ciclo: string
          criado_em?: string
          detalhe?: string | null
          email?: string | null
          id?: string
          unit_slug: string
          user_id: string
        }
        Update: {
          acao?: string
          ciclo?: string
          criado_em?: string
          detalhe?: string | null
          email?: string | null
          id?: string
          unit_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      unit_monthly_review: {
        Row: {
          acoes_recomendadas_bp: Json
          acoes_recomendadas_diretoria: Json
          atualizado_em: string
          autor: string | null
          autor_email: string | null
          autor_id: string | null
          ciclo: string
          consolidado_em: string | null
          consolidado_por: string | null
          enviado_em: string | null
          enviado_por: string | null
          fluxo_status: string
          id: string
          justificativa_bp: string | null
          justificativas: Json
          motivo_reabertura: string | null
          ofensores_diretoria: Json
          parecer_diretoria: string | null
          plano_de_acao: Json
          status: string
          unit_slug: string
        }
        Insert: {
          acoes_recomendadas_bp?: Json
          acoes_recomendadas_diretoria?: Json
          atualizado_em?: string
          autor?: string | null
          autor_email?: string | null
          autor_id?: string | null
          ciclo: string
          consolidado_em?: string | null
          consolidado_por?: string | null
          enviado_em?: string | null
          enviado_por?: string | null
          fluxo_status?: string
          id?: string
          justificativa_bp?: string | null
          justificativas?: Json
          motivo_reabertura?: string | null
          ofensores_diretoria?: Json
          parecer_diretoria?: string | null
          plano_de_acao?: Json
          status?: string
          unit_slug: string
        }
        Update: {
          acoes_recomendadas_bp?: Json
          acoes_recomendadas_diretoria?: Json
          atualizado_em?: string
          autor?: string | null
          autor_email?: string | null
          autor_id?: string | null
          ciclo?: string
          consolidado_em?: string | null
          consolidado_por?: string | null
          enviado_em?: string | null
          enviado_por?: string | null
          fluxo_status?: string
          id?: string
          justificativa_bp?: string | null
          justificativas?: Json
          motivo_reabertura?: string | null
          ofensores_diretoria?: Json
          parecer_diretoria?: string | null
          plano_de_acao?: Json
          status?: string
          unit_slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string | null
          role: Database["public"]["Enums"]["app_role"]
          unidades: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          unidades?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          unidades?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_admin: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          nome: string | null
          role: Database["public"]["Enums"]["app_role"]
          unidades: string[]
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "user_roles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_my_role: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          nome: string | null
          role: Database["public"]["Enums"]["app_role"]
          unidades: string[]
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "user_roles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      pode_unidade: {
        Args: { _slug: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "bp" | "lider" | "admin"
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
  public: {
    Enums: {
      app_role: ["bp", "lider", "admin"],
    },
  },
} as const
