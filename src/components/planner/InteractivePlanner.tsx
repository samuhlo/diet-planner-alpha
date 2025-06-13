import { useMemo, useCallback, useEffect, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  $plan,
  updatePlanEntry,
  updateSnackPlan,
  updateSupplementPlan,
} from "../../stores/planStore";
import { NutritionService } from "../../services/nutritionService";
import SnackSelector from "./SnackSelector";
import SupplementSelector from "./SupplementSelector";
import RecipeSelector from "./RecipeSelector";
import DailyNutritionSummary from "./DailyNutritionSummary";
import WeeklyNutritionSummary from "./WeeklyNutritionSummary";
import type {
  Recipe,
  Supplement,
  Snack,
  SnackPlan,
  SupplementPlan,
  DailyPlan,
} from "../../types";
import { allSnacks } from "../../data/snacks";
import { DAYS_OF_WEEK, MEAL_TYPES } from "../../constants/appConstants";

interface InteractivePlannerProps {
  allMeals: Recipe[];
  allSupplements: Supplement[];
  targetCalories: number;
  targetProtein: number;
}

export default function InteractivePlanner({
  allMeals,
  allSupplements,
  targetCalories,
  targetProtein,
}: InteractivePlannerProps) {
  const plan = useStore($plan);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const mealsByType = useMemo(
    () => ({
      Desayuno: allMeals.filter((m) => m.tipo === "Desayuno"),
      Almuerzo: allMeals.filter((m) => m.tipo === "Almuerzo"),
      Cena: allMeals.filter((m) => m.tipo === "Cena"),
    }),
    [allMeals]
  );

  const handlePlanChange = useCallback(
    (
      dayId: string,
      section: keyof DailyPlan,
      field: string,
      value: string | number
    ) => {
      updatePlanEntry(dayId, section, field, value);
    },
    []
  );

  const handleSnackPlanChange = useCallback(
    (dayId: string, snackPlan: SnackPlan) => {
      updateSnackPlan(dayId, snackPlan);
    },
    []
  );

  const handleSupplementPlanChange = useCallback(
    (dayId: string, supplementPlan: SupplementPlan) => {
      updateSupplementPlan(dayId, supplementPlan);
    },
    []
  );

  const toggleDayExpansion = useCallback((dayId: string) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayId)) {
        newSet.delete(dayId);
      } else {
        newSet.add(dayId);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    return () => {
      console.log("InteractivePlanner cleanup");
    };
  }, []);

  const getSelectedItemsSummary = (dailyPlan: DailyPlan) => {
    const items = [];

    // Comidas principales
    MEAL_TYPES.forEach((mealType) => {
      if (dailyPlan[mealType]?.recipeName) {
        items.push(`${mealType}: ${dailyPlan[mealType].recipeName}`);
      }
    });

    // Suplementos
    if (
      dailyPlan.supplement?.supplements &&
      dailyPlan.supplement.supplements.length > 0
    ) {
      const supplementCount = dailyPlan.supplement.supplements.length;
      items.push(
        `${supplementCount} suplemento${supplementCount > 1 ? "s" : ""}`
      );
    }

    // Snacks
    if (dailyPlan.snacks?.snacks && dailyPlan.snacks.snacks.length > 0) {
      const snackCount = dailyPlan.snacks.snacks.length;
      items.push(`${snackCount} snack${snackCount > 1 ? "s" : ""}`);
    }

    return items.length > 0 ? items.join(", ") : "Sin selecciones";
  };

  const renderedDays = useMemo(() => {
    return DAYS_OF_WEEK.map((day) => {
      const dayId = day.toLowerCase();
      const dailyPlan = plan[dayId] || {};
      const isExpanded = expandedDays.has(dayId);
      const selectedItemsSummary = getSelectedItemsSummary(dailyPlan);

      return (
        <div key={dayId} class="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header del accordion */}
          <button
            onClick={() => toggleDayExpansion(dayId)}
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

          {/* Contenido expandible */}
          {isExpanded && (
            <div class="p-6 ">
              {/* Comidas principales */}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {MEAL_TYPES.map((mealType) => (
                  <div key={mealType} class="meal-slot lg:col-span-1">
                    <div class="flex justify-between items-center mb-1">
                      <span class="block text-sm font-medium text-stone-700 capitalize">
                        {mealType}
                      </span>
                      <div class="flex items-center space-x-2">
                        <label
                          for={`diners-${dayId}-${mealType}`}
                          class="text-xs text-gray-600"
                          title="Solo afecta a la cantidad de ingredientes en la lista de la compra"
                        >
                          Comensales:
                        </label>
                        <input
                          type="number"
                          id={`diners-${dayId}-${mealType}`}
                          min="1"
                          class="w-12 text-center border-gray-300 rounded-md text-sm p-1"
                          value={dailyPlan[mealType]?.diners || 1}
                          onChange={(e) =>
                            handlePlanChange(
                              dayId,
                              mealType,
                              "diners",
                              Number(e.currentTarget.value)
                            )
                          }
                          title="Número de personas que comerán esta comida (solo afecta a la lista de la compra)"
                        />
                      </div>
                    </div>
                    <RecipeSelector
                      mealType={mealType}
                      selectedRecipe={dailyPlan[mealType]?.recipeName}
                      onRecipeSelect={(recipeName) =>
                        handlePlanChange(
                          dayId,
                          mealType,
                          "recipeName",
                          recipeName
                        )
                      }
                      allMeals={allMeals}
                    />
                  </div>
                ))}
              </div>

              {/* Suplementos y Snacks */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Suplementos */}
                <SupplementSelector
                  dayId={dayId}
                  currentSupplementPlan={dailyPlan.supplement}
                  onSupplementPlanChange={(supplementPlan) =>
                    handleSupplementPlanChange(dayId, supplementPlan)
                  }
                />

                {/* Snacks */}
                <SnackSelector
                  dayId={dayId}
                  currentSnackPlan={dailyPlan.snacks}
                  onSnackPlanChange={(snackPlan) =>
                    handleSnackPlanChange(dayId, snackPlan)
                  }
                />
              </div>

              {/* Resumen Nutricional Integrado */}
              <div class="mt-6">
                <DailyNutritionSummary dayId={dayId} dayName={day} />
              </div>
            </div>
          )}
        </div>
      );
    });
  }, [
    plan,
    mealsByType,
    expandedDays,
    handlePlanChange,
    handleSnackPlanChange,
    handleSupplementPlanChange,
    toggleDayExpansion,
    allMeals,
  ]);

  return (
    <div id="weekly-planner-container">
      <div class="space-y-4">{renderedDays}</div>
      {/* Resumen Semanal */}
      <div class="mt-8">
        <WeeklyNutritionSummary />
      </div>
    </div>
  );
}
