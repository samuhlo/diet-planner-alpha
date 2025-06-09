// src/stores/modalStore.ts
import { map } from "nanostores";

export interface ModalState {
  isOpen: boolean;
  type: "shopping" | "analysis" | "summary" | null;
  data: any; // Los datos que el modal necesita (lista de ingredientes, etc.)
}

const initialState: ModalState = {
  isOpen: false,
  type: null,
  data: null,
};

export const $modal = map<ModalState>(initialState);

// AHORA: Una función normal para abrir el modal.
// Recibe los argumentos y actualiza el store completo con .set()
export const openModal = (type: ModalState["type"], data?: any) => {
  $modal.set({ isOpen: true, type, data: data || null });
};

// AHORA: Una función simple para cerrar el modal.
// No necesita argumentos, simplemente resetea el estado.
export const closeModal = () => {
  $modal.set(initialState);
};
