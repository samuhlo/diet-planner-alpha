import { map, computed } from "nanostores";
import { $authState, setUser } from "./authStore";
import type { UserData, UserGoal } from "../types";

// Tipos para datos sincronizados
export interface SyncedUserData {
  // Datos de Clerk (solo lectura en este store)
  clerkId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;

  // Datos nutricionales locales (escritura permitida)
  nutritionalData: UserData | null;
  goals: UserGoal | null;

  // Estado de sincronización
  isSynced: boolean;
  lastSyncAt: string | null;
}

// Estado inicial
const initialSyncState: SyncedUserData = {
  clerkId: null,
  email: null,
  firstName: null,
  lastName: null,
  profileImageUrl: null,
  nutritionalData: null,
  goals: null,
  isSynced: false,
  lastSyncAt: null,
};

// Store principal de sincronización
export const $syncedUserData = map<SyncedUserData>(initialSyncState);

// Función para sincronizar datos de Clerk
export const syncClerkData = (clerkUser: any) => {
  if (!clerkUser) {
    $syncedUserData.set(initialSyncState);
    return;
  }

  const currentData = $syncedUserData.get();

  $syncedUserData.set({
    ...currentData,
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses?.[0]?.emailAddress || null,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    profileImageUrl: clerkUser.profileImageUrl,
    isSynced: true,
    lastSyncAt: new Date().toISOString(),
  });

  // También actualizar el authStore
  setUser(clerkUser);
};

// Función para actualizar datos nutricionales
export const updateNutritionalData = (data: UserData) => {
  const currentData = $syncedUserData.get();
  $syncedUserData.set({
    ...currentData,
    nutritionalData: data,
    lastSyncAt: new Date().toISOString(),
  });

  // Guardar en localStorage como backup
  if (typeof window !== "undefined") {
    localStorage.setItem("nutritionalData", JSON.stringify(data));
  }
};

// Función para actualizar objetivos
export const updateUserGoals = (goals: UserGoal) => {
  const currentData = $syncedUserData.get();
  $syncedUserData.set({
    ...currentData,
    goals,
    lastSyncAt: new Date().toISOString(),
  });

  // Guardar en localStorage como backup
  if (typeof window !== "undefined") {
    localStorage.setItem("userGoals", JSON.stringify(goals));
  }
};

// Función para cargar datos del localStorage (migración/backup)
export const loadLocalData = () => {
  if (typeof window === "undefined") return;

  try {
    const nutritionalData = localStorage.getItem("nutritionalData");
    const userGoals = localStorage.getItem("userGoals");

    const currentData = $syncedUserData.get();

    $syncedUserData.set({
      ...currentData,
      nutritionalData: nutritionalData ? JSON.parse(nutritionalData) : null,
      goals: userGoals ? JSON.parse(userGoals) : null,
    });
  } catch (error) {
    console.error("Error loading local data:", error);
  }
};

// Stores computadas para facilitar el acceso
export const $userProfile = computed($syncedUserData, (data) => ({
  fullName:
    data.firstName && data.lastName
      ? `${data.firstName} ${data.lastName}`
      : data.firstName || data.email || "Usuario",
  initials:
    data.firstName && data.lastName
      ? `${data.firstName[0]}${data.lastName[0]}`
      : data.firstName
      ? data.firstName[0]
      : data.email
      ? data.email[0].toUpperCase()
      : "U",
  ...data,
}));

export const $isProfileComplete = computed($syncedUserData, (data) => {
  const hasClerkData = !!data.clerkId;
  const hasNutritionalData = !!(
    data.nutritionalData?.weight &&
    data.nutritionalData?.height &&
    data.nutritionalData?.age
  );
  const hasGoals = !!(
    data.goals?.startDate &&
    data.goals?.endDate &&
    data.goals?.targetWeight
  );

  return hasClerkData && hasNutritionalData && hasGoals;
});

// Función para limpiar datos al cerrar sesión
export const clearSyncedData = () => {
  $syncedUserData.set(initialSyncState);

  // Limpiar localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("nutritionalData");
    localStorage.removeItem("userGoals");
  }
};
