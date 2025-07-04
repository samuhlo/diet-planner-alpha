// src/stores/planStore.ts
import { map } from "nanostores";
import type {
  WeeklyPlan,
  DailyPlan,
  SnackPlan,
  SupplementPlan,
  DessertPlan,
  MealPlan,
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
    | Array<{ dessertId: string; quantity: number }>
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
 * Actualiza el plan de una comida específica para un día
 * @param dayId - El ID del día
 * @param mealType - El tipo de comida ('Desayuno', 'Almuerzo', 'Cena')
 * @param mealPlan - Los datos del plan de comida, o undefined para eliminar
 */
export function updateMealPlan(
  dayId: string,
  mealType: string,
  mealPlan?: MealPlan
) {
  const currentDayPlan = $plan.get()[dayId] || {};

  // Si mealPlan es undefined, eliminar la comida
  if (mealPlan === undefined) {
    const newDayPlan = { ...currentDayPlan };
    delete newDayPlan[mealType as keyof DailyPlan];
    $plan.setKey(dayId, newDayPlan);
  } else {
    // Actualizar la comida con el nuevo plan
    const newDayPlan = {
      ...currentDayPlan,
      [mealType]: mealPlan,
    };
    $plan.setKey(dayId, newDayPlan);
  }
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
 * Actualiza el plan de postres completo para un día
 */
export function updateDessertPlan(dayId: string, dessertPlan: DessertPlan) {
  const currentDayPlan = $plan.get()[dayId] || {};

  const newDayPlan = {
    ...currentDayPlan,
    desserts: dessertPlan,
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

/**
 * Actualiza múltiples secciones de un día a la vez
 * @param dayId - El ID del día a actualizar
 * @param updates - Objeto con las secciones y valores a actualizar
 */
export function updateDayPlan(dayId: string, updates: Partial<DailyPlan>) {
  const currentDayPlan = $plan.get()[dayId] || {};

  const newDayPlan = {
    ...currentDayPlan,
    ...updates,
  };

  $plan.setKey(dayId, newDayPlan);
}

/**
 * Copia el plan de un día a otro
 * @param sourceDayId - El ID del día de origen
 * @param targetDayId - El ID del día de destino
 */
export function copyDayPlan(sourceDayId: string, targetDayId: string) {
  const currentPlan = $plan.get();
  const sourceDayPlan = currentPlan[sourceDayId];

  if (sourceDayPlan) {
    $plan.setKey(targetDayId, { ...sourceDayPlan });
  }
}

/**
 * Elimina un día completo del plan
 * @param dayId - El ID del día a eliminar
 */
export function clearDayPlan(dayId: string) {
  const currentPlan = $plan.get();
  const newPlan = { ...currentPlan };
  delete newPlan[dayId];
  $plan.set(newPlan);
}

/**
 * Obtiene el plan para un día específico
 * @param dayId - El ID del día
 */
export function getDayPlan(dayId: string) {
  return $plan.get()[dayId] || {};
}

/**
 * Comprueba si hay algún contenido en el plan semanal
 */
export function hasPlanContent(): boolean {
  const currentPlan = $plan.get();
  return Object.keys(currentPlan).length > 0;
}
