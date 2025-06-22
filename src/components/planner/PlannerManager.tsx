import type { VNode } from "preact";
import { useStore } from "@nanostores/preact";
import { useState, useMemo, useEffect } from "preact/hooks";
import { $plan, clearWeeklyPlan } from "../../stores/planStore";
import { $userData, $userGoal } from "../../stores/userProfileStore";
import { allSupplements } from "../../data/supplements";
import { getSnacksFromRecipes } from "../../utils/recipeUtils";
import InteractivePlanner from "./InteractivePlanner";
import { openModal } from "../../stores/modalStore";
import NutritionalSummary from "../common/NutritionalSummary";
import { useNutritionalCalculations } from "../../hooks/useNutritionalCalculations";
import type { Recipe, Ingredient, WeeklySummaryData } from "../../types";
import { DAYS_OF_WEEK, MAIN_MEAL_TYPES } from "../../config/appConstants";
import ErrorBoundary from "../common/ErrorBoundary";

interface PlannerManagerProps {
  allMeals: Recipe[];
}

export default function PlannerManager({ allMeals }: PlannerManagerProps) {
  const plan = useStore($plan);
  const userData = useStore($userData);
  const userGoal = useStore($userGoal);
  const [isHydrated, setIsHydrated] = useState(false);

  const { calorieGoal, proteinGoal } = useNutritionalCalculations(
    userData,
    userGoal
  );

  // Verificar que el componente está hidratado
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Memoizar los datos para evitar recálculos innecesarios
  const memoizedAllMeals = useMemo(() => allMeals, [allMeals]);
  const memoizedAllSupplements = useMemo(() => allSupplements, []);
  const memoizedAllSnacks = useMemo(
    () => getSnacksFromRecipes(allMeals),
    [allMeals]
  );

  // Limpiar memoria cuando el componente se desmonte
  useEffect(() => {
    return () => {
      // Cleanup function para prevenir memory leaks
      console.log("PlannerManager cleanup");
    };
  }, []);

  // Mostrar loader mientras se hidrata
  if (!isHydrated) {
    return (
      <ErrorBoundary>
        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
          <div class="flex items-center justify-center h-32">
            <div class="text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B8A7A] mx-auto mb-2"></div>
              <p class="text-gray-600 text-sm">Cargando planificador...</p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  const generateShoppingList = () => {
    const shoppingList: Record<string, Ingredient & { q: number }> = {};

    Object.values(plan).forEach((dailyPlan) => {
      // Procesar comidas principales
      MAIN_MEAL_TYPES.forEach((mealType) => {
        const mealInfo = dailyPlan[mealType];
        if (mealInfo?.recipeName) {
          const mealData = memoizedAllMeals.find(
            (m) => m.nombre === mealInfo.recipeName
          );
          const diners = mealInfo.diners || 1;
          if (mealData?.ingredientes) {
            mealData.ingredientes.forEach((ing) => {
              const key = `${ing.n.toLowerCase()}_${ing.u.toLowerCase()}`;
              if (!shoppingList[key]) {
                shoppingList[key] = { ...ing, q: 0 };
              }
              shoppingList[key].q += ing.q * diners;
            });
          }
        }
      });

      // Procesar snacks
      const snackInfo = dailyPlan.snacks;
      if (snackInfo?.enabled && snackInfo.snacks.length > 0) {
        snackInfo.snacks.forEach((selectedSnack) => {
          if (selectedSnack.snackId) {
            const snackData = memoizedAllSnacks.find(
              (s) => s.id === selectedSnack.snackId
            );
            if (snackData) {
              if (snackData.tipo === "elaborado" && snackData.ingredientes) {
                // Snacks elaborados: procesar ingredientes
                snackData.ingredientes.forEach((ing) => {
                  const key = `${ing.n.toLowerCase()}_${ing.u.toLowerCase()}`;
                  if (!shoppingList[key]) {
                    shoppingList[key] = { ...ing, q: 0 };
                  }
                  shoppingList[key].q += ing.q * selectedSnack.quantity;
                });
              } else if (snackData.tipo === "simple") {
                // Snacks simples: crear ingrediente a partir del snack
                // Extraer cantidad y unidad de la porción (ej: "1 taza (150g)" -> 150g)
                const porcionMatch = snackData.porcion.match(/\((\d+)g\)/);
                const cantidad = porcionMatch ? parseInt(porcionMatch[1]) : 100;
                const unidad = "g";

                const key = `${snackData.nombre.toLowerCase()}_${unidad}`;
                if (!shoppingList[key]) {
                  shoppingList[key] = {
                    n: snackData.nombre,
                    q: 0,
                    u: unidad,
                  };
                }
                shoppingList[key].q += cantidad * selectedSnack.quantity;
              }
            }
          }
        });
      }
    });

    const aggregated = Object.values(shoppingList);
    openModal("shopping", aggregated);
  };

  const generateWeekSummary = () => {
    const summaryData = DAYS_OF_WEEK.map((day) => {
      const dayId = day.toLowerCase();
      const dailyPlan = plan[dayId] || {};
      const dayMeals: Record<string, string> = {};
      let hasContent = false;

      // Procesar comidas principales
      MAIN_MEAL_TYPES.forEach((mealType) => {
        const mealInfo = dailyPlan[mealType];
        if (mealInfo?.recipeName) {
          dayMeals[mealType.toLowerCase()] = mealInfo.recipeName;
          hasContent = true;
        }
      });

      // Procesar suplementos
      const suppInfo = dailyPlan.supplement;
      if (suppInfo?.enabled && suppInfo.supplements.length > 0) {
        const supplementList = suppInfo.supplements
          .filter((s) => s.supplementId)
          .map((s) => {
            const suppData = memoizedAllSupplements.find(
              (sup) => sup.id === s.supplementId
            );
            return suppData ? `${s.quantity}x ${suppData.name}` : null;
          })
          .filter(Boolean)
          .join(", ");

        if (supplementList) {
          dayMeals.supplement = supplementList;
          hasContent = true;
        }
      }

      // Procesar snacks
      const snackInfo = dailyPlan.snacks;
      if (snackInfo?.enabled && snackInfo.snacks.length > 0) {
        const snackList = snackInfo.snacks
          .filter((s) => s.snackId)
          .map((s) => {
            const snackData = memoizedAllSnacks.find(
              (sn) => sn.id === s.snackId
            );
            return snackData ? `${s.quantity}x ${snackData.nombre}` : null;
          })
          .filter(Boolean)
          .join(", ");

        if (snackList) {
          dayMeals.snacks = snackList;
          hasContent = true;
        }
      }

      return hasContent ? { day, meals: dayMeals } : null;
    }).filter(Boolean);

    openModal("summary", summaryData as WeeklySummaryData[]);
  };

  return (
    <ErrorBoundary>
      <NutritionalSummary />
      <div>
        <div class="text-center mb-8 flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={generateShoppingList}
            class="bg-[#436d4b] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#2c4230] transition shadow-lg"
          >
            Lista de la Compra
          </button>
          <button
            onClick={generateWeekSummary}
            class="bg-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Ver Resumen
          </button>
          {/* Clear plan button */}
          <button
            onClick={clearWeeklyPlan}
            class="bg-red-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition shadow-lg"
          >
            Limpiar Plan
          </button>
        </div>
        <InteractivePlanner
          allMeals={memoizedAllMeals}
          allSupplements={memoizedAllSupplements}
          targetCalories={calorieGoal}
          targetProtein={proteinGoal}
        />
      </div>
    </ErrorBoundary>
  );
}
