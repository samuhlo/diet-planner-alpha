// src/stores/modalStore.ts
import { map } from "nanostores";
import type {
  ModalState,
  ModalType,
  Recipe,
  Ingredient,
  WeeklySummaryData,
  Snack,
} from "../types";

const initialState: ModalState = {
  isOpen: false,
  type: null,
  data: null,
};

export const $modal = map<ModalState>(initialState);

// Función genérica para abrir el modal con tipos específicos
// Para 'recipeDetail', pasar un solo objeto Recipe como data
export const openModal = (
  type: ModalType,
  data?: Recipe | Recipe[] | Ingredient[] | WeeklySummaryData[] | Snack[] | null
) => {
  $modal.set({ isOpen: true, type, data: data || null });
};

// Función para cerrar el modal
export const closeModal = () => {
  $modal.set(initialState);
};

// Acciones específicas para tipos de modales comunes

/**
 * Abre el modal de lista de compra
 * @param ingredients Lista de ingredientes para mostrar
 */
export const openShoppingListModal = (ingredients: Ingredient[]) => {
  openModal("shopping", ingredients as any);
};

/**
 * Abre el modal de resumen semanal
 * @param summaryData Datos del resumen semanal
 */
export const openWeekSummaryModal = (summaryData: WeeklySummaryData[]) => {
  openModal("summary", summaryData as any);
};

/**
 * Abre el modal de detalle de receta
 * @param recipe Receta a mostrar en detalle
 */
export const openRecipeDetailModal = (recipe: Recipe) => {
  openModal("recipeDetail", recipe);
};

/**
 * Abre el modal de análisis
 * @param data Datos de análisis a mostrar
 */
export const openAnalysisModal = (data: any) => {
  openModal("analysis", data);
};

/**
 * Comprueba si hay un modal abierto
 */
export const isModalOpen = (): boolean => {
  return $modal.get().isOpen;
};

/**
 * Obtiene el tipo de modal actual
 */
export const getModalType = (): ModalType => {
  return $modal.get().type;
};

/**
 * Obtiene los datos del modal actual
 */
export const getModalData = (): any => {
  return $modal.get().data;
};
