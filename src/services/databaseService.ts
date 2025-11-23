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

// ============ GUEST MODE HELPER ============
/**
 * Verifica si un ID de usuario corresponde al usuario invitado
 * @param {string} userId - ID del usuario a verificar
 * @returns {boolean} True si es el usuario invitado
 */
const isGuest = (userId: string) => userId === "guest-user-id";

/**
 * Obtiene el perfil simulado del usuario invitado
 * Intenta recuperar datos de localStorage si existen
 * @returns {UserProfile} Perfil del usuario invitado
 */
const getGuestProfile = (): UserProfile => {
  // Intentar obtener datos del store local si es posible, o devolver defaults
  let localData: any = {};
  try {
    const stored = localStorage.getItem("userData");
    if (stored) localData = JSON.parse(stored);
  } catch (e) {}

  return {
    id: "guest-user-id",
    full_name: "Invitado",
    avatar_url: "",
    email: "invitado@demo.local",
    weight: localData.weight || 70,
    height: localData.height || 170,
    age: localData.age || 30,
    gender: localData.gender || "male",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: localData.steps || 10000,
    does_strength_training: localData.doesStrengthTraining || false,
    strength_training_days: localData.strengthTrainingDays || 0,
  } as UserProfile;
};

// ============ PERFILES DE USUARIO ============

/**
 * Obtiene el perfil de un usuario por su ID
 * @param {string} userId - ID del usuario
 * @returns {Promise<UserProfile | null>} El perfil del usuario o null si no existe o hay error
 */
export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  if (isGuest(userId)) {
    return getGuestProfile();
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error al obtener perfil:", error);
    return null;
  }

  return data;
};

/**
 * Crea un nuevo perfil de usuario
 * @param {UserProfileInsert} profile - Datos del perfil a crear
 * @returns {Promise<UserProfile | null>} El perfil creado o null si hay error
 */
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

/**
 * Actualiza un perfil de usuario existente
 * @param {string} userId - ID del usuario
 * @param {UserProfileUpdate} updates - Datos a actualizar
 * @returns {Promise<UserProfile | null>} El perfil actualizado o null si hay error
 */
