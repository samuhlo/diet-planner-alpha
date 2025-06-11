// src/stores/userProfileStore.ts
import { map, computed } from "nanostores";
import type { UserData, UserGoal, WeightEntry } from "../types";

// --- FUNCIÓN AUXILIAR ---
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

export const setUserData = (newUserData: UserData | null) => {
  $userData.set(newUserData);
};

// --- STORE DEL OBJETIVO ---
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

export const updateUserGoal = <K extends keyof UserGoal>(
  key: K,
  value: UserGoal[K]
) => {
  const currentGoal = $userGoal.get();
  $userGoal.set({ ...currentGoal, [key]: value });
};

// --- STORE COMPUTADA PARA VERIFICACIÓN ---
export const $isProfileComplete = computed(
  [$userData, $userGoal],
  (userData, userGoal) => {
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
const defaultWeightLog: Record<string, WeightEntry> = {};
export const $weightLog = map<Record<string, WeightEntry>>(
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

export const addWeightEntry = (entry: WeightEntry) => {
  const id = `entry-${Date.now()}`;
  $weightLog.setKey(id, entry);
  return id;
};
