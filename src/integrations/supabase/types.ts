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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      dream_log_entities: {
        Row: {
          dream_log_id: string
          entity_id: string
          id: string
        }
        Insert: {
          dream_log_id: string
          entity_id: string
          id?: string
        }
        Update: {
          dream_log_id?: string
          entity_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_log_entities_dream_log_id_fkey"
            columns: ["dream_log_id"]
            isOneToOne: false
            referencedRelation: "dream_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_log_entities_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_log_modules: {
        Row: {
          dream_log_id: string
          id: string
          module_id: string
        }
        Insert: {
          dream_log_id: string
          id?: string
          module_id: string
        }
        Update: {
          dream_log_id?: string
          id?: string
          module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_log_modules_dream_log_id_fkey"
            columns: ["dream_log_id"]
            isOneToOne: false
            referencedRelation: "dream_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_log_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "system_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_log_threats: {
        Row: {
          dream_log_id: string
          id: string
          threat_id: string
        }
        Insert: {
          dream_log_id: string
          id?: string
          threat_id: string
        }
        Update: {
          dream_log_id?: string
          id?: string
          threat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dream_log_threats_dream_log_id_fkey"
            columns: ["dream_log_id"]
            isOneToOne: false
            referencedRelation: "dream_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dream_log_threats_threat_id_fkey"
            columns: ["threat_id"]
            isOneToOne: false
            referencedRelation: "threats"
            referencedColumns: ["id"]
          },
        ]
      }
      dream_logs: {
        Row: {
          created_at: string
          date: string
          dream_id: string
          environments: string[]
          exit: Database["public"]["Enums"]["exit_type"]
          id: string
          notes: string | null
          safety_override: Database["public"]["Enums"]["safety_override"]
          threat_level: number
          time_system: Database["public"]["Enums"]["time_system"]
          updated_at: string
          wake_time: string
          world_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          dream_id: string
          environments?: string[]
          exit?: Database["public"]["Enums"]["exit_type"]
          id?: string
          notes?: string | null
          safety_override?: Database["public"]["Enums"]["safety_override"]
          threat_level?: number
          time_system?: Database["public"]["Enums"]["time_system"]
          updated_at?: string
          wake_time: string
          world_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          dream_id?: string
          environments?: string[]
          exit?: Database["public"]["Enums"]["exit_type"]
          id?: string
          notes?: string | null
          safety_override?: Database["public"]["Enums"]["safety_override"]
          threat_level?: number
          time_system?: Database["public"]["Enums"]["time_system"]
          updated_at?: string
          wake_time?: string
          world_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dream_logs_world_id_fkey"
            columns: ["world_id"]
            isOneToOne: false
            referencedRelation: "worlds"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          role: Database["public"]["Enums"]["entity_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          role?: Database["public"]["Enums"]["entity_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["entity_role"]
          updated_at?: string
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          created_at: string
          date: string
          deep_continuity_score: number | null
          deep_hours: number
          deep_minutes: number
          id: string
          light_hours: number
          light_minutes: number
          nap_end: string | null
          nap_minutes: number | null
          nap_start: string | null
          rem_hours: number
          rem_minutes: number
          sleep_id: string
          sleep_score: number | null
          sleep_start: string
          total_hours: number
          total_minutes: number
          wake_time: string
        }
        Insert: {
          created_at?: string
          date: string
          deep_continuity_score?: number | null
          deep_hours?: number
          deep_minutes?: number
          id?: string
          light_hours?: number
          light_minutes?: number
          nap_end?: string | null
          nap_minutes?: number | null
          nap_start?: string | null
          rem_hours?: number
          rem_minutes?: number
          sleep_id: string
          sleep_score?: number | null
          sleep_start: string
          total_hours?: number
          total_minutes?: number
          wake_time: string
        }
        Update: {
          created_at?: string
          date?: string
          deep_continuity_score?: number | null
          deep_hours?: number
          deep_minutes?: number
          id?: string
          light_hours?: number
          light_minutes?: number
          nap_end?: string | null
          nap_minutes?: number | null
          nap_start?: string | null
          rem_hours?: number
          rem_minutes?: number
          sleep_id?: string
          sleep_score?: number | null
          sleep_start?: string
          total_hours?: number
          total_minutes?: number
          wake_time?: string
        }
        Relationships: []
      }
      system_modules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["module_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type?: Database["public"]["Enums"]["module_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["module_type"]
          updated_at?: string
        }
        Relationships: []
      }
      threats: {
        Row: {
          ability: string | null
          countermeasure: string | null
          created_at: string
          id: string
          level: number
          name: string
          response: string | null
          summon_medium: string | null
          updated_at: string
        }
        Insert: {
          ability?: string | null
          countermeasure?: string | null
          created_at?: string
          id?: string
          level?: number
          name: string
          response?: string | null
          summon_medium?: string | null
          updated_at?: string
        }
        Update: {
          ability?: string | null
          countermeasure?: string | null
          created_at?: string
          id?: string
          level?: number
          name?: string
          response?: string | null
          summon_medium?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      worlds: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          stability: number
          type: Database["public"]["Enums"]["world_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          stability?: number
          type?: Database["public"]["Enums"]["world_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          stability?: number
          type?: Database["public"]["Enums"]["world_type"]
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
      entity_role: "observer" | "protector" | "guide" | "intruder"
      exit_type: "wake" | "separation" | "collapse" | "unknown"
      module_type:
        | "time_activation"
        | "safety_override"
        | "distance_expansion"
        | "other"
      safety_override: "none" | "helper" | "separation" | "wake" | "unknown"
      time_system: "inactive" | "activated" | "unknown"
      world_type: "persistent" | "transient"
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
      entity_role: ["observer", "protector", "guide", "intruder"],
      exit_type: ["wake", "separation", "collapse", "unknown"],
      module_type: [
        "time_activation",
        "safety_override",
        "distance_expansion",
        "other",
      ],
      safety_override: ["none", "helper", "separation", "wake", "unknown"],
      time_system: ["inactive", "activated", "unknown"],
      world_type: ["persistent", "transient"],
    },
  },
} as const
