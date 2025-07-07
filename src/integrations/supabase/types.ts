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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      roi_projects: {
        Row: {
          break_even_months: number | null
          calculation_model: string
          created_at: string
          estimated_roi: number | null
          expected_costs: number | null
          expected_revenue: number | null
          id: string
          investment_amount: number
          monthly_return: number | null
          net_profit: number | null
          project_description: string | null
          project_name: string
          risk_adjusted_roi: number | null
          risk_level: string
          roi_result: number | null
          session_id: string
          timeframe: number | null
          updated_at: string
        }
        Insert: {
          break_even_months?: number | null
          calculation_model: string
          created_at?: string
          estimated_roi?: number | null
          expected_costs?: number | null
          expected_revenue?: number | null
          id?: string
          investment_amount: number
          monthly_return?: number | null
          net_profit?: number | null
          project_description?: string | null
          project_name: string
          risk_adjusted_roi?: number | null
          risk_level: string
          roi_result?: number | null
          session_id: string
          timeframe?: number | null
          updated_at?: string
        }
        Update: {
          break_even_months?: number | null
          calculation_model?: string
          created_at?: string
          estimated_roi?: number | null
          expected_costs?: number | null
          expected_revenue?: number | null
          id?: string
          investment_amount?: number
          monthly_return?: number | null
          net_profit?: number | null
          project_description?: string | null
          project_name?: string
          risk_adjusted_roi?: number | null
          risk_level?: string
          roi_result?: number | null
          session_id?: string
          timeframe?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roi_projects_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_projects: {
        Row: {
          category: string
          complexity: number
          created_at: string
          description: string | null
          expected_return: string | null
          id: string
          impact: number
          name: string
          selected: boolean
          strategy_session_id: string
          updated_at: string
        }
        Insert: {
          category: string
          complexity: number
          created_at?: string
          description?: string | null
          expected_return?: string | null
          id?: string
          impact: number
          name: string
          selected?: boolean
          strategy_session_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          complexity?: number
          created_at?: string
          description?: string | null
          expected_return?: string | null
          id?: string
          impact?: number
          name?: string
          selected?: boolean
          strategy_session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_projects_strategy_session_id_fkey"
            columns: ["strategy_session_id"]
            isOneToOne: false
            referencedRelation: "strategy_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_sessions: {
        Row: {
          context_history: string | null
          context_initiatives: string | null
          created_at: string
          id: string
          portfolio_name: string
          session_id: string
          updated_at: string
        }
        Insert: {
          context_history?: string | null
          context_initiatives?: string | null
          created_at?: string
          id?: string
          portfolio_name: string
          session_id: string
          updated_at?: string
        }
        Update: {
          context_history?: string | null
          context_initiatives?: string | null
          created_at?: string
          id?: string
          portfolio_name?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          access_code: string
          benchmark_clicks: number | null
          created_at: string
          id: string
          project_suggestions_clicks: number | null
          updated_at: string
        }
        Insert: {
          access_code: string
          benchmark_clicks?: number | null
          created_at?: string
          id?: string
          project_suggestions_clicks?: number | null
          updated_at?: string
        }
        Update: {
          access_code?: string
          benchmark_clicks?: number | null
          created_at?: string
          id?: string
          project_suggestions_clicks?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
