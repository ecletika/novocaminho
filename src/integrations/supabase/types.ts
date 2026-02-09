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
      birthday_ministries: {
        Row: {
          birthday_id: string
          id: string
          ministry_id: string
        }
        Insert: {
          birthday_id: string
          id?: string
          ministry_id: string
        }
        Update: {
          birthday_id?: string
          id?: string
          ministry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "birthday_ministries_birthday_id_fkey"
            columns: ["birthday_id"]
            isOneToOne: false
            referencedRelation: "birthdays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birthday_ministries_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      birthdays: {
        Row: {
          address: string | null
          birthday_date: string
          birthday_type: string
          created_at: string
          email: string | null
          id: string
          man_name: string | null
          phone: string | null
          updated_at: string
          woman_name: string | null
        }
        Insert: {
          address?: string | null
          birthday_date: string
          birthday_type: string
          created_at?: string
          email?: string | null
          id?: string
          man_name?: string | null
          phone?: string | null
          updated_at?: string
          woman_name?: string | null
        }
        Update: {
          address?: string | null
          birthday_date?: string
          birthday_type?: string
          created_at?: string
          email?: string | null
          id?: string
          man_name?: string | null
          phone?: string | null
          updated_at?: string
          woman_name?: string | null
        }
        Relationships: []
      }
      casados_gallery: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      casados_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          time: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          time: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      general_schedules: {
        Row: {
          created_at: string
          date: string
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          category: string
          condition: string
          created_at: string
          id: string
          image_url: string | null
          location: string
          name: string
          notes: string | null
          purpose: string | null
          updated_at: string
        }
        Insert: {
          category: string
          condition: string
          created_at?: string
          id?: string
          image_url?: string | null
          location: string
          name: string
          notes?: string | null
          purpose?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          condition?: string
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          notes?: string | null
          purpose?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      member_functions: {
        Row: {
          function_id: string
          id: string
          member_id: string
        }
        Insert: {
          function_id: string
          id?: string
          member_id: string
        }
        Update: {
          function_id?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_functions_function_id_fkey"
            columns: ["function_id"]
            isOneToOne: false
            referencedRelation: "worship_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_functions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "worship_members"
            referencedColumns: ["id"]
          },
        ]
      }
      ministries: {
        Row: {
          created_at: string
          description: string | null
          features: string[] | null
          icon: string
          id: string
          image_url: string | null
          is_active: boolean | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: string[] | null
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ministry_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          ministry_id: string
          published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          ministry_id: string
          published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          ministry_id?: string
          published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministry_posts_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_members: {
        Row: {
          id: string
          member_id: string
          schedule_id: string
        }
        Insert: {
          id?: string
          member_id: string
          schedule_id: string
        }
        Update: {
          id?: string
          member_id?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "worship_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_members_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "worship_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_musicians: {
        Row: {
          id: string
          instrument: string
          member_id: string
          schedule_id: string
        }
        Insert: {
          id?: string
          instrument: string
          member_id: string
          schedule_id: string
        }
        Update: {
          id?: string
          instrument?: string
          member_id?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_musicians_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "worship_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_musicians_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "worship_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_songs: {
        Row: {
          id: string
          key: string
          schedule_id: string
          song_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          key: string
          schedule_id: string
          song_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          key?: string
          schedule_id?: string
          song_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "schedule_songs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "worship_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "worship_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_team_members: {
        Row: {
          id: string
          instrument: string | null
          member_id: string
          role: string
          schedule_id: string
        }
        Insert: {
          id?: string
          instrument?: string | null
          member_id: string
          role: string
          schedule_id: string
        }
        Update: {
          id?: string
          instrument?: string | null
          member_id?: string
          role?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_team_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "worship_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_team_members_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "general_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_vocalists: {
        Row: {
          id: string
          member_id: string
          schedule_id: string
        }
        Insert: {
          id?: string
          member_id: string
          schedule_id: string
        }
        Update: {
          id?: string
          member_id?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_vocalists_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "worship_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_vocalists_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "worship_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      site_config: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      song_minister_assignments: {
        Row: {
          created_at: string
          id: string
          key: string
          minister_id: string
          song_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          minister_id: string
          song_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          minister_id?: string
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "song_minister_assignments_minister_id_fkey"
            columns: ["minister_id"]
            isOneToOne: false
            referencedRelation: "worship_ministers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_minister_assignments_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "worship_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      worship_functions: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      worship_members: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          primary_function_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          primary_function_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          primary_function_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "worship_members_primary_function_id_fkey"
            columns: ["primary_function_id"]
            isOneToOne: false
            referencedRelation: "worship_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      worship_ministers: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      worship_schedules: {
        Row: {
          created_at: string
          date: string
          id: string
          minister_id: string | null
          time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          minister_id?: string | null
          time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          minister_id?: string | null
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "worship_schedules_minister_id_fkey"
            columns: ["minister_id"]
            isOneToOne: false
            referencedRelation: "worship_ministers"
            referencedColumns: ["id"]
          },
        ]
      }
      worship_songs: {
        Row: {
          content_type: string
          created_at: string
          has_chords: boolean
          id: string
          lyrics: string | null
          name: string
          original_key: string
          updated_at: string
        }
        Insert: {
          content_type?: string
          created_at?: string
          has_chords?: boolean
          id?: string
          lyrics?: string | null
          name: string
          original_key: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          has_chords?: boolean
          id?: string
          lyrics?: string | null
          name?: string
          original_key?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "member"
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
      app_role: ["admin", "member"],
    },
  },
} as const
