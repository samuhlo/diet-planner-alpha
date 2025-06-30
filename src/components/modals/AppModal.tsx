import { useEffect, useRef } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $modal, closeModal } from "../../stores/modalStore";
import RecipeDetailModal from "./RecipeDetailModal";
import ShoppingListContent from "./ShoppingListContent";
import SummaryContent from "./SummaryContent";
import SupplementDetailModal from "./SupplementDetailModal";
import NutritionDetailModal from "./NutritionDetailModal";
import ConfirmModal from "./ConfirmModal";
import NotificationModal from "./NotificationModal";

/**
 * Componente principal que gestiona todos los modales de la aplicación
 *
 * Funcionalidades:
 * - Renderiza diferentes tipos de modales según el estado
 * - Maneja cierre con ESC y clic fuera
 * - Bloquea scroll del body cuando está abierto
 * - Estilos responsive con Tailwind CSS
 *
 * Tipos de modales soportados:
 * - recipeDetail: Detalles de receta
 * - shopping: Lista de la compra
 * - summary: Resumen semanal
 * - supplementDetail: Detalles de suplemento
 * - nutritionDetail: Información nutricional
 * - confirmAction: Confirmación de acciones
 * - notification: Notificaciones
 */
const AppModal = () => {
  const modalState = useStore($modal);
  const modalRef = useRef<HTMLDivElement>(null);

  // Efecto para manejar el cierre con la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalState.isOpen) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [modalState.isOpen]);

  // Efecto para bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (modalState.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalState.isOpen]);

  // Manejar clic fuera del modal para cerrarlo
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!modalState.isOpen) {
    return null;
  }

  // Renderizar el contenido apropiado según el tipo de modal
  const renderModalContent = () => {
    switch (modalState.type) {
      case "recipeDetail":
        return <RecipeDetailModal />;

      case "shopping":
        return (
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Lista de la Compra
              </h2>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ShoppingListContent data={modalState.data} />
            </div>
          </div>
        );

      case "summary":
        return (
          <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Resumen Semanal
              </h2>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <SummaryContent data={modalState.data} />
            </div>
          </div>
        );

      case "supplementDetail":
        return <SupplementDetailModal />;

      case "nutritionDetail":
        return <NutritionDetailModal />;

      case "confirmAction":
        return <ConfirmModal />;

      case "notification":
        return <NotificationModal />;

      default:
        return (
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Modal no implementado</h2>
            <p>Tipo de modal: {modalState.type}</p>
            <button
              onClick={closeModal}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Cerrar
            </button>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative"
        onClick={(e) => e.stopPropagation()}
      >
        {renderModalContent()}
      </div>
    </div>
  );
};

export default AppModal;
