import { useStore } from "@nanostores/preact";
import { $modal, getModalData, closeModal } from "../../stores/modalStore";

/**
 * Modal que muestra información nutricional detallada
 *
 * Funcionalidades:
 * - Muestra desglose de calorías, proteínas, carbohidratos y grasas
 * - Formato de visualización limpio
 */
export default function NutritionDetailModal() {
  const modalState = useStore($modal);
  const nutritionData = getModalData() as any; // Usar any temporalmente

  if (modalState.type !== "nutritionDetail" || !nutritionData) {
    return null;
  }

  return (
    <div class="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-[#6B8A7A]">
          Información Nutricional
        </h2>
        <button onClick={closeModal} class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">
              {nutritionData.calories || 0}
            </div>
            <div class="text-sm text-gray-600">Calorías</div>
          </div>

          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">
              {nutritionData.protein || 0}g
            </div>
            <div class="text-sm text-gray-600">Proteínas</div>
          </div>

          <div class="text-center p-3 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">
              {nutritionData.carbs || 0}g
            </div>
            <div class="text-sm text-gray-600">Carbohidratos</div>
          </div>

          <div class="text-center p-3 bg-red-50 rounded-lg">
            <div class="text-2xl font-bold text-red-600">
              {nutritionData.fats || 0}g
            </div>
            <div class="text-sm text-gray-600">Grasas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
