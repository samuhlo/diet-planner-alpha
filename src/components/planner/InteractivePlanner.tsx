import { useMemo, useCallback, useEffect, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  $plan,
  updatePlanEntry,
  updateSnackPlan,
  updateSupplementPlan,
  updateDessertPlan,
} from "../../stores/planStore";
import { NutritionService } from "../../services/nutritionService";
import SnackSelector from "./SnackSelector";
import SupplementSelector from "./SupplementSelector";
import DessertSelector from "./DessertSelector";
import RecipeSelector from "./RecipeSelector";
import DailyNutritionSummary from "./DailyNutritionSummary";
import WeeklyNutritionSummary from "./WeeklyNutritionSummary";
import type {
  Recipe,
  Supplement,
  Snack,
  SnackPlan,
  SupplementPlan,
  DessertPlan,
  DailyPlan,
} from "../../types";
import { getSnacksFromRecipes } from "../../utils/recipeUtils";
import { DAYS_OF_WEEK, MAIN_MEAL_TYPES } from "../../config/appConstants";

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
  const [selectedDay, setSelectedDay] = useState<string>("monday");

  const mealsByType = useMemo(
    () => ({
      Desayuno: allMeals.filter((m) => m.tipo === "Desayuno"),
      Almuerzo: allMeals.filter((m) => m.tipo === "Almuerzo"),
      Cena: allMeals.filter((m) => m.tipo === "Cena"),
    }),
    [allMeals]
  );

  // Generar snacks desde las recetas
  const allSnacks = useMemo(() => getSnacksFromRecipes(allMeals), [allMeals]);

  // Obtener postres desde las recetas
  const allDesserts = useMemo(
    () => allMeals.filter((m) => m.tipo === "Postre"),
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

  const handleDessertPlanChange = useCallback(
    (dayId: string, dessertPlan: DessertPlan) => {
      updateDessertPlan(dayId, dessertPlan);
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
    MAIN_MEAL_TYPES.forEach((mealType) => {
      if (dailyPlan[mealType]?.recipeName) {
        items.push(`${mealType}: ${dailyPlan[mealType].recipeName}`);
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
                {MAIN_MEAL_TYPES.map((mealType) => (
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
                      diners={dailyPlan[mealType]?.diners || 1}
                    />
                  </div>
                ))}
              </div>

              {/* Suplementos, Snacks y Postres */}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Suplementos */}
                <SupplementSelector
                  dayId={dayId}
                  allSupplements={allSupplements}
                  currentSupplementPlan={dailyPlan.supplement}
                  onSupplementPlanChange={(plan) =>
                    handleSupplementPlanChange(dayId, plan)
                  }
                />

                {/* Snacks */}
                <SnackSelector
                  dayId={dayId}
                  allSnacks={allSnacks}
                  currentSnackPlan={dailyPlan.snacks}
                  onSnackPlanChange={(snackPlan) =>
                    handleSnackPlanChange(dayId, snackPlan)
                  }
                />

                {/* Postres */}
                <DessertSelector
                  dayId={dayId}
                  allDesserts={allDesserts}
                  currentDessertPlan={dailyPlan.desserts}
                  onDessertPlanChange={(dessertPlan) =>
                    handleDessertPlanChange(dayId, dessertPlan)
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
    handleDessertPlanChange,
    toggleDayExpansion,
    allMeals,
    allSnacks,
    allDesserts,
    allSupplements,
  ]);

  return (
    <div id="weekly-planner-container">
      <div class="space-y-4">{renderedDays}</div>
      {/* Resumen Semanal */}
      <div class="mt-8">
        <WeeklyNutritionSummary allSnacks={allSnacks} />
      </div>
    </div>
  );
}
