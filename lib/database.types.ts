export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type RowInsertUpdate<Row extends object, Insert extends object, Update extends object, Rel extends Relationship[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Rel;
};

export type Database = {
  public: {
    Tables: {
      clients: RowInsertUpdate<
        {
          created_at: string;
          created_by: string | null;
          email: string | null;
          full_name: string;
          id: string;
          notes: string | null;
          phone: string | null;
        },
        {
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          full_name: string;
          id?: string;
          notes?: string | null;
          phone?: string | null;
        },
        {
          created_at?: string;
          created_by?: string | null;
          email?: string | null;
          full_name?: string;
          id?: string;
          notes?: string | null;
          phone?: string | null;
        },
        [
          {
            foreignKeyName: "clients_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      driver_locations: RowInsertUpdate<
        {
          accuracy: number | null;
          driver_id: string;
          heading: number | null;
          is_online: boolean;
          lat: number;
          lng: number;
          updated_at: string;
        },
        {
          accuracy?: number | null;
          driver_id: string;
          heading?: number | null;
          is_online?: boolean;
          lat?: number;
          lng?: number;
          updated_at?: string;
        },
        {
          accuracy?: number | null;
          driver_id?: string;
          heading?: number | null;
          is_online?: boolean;
          lat?: number;
          lng?: number;
          updated_at?: string;
        },
        [
          {
            foreignKeyName: "driver_locations_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      profiles: RowInsertUpdate<
        {
          created_at: string;
          full_name: string;
          id: string;
          is_active: boolean;
          phone: string | null;
          role: string;
          vehicle_label: string | null;
        },
        {
          created_at?: string;
          full_name: string;
          id: string;
          is_active?: boolean;
          phone?: string | null;
          role: string;
          vehicle_label?: string | null;
        },
        {
          created_at?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          phone?: string | null;
          role?: string;
          vehicle_label?: string | null;
        }
      >;
      trip_events: RowInsertUpdate<
        {
          created_at: string;
          driver_id: string | null;
          id: string;
          note: string | null;
          status: string;
          trip_id: string;
        },
        {
          created_at?: string;
          driver_id?: string | null;
          id?: string;
          note?: string | null;
          status: string;
          trip_id: string;
        },
        {
          created_at?: string;
          driver_id?: string | null;
          id?: string;
          note?: string | null;
          status?: string;
          trip_id?: string;
        },
        [
          {
            foreignKeyName: "trip_events_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_events_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          }
        ]
      >;
      trips: RowInsertUpdate<
        {
          client_id: string;
          created_at: string;
          created_by: string | null;
          driver_id: string | null;
          dropoff: string;
          id: string;
          notes: string | null;
          passengers: number;
          pickup: string;
          pickup_at: string | null;
          status: string;
          tracking_code: string;
          updated_at: string;
        },
        {
          client_id: string;
          created_at?: string;
          created_by?: string | null;
          driver_id?: string | null;
          dropoff: string;
          id?: string;
          notes?: string | null;
          passengers?: number;
          pickup: string;
          pickup_at?: string | null;
          status?: string;
          tracking_code: string;
          updated_at?: string;
        },
        {
          client_id?: string;
          created_at?: string;
          created_by?: string | null;
          driver_id?: string | null;
          dropoff?: string;
          id?: string;
          notes?: string | null;
          passengers?: number;
          pickup?: string;
          pickup_at?: string | null;
          status?: string;
          tracking_code?: string;
          updated_at?: string;
        },
        [
          {
            foreignKeyName: "trips_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trips_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trips_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      create_staff_user: {
        Args: {
          p_email: string;
          p_full_name: string;
          p_password: string;
          p_phone: string;
          p_role?: string;
          p_vehicle_label?: string;
        };
        Returns: string;
      };
      jwt_role: { Args: Record<string, never>; Returns: string };
      track_trip: { Args: { p_code: string }; Returns: Json };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
