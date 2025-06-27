import { useMemo } from "preact/hooks";
import RecipeSelector from "./RecipeSelector";
import type { DailyPlan, MealPlan, SelectedItem } from "../../types";

interface MealSectionProps {
  dayId: string;
  mealType: string;
  mealTypeKey: keyof DailyPlan;
  mappedMealType: string;
  mealPlan: MealPlan | undefined;
  selectedItems: SelectedItem[];
  handlePlanChange: (
    dayId: string,
    section: keyof DailyPlan,
    field: string,
    value: string | number
  ) => void;
  handleRecipeSelection: (
    dayId: string,
    mealType: keyof DailyPlan,
    items: SelectedItem[]
  ) => void;
}

export default function MealSection({
  dayId,
  mealType,
  mealTypeKey,
  mappedMealType,
  mealPlan,
  selectedItems,
  handlePlanChange,
  handleRecipeSelection,
}: MealSectionProps) {
  const servingsCount = mealPlan?.diners || 1;
  const hasSelectedRecipe = selectedItems.length > 0;

  return (
    <div key={mealType} class="meal-slot lg:col-span-1">
      <div class="flex justify-between items-center mb-2">
        <span class="block text-lg font-bold text-stone-700 capitalize">
          {mealType}
        </span>

        {/* Selector de comensales por comida */}
        {hasSelectedRecipe && (
          <div class="flex items-center">
            <span class="text-sm text-gray-600 mr-2">Comensales:</span>
            <div class="flex items-center">
              <button
                onClick={() => {
                  handlePlanChange(
                    dayId,
                    mealTypeKey,
                    "diners",
                    Math.max(1, servingsCount - 1)
                  );
                }}
                class="w-5 h-5 flex items-center justify-center text-xs bg-gray-200 rounded-l-md hover:bg-gray-300"
              >
                -
              </button>
              <span class="px-2 py-0.5 bg-gray-100 text-center text-xs">
                {servingsCount}
              </span>
              <button
                onClick={() => {
                  handlePlanChange(
                    dayId,
                    mealTypeKey,
                    "diners",
                    Math.min(10, servingsCount + 1)
                  );
                }}
                class="w-5 h-5 flex items-center justify-center text-xs bg-gray-200 rounded-r-md hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selector de Recetas */}
      <RecipeSelector
        dayId={dayId}
        mealType={mappedMealType}
        selectedItems={selectedItems}
        onItemsChange={(items) => {
          handleRecipeSelection(dayId, mealTypeKey, items);
        }}
        enableMultiple={false}
        maxItems={1}
      />
    </div>
  );
}
