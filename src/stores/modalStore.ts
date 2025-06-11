// src/stores/modalStore.ts
import { map } from "nanostores";
import type { ModalState, ModalType, Recipe, Ingredient } from "../types";

const initialState: ModalState = {
  isOpen: false,
  type: null,
  data: null,
};

export const $modal = map<ModalState>(initialState);

// Función para abrir el modal con tipos específicos
export const openModal = (
  type: ModalType,
  data?: Recipe[] | Ingredient[] | null
) => {
  $modal.set({ isOpen: true, type, data: data || null });
};

// Función para cerrar el modal
export const closeModal = () => {
  $modal.set(initialState);
};
