// src/components/AppModal.jsx
import { useStore } from "@nanostores/preact";
import { $modal, closeModal } from "../stores/modalStore.ts";
import ShoppingListContent from "./modals/ShoppingListContent.jsx";
import SummaryContent from "./modals/SummaryContent.jsx";

const MODAL_COMPONENTS = {
  shopping: { Component: ShoppingListContent, title: "Lista de la Compra" },
  summary: { Component: SummaryContent, title: "Resumen del Plan" },
};

export default function AppModal() {
  const { isOpen, type, data } = useStore($modal);

  if (!isOpen || !type) return null;

  const { Component, title } = MODAL_COMPONENTS[type];

  return (
    <div
      class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={closeModal}
    >
      <div
        class="modal-content bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-2xl font-bold text-stone-800">{title}</h3>
          <button
            onClick={closeModal}
            class="text-3xl font-bold text-stone-500 hover:text-stone-800"
          >
            &times;
          </button>
        </div>
        <div class="p-6 overflow-y-auto">
          <Component data={data} />
        </div>
      </div>
    </div>
  );
}
