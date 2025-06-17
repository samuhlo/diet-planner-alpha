import { useMemo } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $plan } from "../../stores/planStore";
import { $userData, $userGoal } from "../../stores/userProfileStore";
import { allMeals } from "../../data/recipes";
import { allSupplements } from "../../data/supplements";
import { getSnacksFromRecipes } from "../../utils/recipeUtils";
import { NutritionService } from "../../services/nutritionService";
import { useNutritionalCalculations } from "../../hooks/useNutritionalCalculations";
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

  const { calorieGoal, proteinGoal, carbGoal, fatGoal } =
    useNutritionalCalculations(userData, userGoal);

  // Obtener solo el plan del día específico para evitar recálculos innecesarios
  const dailyPlan = plan[dayId] || {};

  const dailyNutrition = useMemo(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    // Obtener snacks desde las recetas
    const allSnacks = getSnacksFromRecipes(allMeals);

    // Calcular comidas principales
    MEAL_TYPES.forEach((mealType) => {
      const mealInfo = dailyPlan[mealType];
      if (mealInfo?.recipeName) {
        const mealData = allMeals.find((m) => m.nombre === mealInfo.recipeName);
        // Los valores nutricionales son siempre para 1 persona (plan individual)
        // Los comensales solo afectan a la lista de la compra
        if (mealData) {
          totalCalories += mealData.calorias;
          totalProtein += mealData.p;
          totalCarbs += mealData.c;
          totalFats += mealData.f;
        }
      }
    });

    // Calcular suplementos
    const suppInfo = dailyPlan.supplement;
    if (suppInfo?.enabled && suppInfo.supplements.length > 0) {
      const supplementsWithData = suppInfo.supplements
        .filter((s) => s.supplementId)
        .map((s) => {
          const supplement = allSupplements.find(
            (sup) => sup.id === s.supplementId
          );
          return supplement ? { supplement, quantity: s.quantity } : null;
        })
        .filter(Boolean);

      const supplementNutrition =
        NutritionService.calculateSupplementsNutrition(
          supplementsWithData as Array<{ supplement: any; quantity: number }>
        );

      totalCalories += supplementNutrition.calories;
      totalProtein += supplementNutrition.protein;
      totalCarbs += supplementNutrition.carbs;
      totalFats += supplementNutrition.fats;
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
  }, [dailyPlan, allMeals]);

  // Calcular porcentajes y estados
  const caloriePercentage = (dailyNutrition.calories / calorieGoal) * 100;
  const proteinPercentage = (dailyNutrition.protein / proteinGoal) * 100;
  const carbPercentage = (dailyNutrition.carbs / carbGoal) * 100;
  const fatPercentage = (dailyNutrition.fats / fatGoal) * 100;

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

  const getCarbStatus = () => {
    if (carbPercentage < 80)
      return { status: "bajo", color: "text-red-600", bg: "bg-red-50" };
    if (carbPercentage > 120)
      return { status: "alto", color: "text-orange-600", bg: "bg-orange-50" };
    return { status: "óptimo", color: "text-green-600", bg: "bg-green-50" };
  };

  const getFatStatus = () => {
    if (fatPercentage < 80)
      return { status: "bajo", color: "text-red-600", bg: "bg-red-50" };
    if (fatPercentage > 120)
      return { status: "alto", color: "text-orange-600", bg: "bg-orange-50" };
    return { status: "óptimo", color: "text-green-600", bg: "bg-green-50" };
  };

  const calorieStatus = getCalorieStatus();
  const proteinStatus = getProteinStatus();
  const carbStatus = getCarbStatus();
  const fatStatus = getFatStatus();

  return (
    <div class="p-2">
      {/* Valores principales compactos */}
      <div class="grid grid-cols-4 gap-2 mb-3">
        <div class="text-center">
          <div class="text-lg font-bold text-gray-900">
            {Math.round(dailyNutrition.calories)}
          </div>
          <div class="text-xs text-gray-500">kcal</div>
          <div class={`text-xs mt-1 ${calorieStatus.color}`}>
            {calorieStatus.status}
          </div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-gray-900">
            {dailyNutrition.protein.toFixed(1)}
          </div>
          <div class="text-xs text-gray-500">proteína</div>
          <div class={`text-xs mt-1 ${proteinStatus.color}`}>
            {proteinStatus.status}
          </div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-gray-900">
            {dailyNutrition.carbs.toFixed(1)}
          </div>
          <div class="text-xs text-gray-500">carbos</div>
          <div class={`text-xs mt-1 ${carbStatus.color}`}>
            {carbStatus.status}
          </div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-gray-900">
            {dailyNutrition.fats.toFixed(1)}
          </div>
          <div class="text-xs text-gray-500">grasas</div>
          <div class={`text-xs mt-1 ${fatStatus.color}`}>
            {fatStatus.status}
          </div>
        </div>
      </div>

      {/* Barras de progreso compactas */}
      <div class="space-y-2">
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-600">Calorías</span>
            <span class="text-gray-900">
              {Math.round(dailyNutrition.calories)} / {Math.round(calorieGoal)}{" "}
              kcal
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div
              class={`h-1.5 rounded-full transition-all ${
                caloriePercentage < 80
                  ? "bg-red-500"
                  : caloriePercentage > 120
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
              style={`width: ${Math.min(caloriePercentage, 100)}%`}
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-600">Proteína</span>
            <span class="text-gray-900">
              {dailyNutrition.protein.toFixed(1)} / {proteinGoal.toFixed(1)}g
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div
              class={`h-1.5 rounded-full transition-all ${
                proteinPercentage < 80
                  ? "bg-red-500"
                  : proteinPercentage > 120
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
              style={`width: ${Math.min(proteinPercentage, 100)}%`}
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-600">Carbohidratos</span>
            <span class="text-gray-900">
              {dailyNutrition.carbs.toFixed(1)} / {carbGoal.toFixed(1)}g
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div
              class={`h-1.5 rounded-full transition-all ${
                carbPercentage < 80
                  ? "bg-red-500"
                  : carbPercentage > 120
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
              style={`width: ${Math.min(carbPercentage, 100)}%`}
            ></div>
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-gray-600">Grasas</span>
            <span class="text-gray-900">
              {dailyNutrition.fats.toFixed(1)} / {fatGoal.toFixed(1)}g
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div
              class={`h-1.5 rounded-full transition-all ${
                fatPercentage < 80
                  ? "bg-red-500"
                  : fatPercentage > 120
                  ? "bg-orange-500"
                  : "bg-green-500"
              }`}
              style={`width: ${Math.min(fatPercentage, 100)}%`}
            ></div>
          </div>
        </div>
      </div>

      {/* Alertas compactas solo si hay problemas */}
      {(caloriePercentage < 80 ||
        caloriePercentage > 120 ||
        proteinPercentage < 80 ||
        proteinPercentage > 120 ||
        carbPercentage < 80 ||
        carbPercentage > 120 ||
        fatPercentage < 80 ||
        fatPercentage > 120) && (
        <div class="mt-3 p-2 rounded border-l-3 border-yellow-400 bg-yellow-50">
          <div class="text-xs text-yellow-800">
            {caloriePercentage < 80 && "Faltan calorías • "}
            {caloriePercentage > 120 && "Exceso de calorías • "}
            {proteinPercentage < 80 && "Falta proteína • "}
            {proteinPercentage > 120 && "Exceso de proteína • "}
            {carbPercentage < 80 && "Faltan carbohidratos • "}
            {carbPercentage > 120 && "Exceso de carbohidratos • "}
            {fatPercentage < 80 && "Faltan grasas • "}
            {fatPercentage > 120 && "Exceso de grasas"}
          </div>
        </div>
      )}
    </div>
  );
}
