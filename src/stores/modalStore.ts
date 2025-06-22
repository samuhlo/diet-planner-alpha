// src/stores/modalStore.ts
import { map } from "nanostores";
import type {
  ModalState,
  ModalType,
  Recipe,
  Ingredient,
  WeeklySummaryData,
} from "../types";

const initialState: ModalState = {
  isOpen: false,
  type: null,
  data: null,
};

export const $modal = map<ModalState>(initialState);

// Función para abrir el modal con tipos específicos
// Para 'recipeDetail', pasar un solo objeto Recipe como data
export const openModal = (
  type: ModalType,
  data?: Recipe | Recipe[] | Ingredient[] | WeeklySummaryData[] | null
) => {
  $modal.set({ isOpen: true, type, data: data || null });
};

// Función para cerrar el modal
export const closeModal = () => {
  $modal.set(initialState);
};
