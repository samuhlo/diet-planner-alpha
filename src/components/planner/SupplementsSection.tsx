import GenericSelector from "../common/GenericSelector";
import type { DailyPlan, SelectedItem, Supplement } from "../../types";
import type { SelectorType } from "../../utils/selectorUtils";

interface SupplementsSectionProps {
  dayId: string;
  dailyPlan: DailyPlan;
  allSupplements: Supplement[];
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
  ITEM_ACCESSORS: any;
  SELECTOR_CONFIG: any;
}

export default function SupplementsSection({
  dayId,
  dailyPlan,
  allSupplements,
  getSelectedItemsForSelector,
  handleSelectorItemsChange,
  handleSelectorEnableChange,
  getSelectorEnabled,
  getPlanItems,
  ITEM_ACCESSORS,
  SELECTOR_CONFIG,
}: SupplementsSectionProps) {
  return (
    <GenericSelector
      dayId={dayId}
      allItems={allSupplements}
      selectedItems={getSelectedItemsForSelector("supplement", dailyPlan)}
      onItemsChange={(items) =>
        handleSelectorItemsChange("supplement", dayId, items)
      }
      itemConfig={ITEM_ACCESSORS.supplement}
      selectorConfig={SELECTOR_CONFIG.supplement}
      enableMultiple={true}
      isEnabled={getSelectorEnabled("supplement", dailyPlan)}
      onEnableChange={(enabled) =>
        handleSelectorEnableChange(
          "supplement",
          dayId,
          enabled,
          getPlanItems("supplement", dailyPlan)
        )
      }
    />
  );
}
