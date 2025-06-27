import { map } from "nanostores";
import { DAYS_OF_WEEK } from "../config/appConstants";

// Definimos la estructura del estado de la UI del planificador
interface PlannerUIState {
  expandedDays: Set<string>;
  activeTab: string;
  selectedDay: string | null;
  isEditing: boolean;
  viewMode: "week" | "day";
  showNutritionSummary: boolean;
}

// Inicializamos con un estado por defecto
export const $plannerUI = map<PlannerUIState>({
  expandedDays: new Set(),
  activeTab: "plan",
  selectedDay: null,
  isEditing: false,
  viewMode: "week",
  showNutritionSummary: true,
});

/**
 * Expande o colapsa un día específico
 * @param dayId - El ID del día a expandir/colapsar
 */
export function toggleDayExpansion(dayId: string) {
  const currentExpanded = $plannerUI.get().expandedDays;
  const newExpanded = new Set(currentExpanded);

  if (newExpanded.has(dayId)) {
    newExpanded.delete(dayId);
  } else {
    newExpanded.add(dayId);
  }

  $plannerUI.setKey("expandedDays", newExpanded);
}

/**
 * Expande todos los días
 */
export function expandAllDays() {
  const allDays = new Set(DAYS_OF_WEEK.map((day) => day.toLowerCase()));
  $plannerUI.setKey("expandedDays", allDays);
}

/**
 * Colapsa todos los días
 */
export function collapseAllDays() {
  $plannerUI.setKey("expandedDays", new Set());
}

/**
 * Cambia la pestaña activa
 * @param tab - La pestaña a activar
 */
export function setActiveTab(tab: string) {
  $plannerUI.setKey("activeTab", tab);
}

/**
 * Selecciona un día específico
 * @param dayId - El ID del día a seleccionar
 */
export function selectDay(dayId: string | null) {
  $plannerUI.setKey("selectedDay", dayId);

  // Si seleccionamos un día, cambiamos automáticamente a la vista diaria
  if (dayId) {
    $plannerUI.setKey("viewMode", "day");
  }
}

/**
 * Cambia el modo de edición
 * @param isEditing - Si está en modo edición o no
 */
export function setEditingMode(isEditing: boolean) {
  $plannerUI.setKey("isEditing", isEditing);
}

/**
 * Cambia el modo de visualización
 * @param mode - El modo de visualización ('week' o 'day')
 */
export function setViewMode(mode: "week" | "day") {
  $plannerUI.setKey("viewMode", mode);
}

/**
 * Muestra u oculta el resumen nutricional
 * @param show - Si se debe mostrar el resumen nutricional
 */
export function toggleNutritionSummary(show?: boolean) {
  const currentValue = $plannerUI.get().showNutritionSummary;
  const newValue = show !== undefined ? show : !currentValue;
  $plannerUI.setKey("showNutritionSummary", newValue);
}

/**
 * Comprueba si un día está expandido
 * @param dayId - El ID del día a comprobar
 */
export function isDayExpanded(dayId: string): boolean {
  return $plannerUI.get().expandedDays.has(dayId);
}

/**
 * Obtiene la pestaña activa
 */
export function getActiveTab(): string {
  return $plannerUI.get().activeTab;
}

/**
 * Obtiene el día seleccionado
 */
export function getSelectedDay(): string | null {
  return $plannerUI.get().selectedDay;
}

/**
 * Comprueba si está en modo edición
 */
export function isEditing(): boolean {
  return $plannerUI.get().isEditing;
}

/**
 * Obtiene el modo de visualización
 */
export function getViewMode(): "week" | "day" {
  return $plannerUI.get().viewMode;
}

/**
 * Comprueba si se debe mostrar el resumen nutricional
 */
export function shouldShowNutritionSummary(): boolean {
  return $plannerUI.get().showNutritionSummary;
}
