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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      catalog_items: {
        Row: {
          category: string
          created_at: string
          id: number
          is_active: boolean
          name: string
          price: number
          times_ordered: number
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          price: number
          times_ordered?: number
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          price?: number
          times_ordered?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_preferences: {
        Row: {
          catalog_item_id: number
          created_at: string
          customer_id: number
          id: number
          note: string | null
          updated_at: string
        }
        Insert: {
          catalog_item_id: number
          created_at?: string
          customer_id: number
          id?: number
          note?: string | null
          updated_at?: string
        }
        Update: {
          catalog_item_id?: number
          created_at?: string
          customer_id?: number
          id?: number
          note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_preferences_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_preferences_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: number
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          phone?: string
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount: number
          created_at: string
          customer_id: number
          id: number
          note: string | null
          order_id: number | null
          reverses_entry_id: number | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: number
          id?: number
          note?: string | null
          order_id?: number | null
          reverses_entry_id?: number | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: number
          id?: number
          note?: string | null
          order_id?: number | null
          reverses_entry_id?: number | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "ledger_entries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_reverses_entry_id_fkey"
            columns: ["reverses_entry_id"]
            isOneToOne: false
            referencedRelation: "ledger_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          guess_reason: string | null
          guessed_catalog_item_id: number | null
          id: number
          is_vague: boolean
          line_total: number
          order_id: number
          quantity_text: string
          resolved_catalog_item_id: number | null
          spoken_text: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          guess_reason?: string | null
          guessed_catalog_item_id?: number | null
          id?: number
          is_vague?: boolean
          line_total?: number
          order_id: number
          quantity_text: string
          resolved_catalog_item_id?: number | null
          spoken_text: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          guess_reason?: string | null
          guessed_catalog_item_id?: number | null
          id?: number
          is_vague?: boolean
          line_total?: number
          order_id?: number
          quantity_text?: string
          resolved_catalog_item_id?: number | null
          spoken_text?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_guessed_catalog_item_id_fkey"
            columns: ["guessed_catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_resolved_catalog_item_id_fkey"
            columns: ["resolved_catalog_item_id"]
            isOneToOne: false
            referencedRelation: "catalog_items"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          created_at: string
          customer_id: number
          delivered_at: string | null
          id: number
          state: string
          total: number
          twilio_message_sid: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          customer_id: number
          delivered_at?: string | null
          id?: number
          state?: string
          total?: number
          twilio_message_sid?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          customer_id?: number
          delivered_at?: string | null
          id?: number
          state?: string
          total?: number
          twilio_message_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_orders: {
        Row: {
          created_at: string
          customer_id: number | null
          id: number
          items: Json
          raw_transcript: string | null
          status: string
          total: number
          twilio_message_sid: string | null
          updated_at: string
          whatsapp_from: string
        }
        Insert: {
          created_at?: string
          customer_id?: number | null
          id?: number
          items: Json
          raw_transcript?: string | null
          status?: string
          total?: number
          twilio_message_sid?: string | null
          updated_at?: string
          whatsapp_from: string
        }
        Update: {
          created_at?: string
          customer_id?: number | null
          id?: number
          items?: Json
          raw_transcript?: string | null
          status?: string
          total?: number
          twilio_message_sid?: string | null
          updated_at?: string
          whatsapp_from?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "pending_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_links: {
        Row: {
          chat_id: string
          created_at: string
          customer_id: number
          phone: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          customer_id: number
          phone: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          customer_id?: number
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_links_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_balances"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "telegram_links_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      customer_balances: {
        Row: {
          balance: number | null
          customer_id: number | null
          name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      match_catalog_item: {
        Args: { _phrase: string }
        Returns: {
          category: string
          id: number
          name: string
          price: number
          score: number
          times_ordered: number
          unit: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
