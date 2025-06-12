import { useMemo, useCallback } from "preact/hooks";
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

  return (
    <div id="weekly-planner-container">
      <div class="space-y-6">
        {DAYS_OF_WEEK.map((day) => {
          const dayId = day.toLowerCase();
          const dailyPlan = plan[dayId] || {};

          return (
            <div key={dayId} class="bg-white p-6 rounded-lg shadow-md">
              <h3 class="text-xl font-bold mb-6 text-center md:text-left text-[#6B8A7A]">
                {day}
              </h3>

              {/* Comidas principales */}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {MEAL_TYPES.map((mealType) => (
                  <div key={mealType} class="meal-slot lg:col-span-1">
                    <div class="flex justify-between items-center mb-1">
                      <label class="block text-sm font-medium text-stone-700 capitalize">
                        {mealType}
                      </label>
                      <input
                        type="number"
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
                      />
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
          );
        })}
      </div>
      {/* Resumen Semanal */}
      <div class="mt-8">
        <WeeklyNutritionSummary />
      </div>
    </div>
  );
}
