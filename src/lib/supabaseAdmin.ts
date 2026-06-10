import { createClient } from "@supabase/supabase-js";

export type InvitationStatus = "Pending" | "Completed";

export type InvitationRow = {
  id: number;
  code: string;
  recipient_name: string;
  owner_id: string | null;
  status: InvitationStatus;
  created_at: string;
  completed_at: string | null;
};

export type ResponseRow = {
  id: number;
  invite_id: number | null;
  invite_code: string | null;
  recipient_name: string | null;
  owner_id: string | null;
  date: string;
  time: string;
  activity: string;
  food: string;
  submitted_at: string;
};

export type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
};

export type CompleteInvitationResponse = {
  id: number;
  invite_code: string;
  recipient_name: string;
  date: string;
  time: string;
  activity: string;
  food: string;
  submitted_at: string;
};

type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProfileRow, "id">>;
        Relationships: [];
      };
      invitations: {
        Row: InvitationRow;
        Insert: Omit<InvitationRow, "id" | "created_at" | "completed_at"> & {
          completed_at?: string | null;
          created_at?: string;
          id?: never;
        };
        Update: Partial<Omit<InvitationRow, "id">>;
        Relationships: [];
      };
      responses: {
        Row: ResponseRow;
        Insert: Omit<ResponseRow, "id"> & { id?: never };
        Update: Partial<Omit<ResponseRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      complete_invitation: {
        Args: {
          p_activity: string;
          p_date: string;
          p_food: string;
          p_invite_code: string;
          p_time: string;
        };
        Returns: CompleteInvitationResponse[];
      };
    };
  };
};

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
