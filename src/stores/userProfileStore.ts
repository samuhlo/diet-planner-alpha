// src/stores/userProfileStore.ts
import { map, computed } from "nanostores";

// --- TIPOS (Mejorado para seguridad y claridad en lugar de `any`) ---
type UserData = {
  weight: number;
  height: number;
  age: number;
  gender: string;
  steps: number;
  doesStrengthTraining: boolean;
  strengthTrainingDays: number;
  // ...otras propiedades que puedas tener
};

type UserGoal = {
  startDate: string;
  endDate: string;
  targetWeight: number;
  // ...otras propiedades
};

// --- FUNCIÓN AUXILIAR ---
// Sin cambios aquí, esta función es correcta.
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    try {
      if (item) return JSON.parse(item);
    } catch (e) {
      console.error(`Error parsing localStorage item ${key}:`, e);
    }
  }
  return defaultValue;
};

// --- STORE DE DATOS PERSONALES ---
// El store puede contener un objeto UserData o ser null.
export const $userData = map<UserData | any>(getFromStorage("userData", null));

$userData.subscribe((value) => {
  if (typeof window !== "undefined") {
    if (value) {
      localStorage.setItem("userData", JSON.stringify(value));
    } else {
      localStorage.removeItem("userData");
    }
  }
});

// AHORA: Una función helper para establecer o limpiar los datos del usuario.
export const setUserData = (newUserData: UserData | any) => {
  $userData.set(newUserData);
};

// --- STORE DEL OBJETIVO ---
// El store puede contener un objeto UserGoal o ser null.
const defaultGoal: UserGoal = {
  startDate: "",
  endDate: "",
  targetWeight: 0,
};

export const $userGoal = map<UserGoal>(getFromStorage("userGoal", defaultGoal));

$userGoal.subscribe((value) => {
  if (typeof window !== "undefined") {
    if (value) {
      localStorage.setItem("userGoal", JSON.stringify(value));
    } else {
      localStorage.removeItem("userGoal");
    }
  }
});

// AHORA: Una función para actualizar una clave. Nota: Asume que $userGoal no es null al llamarla.
export const updateUserGoal = <K extends keyof UserGoal>(
  key: K,
  value: UserGoal[K]
) => {
  const currentGoal = $userGoal.get() || {};
  $userGoal.set({ ...currentGoal, [key]: value });
};

// --- STORE COMPUTADA PARA VERIFICACIÓN ---
// CORRECTO: `computed` ya usa la API moderna, no necesita cambios.
// Esta store deriva su valor de otras y reacciona a sus cambios automáticamente.
export const $isProfileComplete = computed(
  [$userData, $userGoal],
  (userData, userGoal) => {
    // Comprobamos que los objetos no sean nulos y que tengan las propiedades necesarias.
    const isDataComplete =
      userData && userData.weight && userData.height && userData.age;
    const isGoalComplete =
      userGoal &&
      userGoal.startDate &&
      userGoal.endDate &&
      userGoal.targetWeight;

    return !!isDataComplete && !!isGoalComplete;
  }
);

// --- STORE DEL REGISTRO DE PESO ---
const defaultWeightLog: Record<string, { weight: number; date: string }> = {};
export const $weightLog = map<Record<string, { weight: number; date: string }>>(
  getFromStorage("weightLog", defaultWeightLog)
);

$weightLog.subscribe((value) => {
  if (typeof window !== "undefined") {
    if (value && Object.keys(value).length > 0) {
      localStorage.setItem("weightLog", JSON.stringify(value));
    } else {
      localStorage.removeItem("weightLog");
    }
  }
});

// Función para añadir una nueva entrada de peso
export const addWeightEntry = (entry: { weight: number; date: string }) => {
  const id = `entry-${Date.now()}`;
  $weightLog.setKey(id, entry);
  return id;
};
