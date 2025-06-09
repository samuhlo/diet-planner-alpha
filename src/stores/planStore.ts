// src/stores/planStore.ts
import { map } from "nanostores";

// Definimos la estructura de nuestro estado.
// Usamos un 'map' porque nuestro plan es un objeto con claves dinámicas (los días).
export const $plan = map<Record<string, any>>({});

/**
 * Actualiza una sección específica de un día en el plan.
 * @param dayId - El ID del día (ej: 'lunes')
 * @param section - La sección a cambiar (ej: 'desayuno', 'supplement')
 * @param field - El campo a modificar (ej: 'recipeName', 'shakes')
 * @param value - El nuevo valor
 */
export function updatePlanEntry(
  dayId: string,
  section: string,
  field: string,
  value: any
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
