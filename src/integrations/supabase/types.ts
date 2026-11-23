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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          clinical_notes: string | null
          created_at: string
          created_by: string | null
          id: string
          patient_id: string
          patient_note: string | null
          service_id: string
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          treatment_plan: string | null
          updated_at: string
        }
        Insert: {
          clinical_notes?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          patient_id: string
          patient_note?: string | null
          service_id: string
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          treatment_plan?: string | null
          updated_at?: string
        }
        Update: {
          clinical_notes?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          patient_id?: string
          patient_note?: string | null
          service_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          treatment_plan?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_services: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean | null
          slug: string | null
          sort_order: number | null
          title_ar: string | null
          title_en: string | null
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string | null
          sort_order?: number | null
          title_ar?: string | null
          title_en?: string | null
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string | null
          sort_order?: number | null
          title_ar?: string | null
          title_en?: string | null
        }
        Relationships: []
      }
      clinic_settings: {
        Row: {
          address_ar: string | null
          address_en: string | null
          clinic_name_ar: string | null
          clinic_name_en: string | null
          closes_at: string | null
          doctor_name_ar: string | null
          doctor_name_en: string | null
          doctor_title_ar: string | null
          doctor_title_en: string | null
          opens_at: string | null
          patients_per_hour: number | null
          phone: string | null
          singleton: boolean
          time_zone: string | null
          updated_at: string | null
          weekly_day_off: number | null
        }
        Insert: {
          address_ar?: string | null
          address_en?: string | null
          clinic_name_ar?: string | null
          clinic_name_en?: string | null
          closes_at?: string | null
          doctor_name_ar?: string | null
          doctor_name_en?: string | null
          doctor_title_ar?: string | null
          doctor_title_en?: string | null
          opens_at?: string | null
          patients_per_hour?: number | null
          phone?: string | null
          singleton: boolean
          time_zone?: string | null
          updated_at?: string | null
          weekly_day_off?: number | null
        }
        Update: {
          address_ar?: string | null
          address_en?: string | null
          clinic_name_ar?: string | null
          clinic_name_en?: string | null
          closes_at?: string | null
          doctor_name_ar?: string | null
          doctor_name_en?: string | null
          doctor_title_ar?: string | null
          doctor_title_en?: string | null
          opens_at?: string | null
          patients_per_hour?: number | null
          phone?: string | null
          singleton?: boolean
          time_zone?: string | null
          updated_at?: string | null
          weekly_day_off?: number | null
        }
        Relationships: []
      }
      closed_dates: {
        Row: {
          closed_on: string
          created_at: string
          created_by: string | null
          note: string | null
        }
        Insert: {
          closed_on: string
          created_at?: string
          created_by?: string | null
          note?: string | null
        }
        Update: {
          closed_on?: string
          created_at?: string
          created_by?: string | null
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "closed_dates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_notification_preferences: {
        Row: {
          notifications_enabled: boolean
          reminder_days: number
          reminders_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          notifications_enabled?: boolean
          reminder_days?: number
          reminders_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          notifications_enabled?: boolean
          reminder_days?: number
          reminders_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          created_at: string
          full_name: string
          id: string
          normalized_phone: string
          phone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          normalized_phone: string
          phone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          normalized_phone?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_secret: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_secret: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_secret?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_deliveries: {
        Row: {
          appointment_id: string
          id: string
          reminder_date: string
          reminder_days: number
          sent_at: string
        }
        Insert: {
          appointment_id: string
          id?: string
          reminder_date: string
          reminder_days: number
          sent_at?: string
        }
        Update: {
          appointment_id?: string
          id?: string
          reminder_date?: string
          reminder_days?: number
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_deliveries_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_public_booking: {
        Args: {
          _patient_name: string
          _patient_note?: string
          _phone: string
          _service_id: string
          _starts_at: string
        }
        Returns: string
      }
      current_user_has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      get_public_availability: {
        Args: { _clinic_date: string }
        Returns: {
          slot_start: string
          spots_left: number
        }[]
      }
    }
    Enums: {
      app_role: "doctor"
      appointment_status: "confirmed" | "completed" | "cancelled"
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
    Enums: {
      app_role: ["doctor"],
      appointment_status: ["confirmed", "completed", "cancelled"],
    },
  },
} as const
