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
import type { Supplement } from "../types/supplements";

// Extendemos los tipos de modales
export type ExtendedModalType =
  | "shopping"
  | "analysis"
  | "summary"
  | "recipeDetail"
  | "supplementDetail"
  | "nutritionDetail"
  | "mealPlanner"
  | "confirmAction"
  | "notification"
  | null;

// Definimos tipos específicos para los datos de cada modal
export interface ModalDataMap {
  shopping: Ingredient[];
  analysis: any;
  summary: WeeklySummaryData[];
  recipeDetail: Recipe;
  supplementDetail: Supplement;
  nutritionDetail: {
    title: string;
    nutritionalData: any;
    period: "day" | "week" | "meal";
    targetValues?: any;
  };
  mealPlanner: {
    day: string;
    mealType: string;
    currentRecipe?: Recipe | null;
  };
  confirmAction: {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel?: () => void;
    danger?: boolean;
  };
  notification: {
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    autoClose?: boolean;
    duration?: number;
  };
}

// Extendemos el estado del modal para incluir callbacks y opciones
export interface ExtendedModalState {
  isOpen: boolean;
  type: ExtendedModalType | null;
  data: any;
  onClose?: () => void;
  preventOutsideClick?: boolean;
  size?: "small" | "medium" | "large" | "fullscreen";
  position?: "center" | "top" | "bottom" | "left" | "right";
  animation?: "fade" | "slide" | "zoom" | "none";
}

const initialState: ExtendedModalState = {
  isOpen: false,
  type: null,
  data: null,
  preventOutsideClick: false,
  size: "medium",
  position: "center",
  animation: "fade",
};

export const $modal = map<ExtendedModalState>(initialState);

/**
 * Función genérica para abrir el modal con opciones avanzadas
 */
export const openModal = <T extends ExtendedModalType>(
  type: T,
  data: T extends keyof ModalDataMap ? ModalDataMap[T] : any,
  options?: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  $modal.set({
    isOpen: true,
    type,
    data,
    ...options,
  });
};

/**
 * Función para cerrar el modal y ejecutar callback si existe
 */
export const closeModal = () => {
  const currentModal = $modal.get();

  // Ejecutar callback de cierre si existe
  if (currentModal.onClose) {
    currentModal.onClose();
  }

  $modal.set(initialState);
};

// Acciones específicas para tipos de modales

/**
 * Abre el modal de lista de compra
 * @param ingredients Lista de ingredientes para mostrar
 * @param options Opciones adicionales del modal
 */
export const openShoppingListModal = (
  ingredients: Ingredient[],
  options?: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  openModal("shopping", ingredients, { size: "large", ...options });
};

/**
 * Abre el modal de resumen semanal
 * @param summaryData Datos del resumen semanal
 * @param options Opciones adicionales del modal
 */
export const openWeekSummaryModal = (
  summaryData: WeeklySummaryData[],
  options?: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  openModal("summary", summaryData, { size: "large", ...options });
};

/**
 * Abre el modal de detalle de receta
 * @param recipe Receta a mostrar en detalle
 * @param options Opciones adicionales del modal
 */
export const openRecipeDetailModal = (
  recipe: Recipe,
  options?: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  openModal("recipeDetail", recipe, options);
};

/**
 * Abre el modal de detalle de suplemento
 * @param supplement Suplemento a mostrar en detalle
 * @param options Opciones adicionales del modal
 */
export const openSupplementDetailModal = (
  supplement: Supplement,
  options?: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  openModal("supplementDetail", supplement, options);
};

/**
 * Abre el modal de análisis
 * @param data Datos de análisis a mostrar
 * @param options Opciones adicionales del modal
 */
export const openAnalysisModal = (
  data: any,
  options?: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  openModal("analysis", data, { size: "large", ...options });
};

/**
 * Abre el modal de detalle nutricional
 * @param nutritionData Datos nutricionales a mostrar
 * @param options Opciones adicionales del modal
 */
export const openNutritionDetailModal = (
  nutritionData: ModalDataMap["nutritionDetail"],
  options?: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  openModal("nutritionDetail", nutritionData, options);
};

/**
 * Abre el modal de planificador de comidas
 * @param plannerData Datos para el planificador
 * @param options Opciones adicionales del modal
 */
export const openMealPlannerModal = (
  plannerData: ModalDataMap["mealPlanner"],
  options?: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  openModal("mealPlanner", plannerData, { size: "large", ...options });
};

/**
 * Abre un modal de confirmación
 * @param confirmData Datos para la confirmación
 * @param options Opciones adicionales del modal
 */
export const openConfirmModal = (
  confirmData: ModalDataMap["confirmAction"],
  options?: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  openModal("confirmAction", confirmData, {
    size: "small",
    preventOutsideClick: true,
    ...options,
  });
};

/**
 * Abre un modal de notificación
 * @param notificationData Datos para la notificación
 * @param options Opciones adicionales del modal
 */
export const openNotificationModal = (
  notificationData: ModalDataMap["notification"],
  options?: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  // Configurar cierre automático si está habilitado
  let modalOptions = { ...options };

  if (notificationData.autoClose) {
    const duration = notificationData.duration || 3000;

    modalOptions.onClose = options?.onClose;

    // Configurar cierre automático
    setTimeout(() => {
      // Solo cerrar si sigue siendo el mismo modal de notificación
      const currentModal = $modal.get();
      if (currentModal.type === "notification" && currentModal.isOpen) {
        closeModal();
      }
    }, duration);
  }

  openModal("notification", notificationData, {
    size: "small",
    position: "top",
    ...modalOptions,
  });
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
export const getModalType = (): ExtendedModalType | null => {
  return $modal.get().type;
};

/**
 * Obtiene los datos del modal actual
 */
export const getModalData = <
  T extends ExtendedModalType
>(): T extends keyof ModalDataMap ? ModalDataMap[T] : any => {
  const currentModal = $modal.get();
  console.log("Modal actual:", currentModal.type, currentModal.data);
  return currentModal.data;
};

/**
 * Obtiene las opciones del modal actual
 */
export const getModalOptions = (): Omit<
  ExtendedModalState,
  "isOpen" | "type" | "data"
> => {
  const { isOpen, type, data, ...options } = $modal.get();
  return options;
};

/**
 * Actualiza los datos del modal actual
 * @param newData Nuevos datos para el modal
 */
export const updateModalData = <T extends ExtendedModalType>(
  newData: Partial<T extends keyof ModalDataMap ? ModalDataMap[T] : any>
) => {
  const currentModal = $modal.get();
  $modal.setKey("data", { ...currentModal.data, ...newData });
};

/**
 * Actualiza las opciones del modal actual
 * @param newOptions Nuevas opciones para el modal
 */
export const updateModalOptions = (
  newOptions: Partial<Omit<ExtendedModalState, "isOpen" | "type" | "data">>
) => {
  const currentModal = $modal.get();
  $modal.set({ ...currentModal, ...newOptions });
};
