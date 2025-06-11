import { useMemo } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $plan } from "../../stores/planStore";
import { $userData, $userGoal } from "../../stores/userProfileStore";
import { allMeals } from "../../data/recipes";
import { allSupplements } from "../../data/supplements";
import { allSnacks } from "../../data/snacks";
import { NutritionService } from "../../services/nutritionService";
import { useNutritionalCalculations } from "../../hooks/useNutritionalCalculations";
import type { DailyPlan } from "../../types";
import { MEAL_TYPES } from "../../constants/appConstants";

interface DailyNutritionSummaryProps {
  dayId: string;
  dayName: string;
}

export default function DailyNutritionSummary({
  dayId,
  dayName,
}: DailyNutritionSummaryProps) {
  const plan = useStore($plan);
  const userData = useStore($userData);
  const userGoal = useStore($userGoal);

  const { calorieGoal, proteinGoal } = useNutritionalCalculations(
    userData,
    userGoal
  );

  // Obtener solo el plan del día específico para evitar recálculos innecesarios
  const dailyPlan = plan[dayId] || {};

  const dailyNutrition = useMemo(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    // Calcular comidas principales
    MEAL_TYPES.forEach((mealType) => {
      const mealInfo = dailyPlan[mealType];
      if (mealInfo?.recipeName) {
        const mealData = allMeals.find((m) => m.nombre === mealInfo.recipeName);
        const diners = mealInfo.diners || 1;
        if (mealData) {
          totalCalories += mealData.calorias * diners;
          totalProtein += mealData.p * diners;
          totalCarbs += mealData.c * diners;
          totalFats += mealData.f * diners;
        }
      }
    });

    // Calcular suplementos
    const suppInfo = dailyPlan.supplement;
    if (suppInfo?.shakes && suppInfo.shakes > 0) {
      const suppData = allSupplements.find((s) => s.id === suppInfo.type);
      if (suppData) {
        totalCalories += suppData.calories * suppInfo.shakes;
        totalProtein += suppData.protein * suppInfo.shakes;
        // Los suplementos solo tienen calorías y proteínas
      }
    }

    // Calcular snacks
    const snackInfo = dailyPlan.snacks;
    if (snackInfo?.enabled && snackInfo.snacks.length > 0) {
      const snacksWithData = snackInfo.snacks
        .filter((s) => s.snackId)
        .map((s) => {
          const snack = allSnacks.find((sn) => sn.id === s.snackId);
          return snack ? { snack, quantity: s.quantity } : null;
        })
        .filter(Boolean);

      const snackNutrition = NutritionService.calculateSnacksNutrition(
        snacksWithData as Array<{ snack: any; quantity: number }>
      );

      totalCalories += snackNutrition.calories;
      totalProtein += snackNutrition.protein;
      totalCarbs += snackNutrition.carbs;
      totalFats += snackNutrition.fats;
    }

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
    };
  }, [dailyPlan, calorieGoal, proteinGoal]);

  // Calcular porcentajes y estados
  const caloriePercentage = (dailyNutrition.calories / calorieGoal) * 100;
  const proteinPercentage = (dailyNutrition.protein / proteinGoal) * 100;

  const getCalorieStatus = () => {
    if (caloriePercentage < 80)
      return { status: "bajo", color: "text-red-600", bg: "bg-red-50" };
    if (caloriePercentage > 120)
      return { status: "alto", color: "text-orange-600", bg: "bg-orange-50" };
    return { status: "óptimo", color: "text-green-600", bg: "bg-green-50" };
  };

  const getProteinStatus = () => {
    if (proteinPercentage < 80)
      return { status: "bajo", color: "text-red-600", bg: "bg-red-50" };
    if (proteinPercentage > 120)
      return { status: "alto", color: "text-orange-600", bg: "bg-orange-50" };
    return { status: "óptimo", color: "text-green-600", bg: "bg-green-50" };
  };

  const calorieStatus = getCalorieStatus();
  const proteinStatus = getProteinStatus();

  return (
    <div>
      <h4 class="text-lg font-bold mb-3 text-center text-[#3a5a40]">
        Resumen Nutricional del Día
      </h4>

      {/* Valores principales */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">
            {Math.round(dailyNutrition.calories)}
          </div>
          <div class="text-sm text-gray-500">kcal</div>
          <div class={`text-xs mt-1 ${calorieStatus.color}`}>
            {calorieStatus.status}
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">
            {dailyNutrition.protein.toFixed(1)}
          </div>
          <div class="text-sm text-gray-500">proteína</div>
          <div class={`text-xs mt-1 ${proteinStatus.color}`}>
            {proteinStatus.status}
          </div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">
            {dailyNutrition.carbs.toFixed(1)}
          </div>
          <div class="text-sm text-gray-500">carbos</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-900">
            {dailyNutrition.fats.toFixed(1)}
          </div>
          <div class="text-sm text-gray-500">grasas</div>
        </div>
      </div>

      {/* Barras de progreso */}
      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">Calorías</span>
            <span class="text-gray-900">
              {Math.round(dailyNutrition.calories)} / {Math.round(calorieGoal)}{" "}
              kcal
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class={`h-2 rounded-full transition-all ${
                caloriePercentage < 80
                  ? "bg-red-500"
                  : caloriePercentage > 120
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
              style={`width: ${Math.min(caloriePercentage, 100)}%`}
            ></div>
          </div>
          <div class={`text-xs mt-1 ${calorieStatus.color}`}>
            {caloriePercentage < 80
              ? `Faltan ${Math.round(
                  calorieGoal - dailyNutrition.calories
                )} kcal`
              : caloriePercentage > 120
              ? `Exceso de ${Math.round(
                  dailyNutrition.calories - calorieGoal
                )} kcal`
              : "Objetivo alcanzado"}
          </div>
        </div>

        <div>
          <div class="flex justify-between text-sm mb-1">
            <span class="text-gray-600">Proteína</span>
            <span class="text-gray-900">
              {dailyNutrition.protein.toFixed(1)} / {proteinGoal.toFixed(1)}g
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class={`h-2 rounded-full transition-all ${
                proteinPercentage < 80
                  ? "bg-red-500"
                  : proteinPercentage > 120
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
              style={`width: ${Math.min(proteinPercentage, 100)}%`}
            ></div>
          </div>
          <div class={`text-xs mt-1 ${proteinStatus.color}`}>
            {proteinPercentage < 80
              ? `Faltan ${(proteinGoal - dailyNutrition.protein).toFixed(1)}g`
              : proteinPercentage > 120
              ? `Exceso de ${(dailyNutrition.protein - proteinGoal).toFixed(
                  1
                )}g`
              : "Objetivo alcanzado"}
          </div>
        </div>
      </div>

      {/* Alertas */}
      {(caloriePercentage < 80 ||
        caloriePercentage > 120 ||
        proteinPercentage < 80 ||
        proteinPercentage > 120) && (
        <div class="mt-4 p-3 rounded-lg border-l-4 border-yellow-400 bg-yellow-50">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                Ajustes recomendados
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <ul class="list-disc list-inside space-y-1">
                  {caloriePercentage < 80 && (
                    <li>Añade más calorías para alcanzar tu objetivo</li>
                  )}
                  {caloriePercentage > 120 && (
                    <li>Reduce las calorías para no exceder tu objetivo</li>
                  )}
                  {proteinPercentage < 80 && (
                    <li>Incluye más proteínas en tus comidas</li>
                  )}
                  {proteinPercentage > 120 && (
                    <li>Considera reducir la ingesta de proteínas</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
