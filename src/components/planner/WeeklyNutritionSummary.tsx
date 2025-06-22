import { useMemo, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $plan } from "../../stores/planStore";
import { $userData, $userGoal } from "../../stores/userProfileStore";
import { allMeals } from "../../data/recipes";
import { allSupplements } from "../../data/supplements";
import { NutritionService } from "../../services/nutritionService";
import { useNutritionalCalculations } from "../../hooks/useNutritionalCalculations";
import type { DailyPlan, Snack, Recipe } from "../../types";
import { DAYS_OF_WEEK, MAIN_MEAL_TYPES } from "../../config/appConstants";
import {
  calculateRecipePrice,
  formatEuro,
} from "../../utils/ingredientFormatter";

interface WeeklyNutritionSummaryProps {
  allSnacks: Snack[];
}

export default function WeeklyNutritionSummary({
  allSnacks,
}: WeeklyNutritionSummaryProps) {
  const plan = useStore($plan);
  const userData = useStore($userData);
  const userGoal = useStore($userGoal);
  const [isExpanded, setIsExpanded] = useState(false);

  const { calorieGoal, proteinGoal, carbGoal, fatGoal } =
    useNutritionalCalculations(userData, userGoal);

  const weeklyNutrition = useMemo(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let daysWithData = 0;

    // Obtener postres desde las recetas
    const allDesserts = allMeals.filter((m) => m.tipo === "Postre");

    const dailyBreakdown = DAYS_OF_WEEK.map((day) => {
      const dayId = day.toLowerCase();
      const dailyPlan: DailyPlan = plan[dayId] || {};
      let dayCalories = 0;
      let dayProtein = 0;
      let dayCarbs = 0;
      let dayFats = 0;
      let hasData = false;

      // Calcular comidas principales
      MAIN_MEAL_TYPES.forEach((mealType) => {
        const mealInfo = dailyPlan[mealType];
        if (mealInfo?.recipeName) {
          const mealData = allMeals.find(
            (m) => m.nombre === mealInfo.recipeName
          );
          // Los valores nutricionales son siempre para 1 persona (plan individual)
          // Los comensales solo afectan a la lista de la compra
          if (mealData) {
            dayCalories += mealData.calorias;
            dayProtein += mealData.p;
            dayCarbs += mealData.c;
            dayFats += mealData.f;
            hasData = true;
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

        dayCalories += supplementNutrition.calories;
        dayProtein += supplementNutrition.protein;
        dayCarbs += supplementNutrition.carbs;
        dayFats += supplementNutrition.fats;
        hasData = true;
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

        dayCalories += snackNutrition.calories;
        dayProtein += snackNutrition.protein;
        dayCarbs += snackNutrition.carbs;
        dayFats += snackNutrition.fats;
        hasData = true;
      }

      // Calcular postres
      const dessertInfo = dailyPlan.desserts;
      if (dessertInfo?.enabled && dessertInfo.desserts.length > 0) {
        const dessertsWithData = dessertInfo.desserts
          .filter((d) => d.dessertId)
          .map((d) => {
            const dessert = allDesserts.find(
              (dess) =>
                dess.nombre.toLowerCase().replace(/\s+/g, "-") === d.dessertId
            );
            return dessert ? { dessert, quantity: d.quantity } : null;
          })
          .filter(Boolean) as Array<{ dessert: any; quantity: number }>;

        // Calcular nutrición de postres (similar a recetas normales)
        dessertsWithData.forEach(({ dessert, quantity }) => {
          dayCalories += dessert.calorias * quantity;
          dayProtein += dessert.p * quantity;
          dayCarbs += dessert.c * quantity;
          dayFats += dessert.f * quantity;
        });
        hasData = true;
      }

      if (hasData) {
        totalCalories += dayCalories;
        totalProtein += dayProtein;
        totalCarbs += dayCarbs;
        totalFats += dayFats;
        daysWithData++;
      }

      return {
        day,
        dayId,
        calories: dayCalories,
        protein: dayProtein,
        carbs: dayCarbs,
        fats: dayFats,
        hasData,
      };
    });

    const weeklyAverages =
      daysWithData > 0
        ? {
            calories: totalCalories / daysWithData,
            protein: totalProtein / daysWithData,
            carbs: totalCarbs / daysWithData,
            fats: totalFats / daysWithData,
          }
        : {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
          };

    return {
      total: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fats: totalFats,
      },
      averages: weeklyAverages,
      dailyBreakdown,
      daysWithData,
    };
  }, [plan, allSnacks]);

  // Calcular precio total semanal
  const weeklyPrice = useMemo(() => {
    let total = 0;
    const allDesserts = allMeals.filter((m) => m.tipo === "Postre");

    DAYS_OF_WEEK.forEach((day) => {
      const dayId = day.toLowerCase();
      const dailyPlan: DailyPlan = plan[dayId] || {};

      // Comidas principales
      MAIN_MEAL_TYPES.forEach((mealType) => {
        const mealInfo = dailyPlan[mealType];
        if (mealInfo?.recipeName) {
          const mealData = allMeals.find(
            (m) => m.nombre === mealInfo.recipeName
          );
          if (mealData) {
            total +=
              calculateRecipePrice(mealData).total * (mealInfo.diners || 1);
          }
        }
      });

      // Snacks
      const snackInfo = dailyPlan.snacks;
      if (snackInfo?.enabled && snackInfo.snacks.length > 0) {
        snackInfo.snacks.forEach((s) => {
          if (s.snackId) {
            const snackData = allSnacks.find((sn) => sn.id === s.snackId);
            if (snackData?.ingredientes) {
              total +=
                calculateRecipePrice(snackData as unknown as Recipe).total *
                s.quantity;
            }
          }
        });
      }

      // Postres
      const dessertInfo = dailyPlan.desserts;
      if (dessertInfo?.enabled && dessertInfo.desserts.length > 0) {
        dessertInfo.desserts.forEach((d) => {
          if (d.dessertId) {
            const dessertData = allDesserts.find(
              (dess) =>
                dess.nombre.toLowerCase().replace(/\s+/g, "-") === d.dessertId
            );
            if (dessertData) {
              total += calculateRecipePrice(dessertData).total * d.quantity;
            }
          }
        });
      }
    });

    return total;
  }, [plan, allMeals, allSnacks]);

  // Calcular porcentajes y estados
  const caloriePercentage =
    (weeklyNutrition.averages.calories / calorieGoal) * 100;
  const proteinPercentage =
    (weeklyNutrition.averages.protein / proteinGoal) * 100;
  const carbPercentage = (weeklyNutrition.averages.carbs / carbGoal) * 100;
  const fatPercentage = (weeklyNutrition.averages.fats / fatGoal) * 100;

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
    <div class="bg-white p-6 rounded-lg shadow-md border">
      {/* Header con título y botón expandir/contraer */}
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-[#3a5a40]">
          Resumen Nutricional Semanal
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          class="flex items-center space-x-2 px-3 py-1 text-sm bg-[#6B8A7A] text-white rounded-lg hover:bg-[#5a7a6a] transition-colors duration-200"
        >
          <span>{isExpanded ? "Ver menos" : "Ver más"}</span>
          <svg
            class={`w-4 h-4 transform transition-transform duration-200 ${
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
        </button>
      </div>

      {/* Vista compacta - siempre visible */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class=" flex justify-center flex-col items-center  bg-gray-50 rounded-lg p-2">
          <div class="flex justify-center items-center gap-1">
            <div class="text-2xl font-bold text-gray-900">
              {Math.round(weeklyNutrition.averages.calories)}
            </div>
            <div class="text-sm text-gray-500">kcal/día</div>
          </div>
          <div class={`text-xs mt-1 font-medium ${calorieStatus.color}`}>
            {calorieStatus.status.toUpperCase()}
          </div>
        </div>
        <div class="flex justify-center flex-col items-center  bg-gray-50 rounded-lg p-2">
          <div class="flex justify-center items-center gap-1">
            <div class="text-2xl font-bold text-gray-900">
              {weeklyNutrition.averages.protein.toFixed(1)}
            </div>
            <div class="text-sm text-gray-500">proteína/día</div>
          </div>
          <div class={`text-xs mt-1 font-medium ${proteinStatus.color}`}>
            {proteinStatus.status.toUpperCase()}
          </div>
        </div>
        <div class="flex justify-center flex-col items-center  bg-gray-50 rounded-lg p-2">
          <div class="flex justify-center items-center gap-1">
            <div class="text-2xl font-bold text-gray-900">
              {weeklyNutrition.averages.carbs.toFixed(1)}
            </div>
            <div class="text-sm text-gray-500">carbos/día</div>
          </div>
          <div class={`text-xs mt-1 font-medium ${carbStatus.color}`}>
            {carbStatus.status.toUpperCase()}
          </div>
        </div>
        <div class="flex justify-center flex-col items-center  bg-gray-50 rounded-lg p-2">
          <div class="flex justify-center items-center gap-1">
            <div class="text-2xl font-bold text-gray-900">
              {weeklyNutrition.averages.fats.toFixed(1)}
            </div>
            <div class="text-sm text-gray-500">grasas/día</div>
          </div>
          <div class={`text-xs mt-1 font-medium ${fatStatus.color}`}>
            {fatStatus.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Información adicional compacta */}
      <div class="text-center text-sm text-gray-600 mb-4">
        {weeklyNutrition.daysWithData} de 7 días con datos •
        {caloriePercentage < 80
          ? ` Faltan ${Math.round(
              calorieGoal - weeklyNutrition.averages.calories
            )} kcal/día`
          : caloriePercentage > 120
          ? ` Exceso de ${Math.round(
              weeklyNutrition.averages.calories - calorieGoal
            )} kcal/día`
          : " Calorías en objetivo"}
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div class="animate-fadeIn border-t pt-4">
          {/* Barras de progreso */}
          <div class="space-y-3 mb-6">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Calorías Promedio</span>
                <span class="text-gray-900">
                  {Math.round(weeklyNutrition.averages.calories)} /{" "}
                  {Math.round(calorieGoal)} kcal
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class={`h-3 rounded-full transition-all ${
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
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Proteína Promedio</span>
                <span class="text-gray-900">
                  {weeklyNutrition.averages.protein.toFixed(1)} /{" "}
                  {proteinGoal.toFixed(1)}g
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class={`h-3 rounded-full transition-all ${
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
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Carbohidratos Promedio</span>
                <span class="text-gray-900">
                  {weeklyNutrition.averages.carbs.toFixed(1)} /{" "}
                  {carbGoal.toFixed(1)}g
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class={`h-3 rounded-full transition-all ${
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
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-600">Grasas Promedio</span>
                <span class="text-gray-900">
                  {weeklyNutrition.averages.fats.toFixed(1)} /{" "}
                  {fatGoal.toFixed(1)}g
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  class={`h-3 rounded-full transition-all ${
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

          {/* Desglose diario */}
          <div class="mb-6">
            <h4 class="text-lg font-semibold mb-3 text-gray-800">
              Desglose Diario
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
              {weeklyNutrition.dailyBreakdown.map((day) => (
                <div
                  key={day.dayId}
                  class={`p-3 rounded-lg border text-center ${
                    day.hasData
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div class="text-sm font-medium text-gray-700 mb-2">
                    {day.day.slice(0, 3)}
                  </div>
                  {day.hasData ? (
                    <div class="space-y-1 text-xs">
                      <div class="text-gray-600">
                        {Math.round(day.calories)} kcal
                      </div>
                      <div class="text-gray-600">
                        {day.protein.toFixed(1)}g prot
                      </div>
                      <div class="text-gray-600">
                        {day.carbs.toFixed(1)}g carb
                      </div>
                      <div class="text-gray-600">
                        {day.fats.toFixed(1)}g grasas
                      </div>
                    </div>
                  ) : (
                    <div class="text-xs text-gray-400">Sin datos</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totales semanales */}
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-lg font-semibold mb-3 text-gray-800">
              Totales Semanales
            </h4>
            <div class="grid grid-cols-4 gap-2 mb-3">
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900">
                  {Math.round(weeklyNutrition.total.calories)}
                </div>
                <div class="text-xs text-gray-500">kcal</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900">
                  {weeklyNutrition.total.protein.toFixed(1)}
                </div>
                <div class="text-xs text-gray-500">proteína</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900">
                  {weeklyNutrition.total.carbs.toFixed(1)}
                </div>
                <div class="text-xs text-gray-500">carbohidratos</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900">
                  {weeklyNutrition.total.fats.toFixed(1)}
                </div>
                <div class="text-xs text-gray-500">grasas</div>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {(caloriePercentage < 80 ||
            caloriePercentage > 120 ||
            proteinPercentage < 80 ||
            proteinPercentage > 120 ||
            carbPercentage < 80 ||
            carbPercentage > 120 ||
            fatPercentage < 80 ||
            fatPercentage > 120) && (
            <div class="mt-6 p-4 rounded-lg border-l-4 border-yellow-400 bg-yellow-50">
              <div class="flex  justify-start">
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
                  <h3 class="text-sm font-medium text-yellow-800 text-left">
                    Ajustes semanales recomendados
                  </h3>
                  <div class="mt-2 text-sm text-yellow-700">
                    <ul class="list-disc list-inside space-y-1">
                      {caloriePercentage < 80 && (
                        <li>
                          Añade más calorías en promedio para alcanzar tu
                          objetivo semanal
                        </li>
                      )}
                      {caloriePercentage > 120 && (
                        <li>
                          Reduce las calorías en promedio para no exceder tu
                          objetivo semanal
                        </li>
                      )}
                      {proteinPercentage < 80 && (
                        <li>
                          Incluye más proteínas en promedio en tus comidas
                          semanales
                        </li>
                      )}
                      {proteinPercentage > 120 && (
                        <li>
                          Considera reducir la ingesta promedio de proteínas
                        </li>
                      )}
                      {carbPercentage < 80 && (
                        <li>
                          Añade más carbohidratos en promedio para alcanzar tu
                          objetivo semanal
                        </li>
                      )}
                      {carbPercentage > 120 && (
                        <li>
                          Considera reducir la ingesta promedio de carbohidratos
                        </li>
                      )}
                      {fatPercentage < 80 && (
                        <li>
                          Incluye más grasas saludables en promedio en tus
                          comidas semanales
                        </li>
                      )}
                      {fatPercentage > 120 && (
                        <li>Considera reducir la ingesta promedio de grasas</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Precio semanal */}
      <div class="text-right text-green-800 font-bold text-lg mb-2 mt-3">
        Precio total del plan semanal: {formatEuro(weeklyPrice)}
      </div>
    </div>
  );
}
