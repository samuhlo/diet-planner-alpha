// src/stores/userProfileStore.ts
import { map, computed } from "nanostores";
import type { UserData, UserGoal, WeightEntry } from "../types";
import { NutritionService } from "../services/nutritionService";

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

export const updateUserWeight = (weight: number) => {
  const currentUserData = $userData.get();
  if (currentUserData) {
    $userData.setKey("weight", weight);
  } else {
    // Si no hay datos de usuario, crear un objeto básico con el peso
    $userData.set({ weight });
  }
};

// --- STORE DEL OBJETIVO ---
const defaultGoal: UserGoal = {
  startDate: "",
  endDate: "",
  targetWeight: 0,
  goalType: "maintain", // Por defecto mantener peso
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

  // Actualizar automáticamente el peso del usuario con el nuevo peso
  updateUserWeight(entry.weight);

  return id;
};

/**
 * Store computada que calcula los objetivos nutricionales basados en los datos del usuario
 */
export const $nutritionalGoals = computed(
  [$userData, $userGoal],
  (userData, userGoal) => {
    // Si no hay datos suficientes, devolver valores por defecto
    if (!userData || !userGoal) {
      return {
        calorieGoal: 2000,
        proteinGoal: 120,
        carbGoal: 200,
        fatGoal: 65,
        isCalculated: false,
      };
    }

    // Calcular los objetivos nutricionales
    const tdee = NutritionService.calculateTDEE(userData);

    // Determinar el objetivo calórico basado en el tipo de objetivo
    let calorieGoal = tdee;

    if (userGoal.goalType === "lose") {
      // Calcular déficit para pérdida de peso
      const startWeight = userData.weight;
      const targetWeight = userGoal.targetWeight;
      const weightDiff = startWeight - targetWeight;

      // Calcular duración en semanas
      const startDate = new Date(userGoal.startDate);
      const endDate = new Date(userGoal.endDate);
      const durationWeeks = Math.max(
        1,
        Math.round(
          (endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
        )
      );

      // Calcular pérdida semanal
      const weeklyLoss = weightDiff / durationWeeks;

      // Calcular calorías objetivo
      calorieGoal = NutritionService.calculateTargetCalories(
        userData,
        weeklyLoss
      );
    }

    // Calcular macronutrientes
    const proteinGoal = NutritionService.calculateProteinIntake(userData);
    const proteinCalories = proteinGoal * 4; // 4 kcal por gramo de proteína

    // Distribuir el resto de calorías entre carbos y grasas (40% carbos, 60% grasas)
    const remainingCalories = calorieGoal - proteinCalories;
    const carbCalories = remainingCalories * 0.4;
    const fatCalories = remainingCalories * 0.6;

    const carbGoal = Math.round(carbCalories / 4); // 4 kcal por gramo de carbos
    const fatGoal = Math.round(fatCalories / 9); // 9 kcal por gramo de grasa

    return {
      calorieGoal: Math.round(calorieGoal),
      proteinGoal,
      carbGoal,
      fatGoal,
      isCalculated: true,
    };
  }
);