export const updateUserProfile = async (
  userId: string,
  updates: UserProfileUpdate
): Promise<UserProfile | null> => {
  if (isGuest(userId)) {
    // En modo invitado, simulamos que se guardó
    // Nota: Los stores de nanostores (userProfileStore) ya actualizan localStorage
    // así que aquí solo devolvemos el objeto combinado para que la UI se actualice
    return { ...getGuestProfile(), ...updates } as UserProfile;
  }

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

/**
 * Crea o actualiza un perfil de usuario
 * Si el perfil ya existe, lo actualiza. Si no, lo crea.
 * @param {string} userId - ID del usuario
 * @param {Omit<UserProfileUpdate, "id">} profileData - Datos del perfil
 * @returns {Promise<UserProfile | null>} El perfil creado/actualizado o null si hay error
 */
export const createOrUpdateUserProfile = async (
  userId: string,
  profileData: Omit<UserProfileUpdate, "id">
): Promise<UserProfile | null> => {
  if (isGuest(userId)) {
    return { ...getGuestProfile(), ...profileData } as UserProfile;
  }

  // Primero intentar actualizar
  const { data: updateData, error: updateError } = await supabase
    .from("user_profiles")
    .update(profileData)
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (updateData) {
    return updateData;
  }

  // Si no existe, crear nuevo perfil
  const { data: insertData, error: insertError } = await supabase
    .from("user_profiles")
    .insert({
      id: userId,
      ...profileData,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Error al crear/actualizar perfil:", insertError);
    return null;
  }

  return insertData;
};

// ============ OBJETIVOS DE USUARIO ============

/**
 * Obtiene todos los objetivos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<UserGoal[]>} Lista de objetivos del usuario
 */
export const getUserGoals = async (userId: string): Promise<UserGoal[]> => {
  if (isGuest(userId)) {
    return []; // TODO: Podríamos leer de localStorage "userGoal" si fuera necesario
  }

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

/**
 * Obtiene el objetivo activo de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<UserGoal | null>} El objetivo activo o null si no hay ninguno
 */
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

/**
 * Crea un nuevo objetivo para el usuario
 * Si el nuevo objetivo es activo, desactiva los anteriores
 * @param {UserGoalInsert} goal - Datos del objetivo a crear
 * @returns {Promise<UserGoal | null>} El objetivo creado o null si hay error
 */
export const createUserGoal = async (
  goal: UserGoalInsert
): Promise<UserGoal | null> => {
  if (isGuest(goal.user_id)) {
    return {
      id: "guest-goal-id-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...goal,
      is_active: goal.is_active ?? true
    } as UserGoal;
  }

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

/**
 * Actualiza un objetivo existente
 * @param {string} goalId - ID del objetivo
 * @param {UserGoalUpdate} updates - Datos a actualizar
 * @returns {Promise<UserGoal | null>} El objetivo actualizado o null si hay error
 */
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

/**
 * Establece un objetivo como activo y desactiva los demás
 * @param {string} userId - ID del usuario
 * @param {string} goalId - ID del objetivo a activar
 * @returns {Promise<boolean>} True si la operación fue exitosa
 */
export const setActiveGoal = async (
  userId: string,
  goalId: string
): Promise<boolean> => {
  if (isGuest(userId)) return true;

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

/**
 * Obtiene el historial de registros de peso de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<WeightEntry[]>} Lista de registros de peso ordenados por fecha descendente
 */
export const getWeightEntries = async (
  userId: string
): Promise<WeightEntry[]> => {
  if (isGuest(userId)) {
    // Intentar leer de localStorage
    try {
      const stored = localStorage.getItem("weightLog");
      if (stored) {
        const log = JSON.parse(stored);
        return Object.values(log).map((entry: any, index) => ({
          id: `guest-weight-${index}`,
          user_id: userId,
          weight: entry.weight,
          date: entry.date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: null
        }));
      }
    } catch (e) {}
    return [];
  }

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

/**
 * Obtiene el último registro de peso de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<WeightEntry | null>} El último registro de peso o null si no hay registros
 */
export const getLatestWeight = async (
  userId: string
): Promise<WeightEntry | null> => {
  if (isGuest(userId)) {
    // Intentar leer de localStorage
    try {
      const stored = localStorage.getItem("weightLog");
      if (stored) {
        const log = JSON.parse(stored);
        const entries = Object.values(log).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (entries.length > 0) {
          const entry: any = entries[0];
          return {
            id: "guest-weight-latest",
            user_id: userId,
            weight: entry.weight,
            date: entry.date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            notes: null
          };
        }
      }
    } catch (e) {}
    return null;
  }

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

/**
 * Crea un nuevo registro de peso
 * Utiliza upsert para evitar duplicados en la misma fecha
 * @param {WeightEntryInsert} entry - Datos del registro de peso
 * @returns {Promise<WeightEntry | null>} El registro creado o null si hay error
 */
export const createWeightEntry = async (
  entry: WeightEntryInsert
): Promise<WeightEntry | null> => {
  if (isGuest(entry.user_id)) {
    return {
      id: "guest-weight-" + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: null,
      ...entry
    } as WeightEntry;
  }

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

/**
 * Actualiza un registro de peso existente
 * @param {string} entryId - ID del registro
 * @param {WeightEntryUpdate} updates - Datos a actualizar
 * @returns {Promise<WeightEntry | null>} El registro actualizado o null si hay error
 */
export const updateWeightEntry = async (
  entryId: string,
  updates: WeightEntryUpdate
): Promise<WeightEntry | null> => {
  if (entryId.startsWith("guest-weight")) {
    return {
      id: entryId,
      user_id: "guest-user-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      weight: 0,
      date: new Date().toISOString(),
      notes: null,
      ...updates
    } as WeightEntry;
  }

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

/**
 * Elimina un registro de peso
 * @param {string} entryId - ID del registro a eliminar
 * @returns {Promise<boolean>} True si la eliminación fue exitosa
 */
export const deleteWeightEntry = async (entryId: string): Promise<boolean> => {
  if (entryId.startsWith("guest-weight")) return true;

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

/**
 * Obtiene todos los datos completos del usuario (perfil, objetivos, pesos)
 * Realiza múltiples consultas en paralelo para optimizar la carga
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Objeto con todos los datos del usuario
 */
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
