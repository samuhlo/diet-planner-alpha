import { Fragment } from "preact";
import RecipeSelector from "./RecipeSelector";
import type { DailyPlan, SelectedItem } from "../../types";
import type { SelectorType } from "../../utils/selectorUtils";

interface SnacksDessertsSectionProps {
  dayId: string;
  dailyPlan: DailyPlan;
  getSelectedItemsForSelector: (
    type: SelectorType,
    dailyPlan: DailyPlan
  ) => SelectedItem[];
  handleSelectorItemsChange: (
    type: SelectorType,
    dayId: string,
    items: SelectedItem[]
  ) => void;
  handleSelectorEnableChange: (
    type: SelectorType,
    dayId: string,
    enabled: boolean,
    currentItems: any[] | undefined
  ) => void;
  getSelectorEnabled: (type: SelectorType, dailyPlan: DailyPlan) => boolean;
  getPlanItems: (type: SelectorType, dailyPlan: DailyPlan) => any[] | undefined;
}

export default function SnacksDessertsSection({
  dayId,
  dailyPlan,
  getSelectedItemsForSelector,
  handleSelectorItemsChange,
  handleSelectorEnableChange,
  getSelectorEnabled,
  getPlanItems,
}: SnacksDessertsSectionProps) {
  return (
    <Fragment>
      {/* Snacks */}
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="block text-lg font-bold text-stone-700">Snacks</span>
        </div>
        <RecipeSelector
          dayId={dayId}
          mealType="snack"
          selectedItems={getSelectedItemsForSelector("snack", dailyPlan)}
          onItemsChange={(items) =>
            handleSelectorItemsChange("snack", dayId, items)
          }
          enableMultiple={true}
          isEnabled={getSelectorEnabled("snack", dailyPlan)}
          onEnableChange={(enabled) =>
            handleSelectorEnableChange(
              "snack",
              dayId,
              enabled,
              getPlanItems("snack", dailyPlan)
            )
          }
          maxItems={3}
        />
      </div>

      {/* Postres */}
      <div>
        <div class="flex justify-between items-center mb-2">
          <span class="block text-lg font-bold text-stone-700">Postres</span>
        </div>
        <RecipeSelector
          dayId={dayId}
          mealType="dessert"
          selectedItems={getSelectedItemsForSelector("dessert", dailyPlan)}
          onItemsChange={(items) =>
            handleSelectorItemsChange("dessert", dayId, items)
          }
          enableMultiple={true}
          isEnabled={getSelectorEnabled("dessert", dailyPlan)}
          onEnableChange={(enabled) =>
            handleSelectorEnableChange(
              "dessert",
              dayId,
              enabled,
              getPlanItems("dessert", dailyPlan)
            )
          }
          maxItems={2}
        />
      </div>
    </Fragment>
  );
}
