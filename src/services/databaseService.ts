import { supabase } from "../lib/supabase";
import type {
  UserProfile,
  UserGoal,
  WeightEntry,
  UserProfileInsert,
  UserProfileUpdate,
  UserGoalInsert,
  UserGoalUpdate,
  WeightEntryInsert,
  WeightEntryUpdate,
} from "../types/database";

// ============ PERFILES DE USUARIO ============

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error al obtener perfil:", error);
    return null;
  }

  return data;
};

export const createUserProfile = async (
  profile: UserProfileInsert
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("user_profiles")
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error("Error al crear perfil:", error);
    return null;
  }

  return data;
};

export const updateUserProfile = async (
  userId: string,
  updates: UserProfileUpdate
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar perfil:", error);
    return null;
  }

  return data;
};

// ============ OBJETIVOS DE USUARIO ============

export const getUserGoals = async (userId: string): Promise<UserGoal[]> => {
  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener objetivos:", error);
    return [];
  }

  return data || [];
};

export const getActiveUserGoal = async (
  userId: string
): Promise<UserGoal | null> => {
  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No se encontró ningún objetivo activo
      return null;
    }
    console.error("Error al obtener objetivo activo:", error);
    return null;
  }

  return data;
};

export const createUserGoal = async (
  goal: UserGoalInsert
): Promise<UserGoal | null> => {
  // Desactivar objetivos anteriores si este es activo
  if (goal.is_active !== false) {
    await supabase
      .from("user_goals")
      .update({ is_active: false })
      .eq("user_id", goal.user_id)
      .eq("is_active", true);
  }

  const { data, error } = await supabase
    .from("user_goals")
    .insert({ ...goal, is_active: goal.is_active ?? true })
    .select()
    .single();

  if (error) {
    console.error("Error al crear objetivo:", error);
    return null;
  }

  return data;
};

export const updateUserGoal = async (
  goalId: string,
  updates: UserGoalUpdate
): Promise<UserGoal | null> => {
  const { data, error } = await supabase
    .from("user_goals")
    .update(updates)
    .eq("id", goalId)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar objetivo:", error);
    return null;
  }

  return data;
};

export const setActiveGoal = async (
  userId: string,
  goalId: string
): Promise<boolean> => {
  // Primero desactivar todos los objetivos del usuario
  const { error: deactivateError } = await supabase
    .from("user_goals")
    .update({ is_active: false })
    .eq("user_id", userId)
    .eq("is_active", true);

  if (deactivateError) {
    console.error("Error al desactivar objetivos:", deactivateError);
    return false;
  }

  // Luego activar el objetivo específico
  const { error: activateError } = await supabase
    .from("user_goals")
    .update({ is_active: true })
    .eq("id", goalId)
    .eq("user_id", userId);

  if (activateError) {
    console.error("Error al activar objetivo:", activateError);
    return false;
  }

  return true;
};

// ============ REGISTROS DE PESO ============

export const getWeightEntries = async (
  userId: string
): Promise<WeightEntry[]> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error al obtener registros de peso:", error);
    return [];
  }

  return data || [];
};

export const getLatestWeight = async (
  userId: string
): Promise<WeightEntry | null> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No se encontraron registros de peso
      return null;
    }
    console.error("Error al obtener último peso:", error);
    return null;
  }

  return data;
};

export const createWeightEntry = async (
  entry: WeightEntryInsert
): Promise<WeightEntry | null> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .upsert(entry, {
      onConflict: "user_id, date",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error al crear registro de peso:", error);
    return null;
  }

  return data;
};

export const updateWeightEntry = async (
  entryId: string,
  updates: WeightEntryUpdate
): Promise<WeightEntry | null> => {
  const { data, error } = await supabase
    .from("weight_entries")
    .update(updates)
    .eq("id", entryId)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar registro de peso:", error);
    return null;
  }

  return data;
};

export const deleteWeightEntry = async (entryId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("weight_entries")
    .delete()
    .eq("id", entryId);

  if (error) {
    console.error("Error al eliminar registro de peso:", error);
    return false;
  }

  return true;
};

// ============ FUNCIONES AUXILIARES ============

export const getCompleteUserData = async (userId: string) => {
  const [profile, goals, weightEntries] = await Promise.all([
    getUserProfile(userId),
    getUserGoals(userId),
    getWeightEntries(userId),
  ]);

  const activeGoal = goals.find((goal) => goal.is_active) || null;
  const latestWeight = weightEntries[0] || null;

  return {
    profile,
    goals,
    activeGoal,
    weightEntries,
    latestWeight,
  };
};
