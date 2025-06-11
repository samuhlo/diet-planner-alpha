// src/stores/planStore.ts
import { map } from "nanostores";
import type {
  WeeklyPlan,
  DailyPlan,
  SnackPlan,
  SupplementPlan,
} from "../types";

// Función para cargar el plan desde localStorage
const loadPlanFromStorage = (): WeeklyPlan => {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem("weeklyPlan");
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error al cargar el plan desde localStorage:", error);
    return {};
  }
};

// Función para guardar el plan en localStorage
const savePlanToStorage = (plan: WeeklyPlan) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("weeklyPlan", JSON.stringify(plan));
  } catch (error) {
    console.error("Error al guardar el plan en localStorage:", error);
  }
};

// Definimos la estructura de nuestro estado usando tipos específicos
// Inicializamos con datos desde localStorage
export const $plan = map<WeeklyPlan>(loadPlanFromStorage());

// Suscribirse a cambios en el store para guardar automáticamente
$plan.subscribe((plan) => {
  savePlanToStorage(plan);
});

/**
 * Actualiza una sección específica de un día en el plan.
 * @param dayId - El ID del día (ej: 'lunes')
 * @param section - La sección a cambiar (ej: 'Desayuno', 'supplement', 'snacks')
 * @param field - El campo a modificar (ej: 'recipeName', 'shakes', 'enabled', 'snacks')
 * @param value - El nuevo valor
 */
export function updatePlanEntry(
  dayId: string,
  section: keyof DailyPlan,
  field: string,
  value:
    | string
    | number
    | boolean
    | Array<{ snackId: string; quantity: number }>
    | Array<{ supplementId: string; quantity: number }>
) {
  const currentDayPlan = $plan.get()[dayId] || {};
  const currentSection = currentDayPlan[section] || {};

  const newDayPlan = {
    ...currentDayPlan,
    [section]: {
      ...currentSection,
      [field]: value,
    },
  };

  // Actualizamos la store con el nuevo estado para ese día.
  $plan.setKey(dayId, newDayPlan);
}

/**
 * Actualiza el plan de snacks completo para un día
 */
export function updateSnackPlan(dayId: string, snackPlan: SnackPlan) {
  const currentDayPlan = $plan.get()[dayId] || {};

  const newDayPlan = {
    ...currentDayPlan,
    snacks: snackPlan,
  };

  $plan.setKey(dayId, newDayPlan);
}

/**
 * Actualiza el plan de suplementos completo para un día
 */
export function updateSupplementPlan(
  dayId: string,
  supplementPlan: SupplementPlan
) {
  const currentDayPlan = $plan.get()[dayId] || {};

  const newDayPlan = {
    ...currentDayPlan,
    supplement: supplementPlan,
  };

  $plan.setKey(dayId, newDayPlan);
}

/**
 * Limpia todo el plan semanal (útil para resetear)
 */
export function clearWeeklyPlan() {
  $plan.set({});
}

/**
 * Carga un plan específico (útil para importar planes)
 */
export function loadWeeklyPlan(plan: WeeklyPlan) {
  $plan.set(plan);
}
