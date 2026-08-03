export type Json = string | number | boolean | null | {[key: string]: Json | undefined} | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          client_id: string;
          created_at: string;
          id: string;
          slot_id: string;
          status: Database['public']['Enums']['booking_status'];
        };
        Insert: {
          client_id: string;
          created_at?: string;
          id?: string;
          slot_id: string;
          status?: Database['public']['Enums']['booking_status'];
        };
        Update: {
          client_id?: string;
          created_at?: string;
          id?: string;
          slot_id?: string;
          status?: Database['public']['Enums']['booking_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_slot_id_fkey';
            columns: ['slot_id'];
            isOneToOne: false;
            referencedRelation: 'slots';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          phone: string | null;
          role: Database['public']['Enums']['user_role'];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id: string;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Relationships: [];
      };
      slot_templates: {
        Row: {
          cancellation_deadline_hours: number;
          created_at: string;
          day_of_week: number;
          duration_minutes: number;
          id: string;
          is_active: boolean;
          location: Database['public']['Enums']['club_location'];
          max_capacity: number;
          price: number;
          recurrence_end_date: string | null;
          recurrence_start_date: string;
          start_time_local: string;
          workout_type_id: string;
        };
        Insert: {
          cancellation_deadline_hours?: number;
          created_at?: string;
          day_of_week: number;
          duration_minutes?: number;
          id?: string;
          is_active?: boolean;
          location: Database['public']['Enums']['club_location'];
          max_capacity?: number;
          price: number;
          recurrence_end_date?: string | null;
          recurrence_start_date: string;
          start_time_local: string;
          workout_type_id: string;
        };
        Update: {
          cancellation_deadline_hours?: number;
          created_at?: string;
          day_of_week?: number;
          duration_minutes?: number;
          id?: string;
          is_active?: boolean;
          location?: Database['public']['Enums']['club_location'];
          max_capacity?: number;
          price?: number;
          recurrence_end_date?: string | null;
          recurrence_start_date?: string;
          start_time_local?: string;
          workout_type_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'slot_templates_workout_type_id_fkey';
            columns: ['workout_type_id'];
            isOneToOne: false;
            referencedRelation: 'workout_types';
            referencedColumns: ['id'];
          }
        ];
      };
      slots: {
        Row: {
          cancellation_deadline_hours: number;
          created_at: string;
          end_time: string;
          id: string;
          location: Database['public']['Enums']['club_location'];
          max_capacity: number;
          price: number;
          slot_template_id: string | null;
          start_time: string;
          status: Database['public']['Enums']['slot_status'];
          workout_type_id: string;
        };
        Insert: {
          cancellation_deadline_hours?: number;
          created_at?: string;
          end_time: string;
          id?: string;
          location: Database['public']['Enums']['club_location'];
          max_capacity?: number;
          price: number;
          slot_template_id?: string | null;
          start_time: string;
          status?: Database['public']['Enums']['slot_status'];
          workout_type_id: string;
        };
        Update: {
          cancellation_deadline_hours?: number;
          created_at?: string;
          end_time?: string;
          id?: string;
          location?: Database['public']['Enums']['club_location'];
          max_capacity?: number;
          price?: number;
          slot_template_id?: string | null;
          start_time?: string;
          status?: Database['public']['Enums']['slot_status'];
          workout_type_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'slots_slot_template_id_fkey';
            columns: ['slot_template_id'];
            isOneToOne: false;
            referencedRelation: 'slot_templates';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'slots_workout_type_id_fkey';
            columns: ['workout_type_id'];
            isOneToOne: false;
            referencedRelation: 'workout_types';
            referencedColumns: ['id'];
          }
        ];
      };
      workout_types: {
        Row: {
          created_at: string;
          default_price: number;
          description: string | null;
          duration_minutes: number;
          id: string;
          image_url: string | null;
          title: string;
        };
        Insert: {
          created_at?: string;
          default_price?: number;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          image_url?: string | null;
          title: string;
        };
        Update: {
          created_at?: string;
          default_price?: number;
          description?: string | null;
          duration_minutes?: number;
          id?: string;
          image_url?: string | null;
          title?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_bookings_volume: {
        Args: {weeks_back?: number};
        Returns: {
          bookings_count: number;
          week_start: string;
        }[];
      };
      admin_client_overview: {
        Args: never;
        Returns: {
          cancelled_bookings: number;
          client_id: string;
          email: string;
          full_name: string;
          last_booking_at: string;
          phone: string;
          sessions_attended: number;
          total_bookings: number;
          upcoming_bookings: number;
        }[];
      };
      admin_dashboard_kpis: {
        Args: never;
        Returns: {
          active_bookings: number;
          revenue_estimate: number;
          total_clients: number;
          upcoming_slots: number;
        }[];
      };
      admin_popular_workout_types: {
        Args: {limit_count?: number};
        Returns: {
          avg_occupancy_pct: number;
          bookings_count: number;
          title: string;
          workout_type_id: string;
        }[];
      };
      is_admin: {Args: never; Returns: boolean};
    };
    Enums: {
      booking_status: 'confirmed' | 'cancelled';
      club_location: 'alpha' | 'top_gun';
      slot_status: 'scheduled' | 'cancelled' | 'completed';
      user_role: 'client' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    keyof (DefaultSchema['Tables'] & DefaultSchema['Views']) | {schema: keyof DatabaseWithoutInternals},
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | {schema: keyof DatabaseWithoutInternals},
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables'] | {schema: keyof DatabaseWithoutInternals},
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | {schema: keyof DatabaseWithoutInternals},
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | {schema: keyof DatabaseWithoutInternals},
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      booking_status: ['confirmed', 'cancelled'],
      club_location: ['alpha', 'top_gun'],
      slot_status: ['scheduled', 'cancelled', 'completed'],
      user_role: ['client', 'admin']
    }
  }
} as const;
