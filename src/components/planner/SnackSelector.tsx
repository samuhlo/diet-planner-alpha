import type { Snack, SnackPlan } from "../../types";
import { NutritionService } from "../../services/nutritionService";
import ItemSelector from "../common/ItemSelector";

interface SnackSelectorProps {
  dayId: string;
  allSnacks: Snack[];
  currentSnackPlan?: SnackPlan;
  onSnackPlanChange: (snackPlan: SnackPlan) => void;
}

export default function SnackSelector({
  dayId,
  allSnacks,
  currentSnackPlan,
  onSnackPlanChange,
}: SnackSelectorProps) {
  // Convertir SnackPlan a ItemPlan
  const currentItemPlan = currentSnackPlan
    ? {
        enabled: currentSnackPlan.enabled,
        items: currentSnackPlan.snacks.map((s) => ({
          itemId: s.snackId,
          quantity: s.quantity,
        })),
      }
    : undefined;

  const handleItemPlanChange = (itemPlan: any) => {
    // Convertir ItemPlan de vuelta a SnackPlan
    const snackPlan: SnackPlan = {
      enabled: itemPlan.enabled,
      snacks: itemPlan.items.map((item: any) => ({
        snackId: item.itemId,
        quantity: item.quantity,
      })),
    };
    onSnackPlanChange(snackPlan);
  };

  // Wrapper para adaptar los tipos de la función de cálculo nutricional
  const calculateSnackNutrition = (
    items: Array<{ item: Snack; quantity: number }>
  ) => {
    const snacksWithData = items.map(({ item, quantity }) => ({
      snack: item,
      quantity,
    }));
    return NutritionService.calculateSnacksNutrition(snacksWithData);
  };

  return (
    <ItemSelector
      dayId={dayId}
      title="Snacks"
      allItems={allSnacks}
      currentPlan={currentItemPlan}
      onPlanChange={handleItemPlanChange}
      calculateNutrition={calculateSnackNutrition}
      maxItems={4}
      getItemDisplayName={(snack) => snack.nombre}
      getItemCalories={(snack) => snack.calorias}
    />
  );
}
