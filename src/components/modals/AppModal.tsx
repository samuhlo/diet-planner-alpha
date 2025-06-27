import React, { useEffect, useRef } from "preact/compat";
import { useStore } from "@nanostores/preact";
import { $modal, closeModal, getModalOptions } from "../../stores/modalStore";
import RecipeDetailModal from "./RecipeDetailModal";
import ShoppingListContent from "./ShoppingListContent";
import SummaryContent from "./SummaryContent";
import SupplementDetailModal from "./SupplementDetailModal";
import NutritionDetailModal from "./NutritionDetailModal";
import MealPlannerModal from "./MealPlannerModal";
import ConfirmModal from "./ConfirmModal";
import NotificationModal from "./NotificationModal";

const AppModal: React.FC = () => {
  const modalState = useStore($modal);
  const modalRef = useRef<HTMLDivElement>(null);

  console.log("Estado del modal en AppModal:", modalState);

  // Efecto para manejar el cierre con la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        modalState.isOpen &&
        !modalState.preventOutsideClick
      ) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [modalState.isOpen, modalState.preventOutsideClick]);

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
    if (
      modalRef.current &&
      !modalRef.current.contains(e.target as Node) &&
      !modalState.preventOutsideClick
    ) {
      closeModal();
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!modalState.isOpen) {
    return null;
  }

  // Determinar clases CSS basadas en las opciones del modal
  const getModalClasses = () => {
    const options = getModalOptions();
    const sizeClass = `modal-${options.size || "medium"}`;
    const positionClass = `modal-position-${options.position || "center"}`;
    const animationClass = `modal-animation-${options.animation || "fade"}`;

    return `modal-content ${sizeClass} ${positionClass} ${animationClass}`;
  };

  // Renderizar el contenido apropiado según el tipo de modal
  const renderModalContent = () => {
    console.log("Renderizando contenido para tipo de modal:", modalState.type);

    switch (modalState.type) {
      case "recipeDetail":
        console.log(
          "Renderizando RecipeDetailModal con datos:",
          modalState.data
        );
        return <RecipeDetailModal />;

      case "shopping":
        return <ShoppingListContent data={modalState.data} />;

      case "summary":
        return <SummaryContent data={modalState.data} />;

      case "supplementDetail":
        return <SupplementDetailModal />;

      case "nutritionDetail":
        return <NutritionDetailModal />;

      case "mealPlanner":
        return <MealPlannerModal />;

      case "confirmAction":
        return <ConfirmModal />;

      case "notification":
        return <NotificationModal />;

      case "analysis":
        return (
          <div className="analysis-content">
            <h2>Análisis</h2>
            <pre>{JSON.stringify(modalState.data, null, 2)}</pre>
          </div>
        );

      default:
        console.log("Tipo de modal no implementado:", modalState.type);
        return (
          <div className="generic-modal-content">
            <h2>Modal</h2>
            <p>Tipo de modal no implementado: {modalState.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className={getModalClasses()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className="modal-close-button"
          onClick={closeModal}
          aria-label="Cerrar"
        >
          &times;
        </button>

        {renderModalContent()}
      </div>
    </div>
  );
};

export default AppModal;
