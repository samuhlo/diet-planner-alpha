import type { Recipe, DessertPlan } from "../../types";
import { NutritionService } from "../../services/nutritionService";
import ItemSelector from "../common/ItemSelector";

interface DessertItem {
  id: string;
  nombre: string;
  calorias: number;
  p: number;
  c: number;
  f: number;
}

interface DessertSelectorProps {
  dayId: string;
  allDesserts: Recipe[];
  currentDessertPlan?: DessertPlan;
  onDessertPlanChange: (dessertPlan: DessertPlan) => void;
}

export default function DessertSelector({
  dayId,
  allDesserts,
  currentDessertPlan,
  onDessertPlanChange,
}: DessertSelectorProps) {
  // Convertir recetas a formato DessertItem
  const dessertItems: DessertItem[] = allDesserts.map((recipe) => ({
    id: recipe.nombre.toLowerCase().replace(/\s+/g, "-"),
    nombre: recipe.nombre,
    calorias: recipe.calorias,
    p: recipe.p,
    c: recipe.c,
    f: recipe.f,
  }));

  // Convertir DessertPlan a ItemPlan
  const currentItemPlan = currentDessertPlan
    ? {
        enabled: currentDessertPlan.enabled,
        items: currentDessertPlan.desserts.map((d) => ({
          itemId: d.dessertId,
          quantity: d.quantity,
        })),
      }
    : undefined;

  const handleItemPlanChange = (itemPlan: any) => {
    // Convertir ItemPlan de vuelta a DessertPlan
    const dessertPlan: DessertPlan = {
      enabled: itemPlan.enabled,
      desserts: itemPlan.items.map((item: any) => ({
        dessertId: item.itemId,
        quantity: item.quantity,
      })),
    };
    onDessertPlanChange(dessertPlan);
  };

  // Wrapper para adaptar los tipos de la función de cálculo nutricional
  const calculateDessertNutrition = (
    items: Array<{ item: DessertItem; quantity: number }>
  ) => {
    // Para postres, usamos la misma lógica que las recetas normales
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    items.forEach(({ item, quantity }) => {
      totalCalories += item.calorias * quantity;
      totalProtein += item.p * quantity;
      totalCarbs += item.c * quantity;
      totalFats += item.f * quantity;
    });

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
    };
  };

  return (
    <ItemSelector
      dayId={dayId}
      title="Postres"
      allItems={dessertItems}
      currentPlan={currentItemPlan}
      onPlanChange={handleItemPlanChange}
      calculateNutrition={calculateDessertNutrition}
      maxItems={3}
      getItemDisplayName={(dessert) => dessert.nombre}
      getItemCalories={(dessert) => dessert.calorias}
    />
  );
}
