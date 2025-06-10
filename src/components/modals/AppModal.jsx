import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks"; // <-- Importar useState
import { $modal, closeModal } from "../../stores/modalStore.ts";
import ShoppingListContent from "./ShoppingListContent.jsx";
import SummaryContent from "./SummaryContent.jsx";

const MODAL_COMPONENTS = {
  shopping: { Component: ShoppingListContent, title: "Lista de la Compra" },
  summary: { Component: SummaryContent, title: "Resumen del Plan" },
};

export default function AppModal() {
  const { isOpen, type, data } = useStore($modal);
  // Estado local para el feedback del botón de copiar
  const [copySuccess, setCopySuccess] = useState(false);

  const handleClose = () => {
    closeModal();
    setCopySuccess(false); // Reseteamos el estado al cerrar
  };

  // --- NUEVA FUNCIÓN DE COPIADO ---
  const handleCopy = () => {
    if (!type || !data) return;

    let textToCopy = "";

    switch (type) {
      case "shopping":
        textToCopy = "Lista de la Compra:\n";
        data.forEach((ing) => {
          textToCopy += `• ${Number(ing.q.toPrecision(3))} ${ing.u} de ${
            ing.n
          }\n`;
        });
        break;

      case "summary":
        textToCopy = "Resumen del Plan Semanal:\n\n";
        data.forEach((dayData) => {
          textToCopy += `--- ${dayData.day} ---\n`;
          if (dayData.meals.desayuno)
            textToCopy += `Desayuno: ${dayData.meals.desayuno}\n`;
          if (dayData.meals.almuerzo)
            textToCopy += `Almuerzo: ${dayData.meals.almuerzo}\n`;
          if (dayData.meals.cena) textToCopy += `Cena: ${dayData.meals.cena}\n`;
          if (dayData.meals.supplement)
            textToCopy += `Suplemento: ${dayData.meals.supplement}\n`;
          textToCopy += "\n";
        });
        break;

      // Se pueden añadir más casos para otros modales si fuera necesario
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    });
  };

  if (!isOpen || !type) return null;

  const { Component, title } = MODAL_COMPONENTS[type];
  // Solo mostramos el botón de copiar si el modal es de tipo 'shopping' o 'summary'
  const showCopyButton = type === "shopping" || type === "summary";

  return (
    <div
      class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        class="modal-content bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-2xl font-bold text-stone-800">{title}</h3>
          {/* --- NUEVO BLOQUE DE BOTONES --- */}
          <div class="flex items-center gap-2">
            {showCopyButton && (
              <button
                onClick={handleCopy}
                class="bg-gray-200 text-sm text-stone-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                {copySuccess ? "¡Copiado!" : "Copiar"}
              </button>
            )}
            <button
              onClick={handleClose}
              class="text-3xl font-bold text-stone-500 hover:text-stone-800"
            >
              &times;
            </button>
          </div>
        </div>
        <div class="p-6 overflow-y-auto">
          <Component data={data} />
        </div>
      </div>
    </div>
  );
}
