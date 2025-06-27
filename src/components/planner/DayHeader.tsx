import { useMemo } from "preact/hooks";
import { MAIN_MEAL_TYPES } from "../../config/appConstants";
import type { DailyPlan, MealPlan } from "../../types";

interface DayHeaderProps {
  day: string;
  dayId: string;
  dailyPlan: DailyPlan;
  isExpanded: boolean;
  toggleExpansion: (dayId: string) => void;
}

export default function DayHeader({
  day,
  dayId,
  dailyPlan,
  isExpanded,
  toggleExpansion,
}: DayHeaderProps) {
  // Calcular el resumen de elementos seleccionados
  const selectedItemsSummary = useMemo(() => {
    const items = [];

    // Comidas principales
    MAIN_MEAL_TYPES.forEach((mealType) => {
      const mealPlan = dailyPlan[mealType as keyof DailyPlan] as
        | MealPlan
        | undefined;
      if (mealPlan?.recipeName) {
        const dinersText =
          mealPlan.diners && mealPlan.diners > 1
            ? ` (${mealPlan.diners} comensales)`
            : "";
        items.push(`${mealType}${dinersText}: ${mealPlan.recipeName}`);
      }
    });

    // Suplementos
    if (
      dailyPlan.supplement?.enabled &&
      dailyPlan.supplement.supplements.length > 0
    ) {
      const supplementCount = dailyPlan.supplement.supplements.filter(
        (s) => s.supplementId
      ).length;
      if (supplementCount > 0) {
        items.push(
          `${supplementCount} suplemento${supplementCount > 1 ? "s" : ""}`
        );
      }
    }

    // Snacks
    if (dailyPlan.snacks?.enabled && dailyPlan.snacks.snacks.length > 0) {
      const snackCount = dailyPlan.snacks.snacks.filter(
        (s) => s.snackId
      ).length;
      if (snackCount > 0) {
        items.push(`${snackCount} snack${snackCount > 1 ? "s" : ""}`);
      }
    }

    // Postres
    if (dailyPlan.desserts?.enabled && dailyPlan.desserts.desserts.length > 0) {
      const dessertCount = dailyPlan.desserts.desserts.filter(
        (d) => d.dessertId
      ).length;
      if (dessertCount > 0) {
        items.push(`${dessertCount} postre${dessertCount > 1 ? "s" : ""}`);
      }
    }

    return items.length > 0 ? items.join(", ") : "Sin selecciones";
  }, [dailyPlan]);

  return (
    <button
      onClick={() => toggleExpansion(dayId)}
      class="w-full p-4 flex items-center justify-between bg-white text-[#6B8A7A] hover:bg-[#6B8A7A] hover:text-white transition-all duration-200 cursor-pointer"
    >
      <div class="flex items-center space-x-3">
        <h3 class="text-xl font-bold uppercase">{day}</h3>
        <div class="text-sm opacity-90">{selectedItemsSummary}</div>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm sm:block hidden ml-2">
          {isExpanded ? "Contraer" : "Expandir"}
        </span>
        <svg
          class={`w-5 h-5 transform transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </button>
  );
}
