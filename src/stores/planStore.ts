// src/stores/planStore.ts
import { map } from "nanostores";
import type { WeeklyPlan, DailyPlan, SnackPlan } from "../types";

// Definimos la estructura de nuestro estado usando tipos específicos
export const $plan = map<WeeklyPlan>({});

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
