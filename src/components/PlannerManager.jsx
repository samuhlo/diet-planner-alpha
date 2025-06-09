import { useMemo, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $plan } from "../stores/planStore.ts";
import { $userData, $userGoal } from "../stores/userProfileStore.ts";
import { allSupplements } from "../data/supplements.ts";
import InteractivePlanner from "./InteractivePlanner";
import { openModal } from "../stores/modalStore.ts"; // Importamos la acción de abrir

export default function PlannerManager({ allMeals }) {
  const plan = useStore($plan);
  const userData = useStore($userData);
  const userGoal = useStore($userGoal);

  const { calorieGoal, proteinGoal } = useMemo(() => {
    // CORRECCIÓN: Añadimos una "guarda". Si no hay datos de usuario,
    // devolvemos valores por defecto seguros para evitar el crash.
    if (!userData) {
      return { calorieGoal: 0, proteinGoal: 0 };
    }

    const calculatedProteinGoal = Math.round(userData.weight * 1.8);

    let activityFactor = 1.2;
    if (userData.steps >= 10000) activityFactor = 1.725;
    else if (userData.steps >= 7500) activityFactor = 1.55;
    else if (userData.steps >= 5000) activityFactor = 1.375;

    const bmr =
      userData.gender === "male"
        ? 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5
        : 10 * userData.weight +
          6.25 * userData.height -
          5 * userData.age -
          161;

    const tdee = Math.round(bmr * activityFactor);

    if (
      userGoal && // Comprobamos que userGoal también exista
      userGoal.startDate &&
      userGoal.endDate &&
      new Date(userGoal.startDate) < new Date(userGoal.endDate)
    ) {
      const weightToLose = userData.weight - parseFloat(userGoal.targetWeight);
      if (weightToLose > 0) {
        const durationInDays =
          (new Date(userGoal.endDate) - new Date(userGoal.startDate)) /
          (1000 * 60 * 60 * 24);
        if (durationInDays > 0) {
          const dailyDeficit = Math.round(
            (weightToLose * 7700) / durationInDays
          );
          return {
            calorieGoal: tdee - dailyDeficit,
            proteinGoal: calculatedProteinGoal,
          };
        }
      }
    }

    return { calorieGoal: tdee - 500, proteinGoal: calculatedProteinGoal };
  }, [userData, userGoal]);

  const generateShoppingList = () => {
    const shoppingList = {};
    const mealTypes = ["Desayuno", "Almuerzo", "Cena"];

    Object.values(plan).forEach((dailyPlan) => {
      mealTypes.forEach((mealType) => {
        const mealInfo = dailyPlan[mealType];
        if (mealInfo?.recipeName) {
          const mealData = allMeals.find(
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
    });
    const aggregated = Object.values(shoppingList);
    openModal("shopping", aggregated);
  };

  const generateWeekSummary = () => {
    const daysOfWeek = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];
    const mealTypes = ["Desayuno", "Almuerzo", "Cena"];
    const summaryData = daysOfWeek
      .map((day) => {
        const dayId = day.toLowerCase();
        const dailyPlan = plan[dayId] || {};
        const dayMeals = {};
        let hasContent = false;

        mealTypes.forEach((mealType) => {
          const mealInfo = dailyPlan[mealType];
          if (mealInfo?.recipeName) {
            dayMeals[mealType.toLowerCase()] = mealInfo.recipeName;
            hasContent = true;
          }
        });

        const suppInfo = dailyPlan.supplement;
        if (suppInfo?.shakes > 0) {
          const suppData = allSupplements.find((s) => s.id === suppInfo.type);
          dayMeals.supplement = `${suppInfo.shakes} ${
            suppData ? suppData.name : "batido(s)"
          }`;
          hasContent = true;
        }
        return hasContent ? { day, meals: dayMeals } : null;
      })
      .filter(Boolean);

    openModal("summary", summaryData);
  };

  return (
    <div>
      <div class="text-center mb-8 flex flex-wrap justify-center items-center gap-4">
        <button
          onClick={generateShoppingList}
          class="bg-[#3a5a40] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#2c4230] transition shadow-lg"
        >
          🛒 Lista de la Compra
        </button>
        <button
          onClick={generateWeekSummary}
          class="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          📋 Ver Resumen
        </button>
      </div>
      <InteractivePlanner
        allMeals={allMeals}
        allSupplements={allSupplements}
        targetCalories={calorieGoal}
        targetProtein={proteinGoal}
      />
    </div>
  );
}
