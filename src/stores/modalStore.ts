// src/stores/modalStore.ts
import { map } from "nanostores";
import type { Recipe, Ingredient, WeeklySummaryData } from "../types";
import type { Supplement } from "../types/supplements";

// Tipos de modales simples
export type ModalType =
  | "shopping"
  | "summary"
  | "recipeDetail"
  | "supplementDetail"
  | "nutritionDetail"
  | "confirmAction"
  | "notification"
  | null;

// Estado simple del modal
export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data: any;
}

const initialState: ModalState = {
  isOpen: false,
  type: null,
  data: null,
};

export const $modal = map<ModalState>(initialState);

/**
 * Función para abrir cualquier modal
 */
export const openModal = (type: ModalType, data: any) => {
  $modal.set({
    isOpen: true,
    type,
    data,
  });
};

/**
 * Función para cerrar el modal
 */
export const closeModal = () => {
  $modal.set(initialState);
};

/**
 * Obtener datos del modal actual
 */
export const getModalData = () => {
  return $modal.get().data;
};

// Funciones específicas para cada tipo de modal

/**
 * Abre el modal de lista de compra
 */
export const openShoppingListModal = (ingredients: Ingredient[]) => {
  openModal("shopping", ingredients);
};

/**
 * Abre el modal de resumen semanal
 */
export const openWeekSummaryModal = (summaryData: WeeklySummaryData[]) => {
  openModal("summary", summaryData);
};

/**
 * Abre el modal de detalle de receta
 */
export const openRecipeDetailModal = (recipe: Recipe) => {
  openModal("recipeDetail", recipe);
};

/**
 * Abre el modal de detalle de suplemento
 */
export const openSupplementDetailModal = (supplement: Supplement) => {
  openModal("supplementDetail", supplement);
};

/**
 * Comprueba si hay un modal abierto
 */
export const isModalOpen = (): boolean => {
  return $modal.get().isOpen;
};
