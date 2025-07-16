import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  createUserGoal,
  createWeightEntry,
  getCompleteUserData,
} from "./databaseService";
import type {
  UserData,
  UserGoal as LocalUserGoal,
  WeightEntry as LocalWeightEntry,
} from "../types";
import type {
  UserProfileInsert,
  UserGoalInsert,
  WeightEntryInsert,
} from "../types/database";

// Función para detectar datos en localStorage
const getLocalStorageData = () => {
  if (typeof window === "undefined") return null;

  try {
    const userData = localStorage.getItem("userData");
    const userGoal = localStorage.getItem("userGoal");
    const weightLog = localStorage.getItem("weightLog");

    return {
      userData: userData ? JSON.parse(userData) : null,
      userGoal: userGoal ? JSON.parse(userGoal) : null,
      weightLog: weightLog ? JSON.parse(weightLog) : null,
    };
  } catch (error) {
    console.error("Error al leer localStorage:", error);
    return null;
  }
};

// Función para limpiar localStorage después de migración exitosa
const clearLocalStorageData = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("userData");
  localStorage.removeItem("userGoal");
  localStorage.removeItem("weightLog");
  console.log("✅ Datos locales limpiados después de migración exitosa");
};

// Función para convertir datos locales a formato de Supabase
const convertUserDataToProfile = (
  userData: UserData,
  userId: string,
  userEmail: string
): UserProfileInsert => {
  return {
    id: userId,
    email: userEmail,
    weight: userData.weight || undefined,
    height: userData.height || undefined,
    age: userData.age || undefined,
    gender: (userData.gender as any) || undefined,
  };
};

const convertLocalGoalToSupabase = (
  localGoal: LocalUserGoal,
  userId: string
): UserGoalInsert => {
  return {
    user_id: userId,
    start_date: localGoal.startDate || undefined,
    end_date: localGoal.endDate || undefined,
    target_weight: localGoal.targetWeight || undefined,
    goal_type: (localGoal.goalType as any) || undefined,
    is_active: true,
  };
};

const convertWeightLogToEntries = (
  weightLog: Record<string, LocalWeightEntry>,
  userId: string
): WeightEntryInsert[] => {
  return Object.values(weightLog).map((entry) => ({
    user_id: userId,
    weight: entry.weight,
    date: entry.date,
    notes: undefined, // Los datos locales no tienen notas
  }));
};

// Función principal de migración
export const migrateLocalDataToSupabase = async (
  userId: string,
  userEmail: string
): Promise<{
  success: boolean;
  migratedData: {
    profile: boolean;
    goal: boolean;
    weightEntries: number;
  };
  errors: string[];
}> => {
  const errors: string[] = [];
  const migratedData = {
    profile: false,
    goal: false,
    weightEntries: 0,
  };

  try {
    console.log("🔄 Iniciando migración de datos locales...");

    // 1. Verificar si ya existe perfil en Supabase
    const existingProfile = await getUserProfile(userId);

    // 2. Obtener datos locales
    const localData = getLocalStorageData();

    if (!localData) {
      console.log("ℹ️ No se encontraron datos locales para migrar");
      return { success: true, migratedData, errors };
    }

    // 3. Migrar perfil de usuario si hay datos locales y no existe perfil remoto con datos completos
    if (localData.userData && (!existingProfile || !existingProfile.weight)) {
      try {
        const profileData = convertUserDataToProfile(
          localData.userData,
          userId,
          userEmail
        );

        if (existingProfile) {
          // Actualizar perfil existente
          await updateUserProfile(userId, profileData);
        } else {
          // Crear nuevo perfil
          await createUserProfile(profileData);
        }

        migratedData.profile = true;
        if (import.meta.env.DEV) {
          console.log("✅ Perfil de usuario migrado");
        }
      } catch (error) {
        const errorMsg = `Error al migrar perfil: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // 4. Migrar objetivo si existe
    if (localData.userGoal && localData.userGoal.startDate) {
      try {
        const goalData = convertLocalGoalToSupabase(localData.userGoal, userId);
        await createUserGoal(goalData);
        migratedData.goal = true;
        if (import.meta.env.DEV) {
          console.log("✅ Objetivo migrado");
        }
      } catch (error) {
        const errorMsg = `Error al migrar objetivo: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // 5. Migrar registros de peso
    if (localData.weightLog && Object.keys(localData.weightLog).length > 0) {
      try {
        const weightEntries = convertWeightLogToEntries(
          localData.weightLog,
          userId
        );

        for (const entry of weightEntries) {
          try {
            await createWeightEntry(entry);
            migratedData.weightEntries++;
          } catch (error) {
            console.warn(
              `Error al migrar entrada de peso ${entry.date}:`,
              error
            );
          }
        }

        if (import.meta.env.DEV) {
          console.log(
            `✅ ${migratedData.weightEntries} registros de peso migrados`
          );
        }
      } catch (error) {
        const errorMsg = `Error al migrar registros de peso: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    // 6. Limpiar localStorage si la migración fue exitosa
    if (
      errors.length === 0 &&
      (migratedData.profile ||
        migratedData.goal ||
        migratedData.weightEntries > 0)
    ) {
      clearLocalStorageData();
    }

    if (import.meta.env.DEV) {
      console.log("🎉 Migración completada:", migratedData);
    }
    return { success: errors.length === 0, migratedData, errors };
  } catch (error) {
    const errorMsg = `Error general en migración: ${error}`;
    errors.push(errorMsg);
    console.error(errorMsg);
    return { success: false, migratedData, errors };
  }
};

// Función para verificar si hay datos locales pendientes de migrar
export const hasLocalDataToMigrate = (): boolean => {
  if (typeof window === "undefined") return false;

  const localData = getLocalStorageData();

  if (!localData) return false;

  // Verificar si hay datos significativos
  const hasUserData = localData.userData && localData.userData.weight;
  const hasGoalData = localData.userGoal && localData.userGoal.startDate;
  const hasWeightData =
    localData.weightLog && Object.keys(localData.weightLog).length > 0;

  return hasUserData || hasGoalData || hasWeightData;
};

// Función para sincronizar datos después del login
export const syncUserDataAfterLogin = async (
  userId: string,
  userEmail: string
) => {
  try {
    // 1. Intentar migración si hay datos locales
    if (hasLocalDataToMigrate()) {
      const migrationResult = await migrateLocalDataToSupabase(
        userId,
        userEmail
      );

      if (migrationResult.success) {
        if (import.meta.env.DEV) {
          console.log("✅ Datos migrados exitosamente");
        }
      } else {
        console.warn(
          "⚠️ Algunos datos no pudieron migrarse:",
          migrationResult.errors
        );
      }
    }

    // 2. Obtener datos actualizados de Supabase
    const userData = await getCompleteUserData(userId);

    return userData;
  } catch (error) {
    console.error("Error en sincronización post-login:", error);
    return null;
  }
};
