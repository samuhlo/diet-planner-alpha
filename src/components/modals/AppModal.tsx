import type { VNode } from "preact";
import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";
import { $modal, closeModal } from "../../stores/modalStore.ts";
import ShoppingListContent from "./ShoppingListContent.tsx";
import SummaryContent from "./SummaryContent.tsx";
import type { Ingredient, WeeklySummaryData } from "../../types";
import RecipeDetailModal from "./RecipeDetailModal.tsx";

interface ModalComponent<T> {
  Component: (props: { data: T }) => VNode;
  title: string;
}

const MODAL_COMPONENTS = {
  shopping: {
    Component: ShoppingListContent,
    title: "Lista de la Compra",
  } as ModalComponent<Ingredient[]>,
  summary: {
    Component: SummaryContent,
    title: "Resumen del Plan",
  } as ModalComponent<WeeklySummaryData[]>,
};

export default function AppModal(): VNode | null {
  const { isOpen, type, data } = useStore($modal);
  // Estado local para el feedback del botón de copiar
  const [copySuccess, setCopySuccess] = useState(false);

  const handleClose = (): void => {
    closeModal();
    setCopySuccess(false); // Reseteamos el estado al cerrar
  };

  // --- NUEVA FUNCIÓN DE COPIADO ---
  const handleCopy = (): void => {
    if (!type || !data) return;

    let textToCopy = "";

    switch (type) {
      case "shopping": {
        // Intentar obtener la lista personalizada de localStorage
        let list: Ingredient[] = [];
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("customShoppingList");
          if (stored) {
            try {
              list = JSON.parse(stored);
            } catch {
              list = [];
            }
          }
        }
        if (!list.length) {
          list = data as Ingredient[];
        }
        textToCopy = "Lista de la Compra:\n";
        list.forEach((ing) => {
          textToCopy += `• ${Number(ing.q.toPrecision(3))} ${ing.u} de ${
            ing.n
          }\n`;
        });
        break;
      }
      case "summary":
        textToCopy = "Resumen del Plan Semanal:\n\n";
        console.log("Datos del resumen para copiar:", data);
        (data as WeeklySummaryData[]).forEach((dayData) => {
          console.log(`Día ${dayData.day}, comidas:`, dayData.meals);
          textToCopy += `--- ${dayData.day} ---\n`;
          if (dayData.meals.desayuno)
            textToCopy += `Desayuno: ${dayData.meals.desayuno}\n`;
          if (dayData.meals.almuerzo)
            textToCopy += `Almuerzo: ${dayData.meals.almuerzo}\n`;
          if (dayData.meals.cena) textToCopy += `Cena: ${dayData.meals.cena}\n`;
          if (dayData.meals.supplement)
            textToCopy += `Suplemento: ${dayData.meals.supplement}\n`;
          if (dayData.meals.snacks)
            textToCopy += `Snacks: ${dayData.meals.snacks}\n`;
          if (dayData.meals.desserts) {
            console.log(`Postres para ${dayData.day}:`, dayData.meals.desserts);
            textToCopy += `Postres: ${dayData.meals.desserts}\n`;
          }
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

  if (!isOpen || !type || !data) return null;

  let title = "";
  if (type === "shopping") title = "Lista de la Compra";
  else if (type === "summary") title = "Resumen del Plan";
  else if (type === "recipeDetail")
    title = (data as any)?.nombre || "Detalle de Receta";
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
          {type === "shopping" && (
            <ShoppingListContent data={data as Ingredient[]} />
          )}
          {type === "summary" && (
            <SummaryContent data={data as WeeklySummaryData[]} />
          )}
          {type === "recipeDetail" && (
            <RecipeDetailModal
              recipe={data as any}
              isOpen={isOpen}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
