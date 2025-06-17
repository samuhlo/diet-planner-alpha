import type { Supplement, SupplementPlan } from "../../types";
import { allSupplements } from "../../data/supplements";
import { NutritionService } from "../../services/nutritionService";
import ItemSelector from "../common/ItemSelector";

interface SupplementSelectorProps {
  dayId: string;
  currentSupplementPlan?: SupplementPlan;
  onSupplementPlanChange: (supplementPlan: SupplementPlan) => void;
}

export default function SupplementSelector({
  dayId,
  currentSupplementPlan,
  onSupplementPlanChange,
}: SupplementSelectorProps) {
  // Convertir SupplementPlan a ItemPlan
  const currentItemPlan = currentSupplementPlan
    ? {
        enabled: currentSupplementPlan.enabled,
        items: currentSupplementPlan.supplements.map((s) => ({
          itemId: s.supplementId,
          quantity: s.quantity,
        })),
      }
    : undefined;

  const handleItemPlanChange = (itemPlan: any) => {
    // Convertir ItemPlan de vuelta a SupplementPlan
    const supplementPlan: SupplementPlan = {
      enabled: itemPlan.enabled,
      supplements: itemPlan.items.map((item: any) => ({
        supplementId: item.itemId,
        quantity: item.quantity,
      })),
    };
    onSupplementPlanChange(supplementPlan);
  };

  // Wrapper para adaptar los tipos de la función de cálculo nutricional
  const calculateSupplementNutrition = (
    items: Array<{ item: Supplement; quantity: number }>
  ) => {
    const supplementsWithData = items.map(({ item, quantity }) => ({
      supplement: item,
      quantity,
    }));
    return NutritionService.calculateSupplementsNutrition(supplementsWithData);
  };

  return (
    <ItemSelector
      dayId={dayId}
      title="Suplementos"
      allItems={allSupplements}
      currentPlan={currentItemPlan}
      onPlanChange={handleItemPlanChange}
      calculateNutrition={calculateSupplementNutrition}
      maxItems={4}
      getItemDisplayName={(supplement) => supplement.name}
      getItemCalories={(supplement) => supplement.calories}
    />
  );
}
