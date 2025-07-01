// Tipos para las tablas de Supabase

export interface UserProfile {
  id: string; // UUID from auth.users
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  weight: number | null;
  height: number | null;
  age: number | null;
  activity_level:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active"
    | null;
  gender: "male" | "female" | "other" | null;
  steps: number | null;
  does_strength_training: boolean | null;
  strength_training_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserGoal {
  id: string;
  user_id: string;
  start_date: string | null; // Date string
  end_date: string | null; // Date string
  target_weight: number | null;
  goal_type: "lose" | "gain" | "maintain" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  date: string; // Date string
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos para inserts (algunos campos son opcionales al crear)
export interface UserProfileInsert {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  weight?: number;
  height?: number;
  age?: number;
  activity_level?:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active";
  gender?: "male" | "female" | "other";
  steps?: number;
  does_strength_training?: boolean;
  strength_training_days?: number;
}

export interface UserGoalInsert {
  user_id: string;
  start_date?: string;
  end_date?: string;
  target_weight?: number;
  goal_type?: "lose" | "gain" | "maintain";
  is_active?: boolean;
}

export interface WeightEntryInsert {
  user_id: string;
  weight: number;
  date: string;
  notes?: string;
}

// Tipos para updates (todos los campos son opcionales)
export interface UserProfileUpdate {
  email?: string;
  full_name?: string;
  avatar_url?: string;
  weight?: number;
  height?: number;
  age?: number;
  activity_level?:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active";
  gender?: "male" | "female" | "other";
  steps?: number;
  does_strength_training?: boolean;
  strength_training_days?: number;
}

export interface UserGoalUpdate {
  start_date?: string;
  end_date?: string;
  target_weight?: number;
  goal_type?: "lose" | "gain" | "maintain";
  is_active?: boolean;
}

export interface WeightEntryUpdate {
  weight?: number;
  date?: string;
  notes?: string;
}
