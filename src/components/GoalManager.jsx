// src/components/GoalManager.jsx
import { useStore } from "@nanostores/preact";
import {
  $userData,
  $userGoal,
  $weightLog,
  updateUserGoal,
  addWeightEntry,
} from "../stores/userProfileStore.ts";
import { useState, useMemo } from "preact/hooks";
import ProgressChart from "./ProgressChart";

export default function GoalManager() {
  const goal = useStore($userGoal);
  const userData = useStore($userData);

  const weightLog = useStore($weightLog);
  const weightLogArray = useMemo(() => {
    return Object.values(weightLog || {}).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [weightLog]);

  const [newWeight, setNewWeight] = useState("");

  const handleGoalChange = (e) => {
    updateUserGoal(e.target.name, e.target.value);
  };

  const handleAddWeight = (e) => {
    e.preventDefault();
    const weightValue = parseFloat(newWeight);
    if (weightValue > 30 && weightValue < 200) {
      addWeightEntry({ weight: weightValue, date: new Date().toISOString() });
      setNewWeight("");
    }
  };

  const analysis = useMemo(() => {
    // CORRECCIÓN: Añadimos la misma "guarda" aquí.
    if (!userData || !goal) {
      return {
        isValid: false,
        message: "Completa tus datos y tu objetivo para ver el análisis.",
        bmr: "---",
        tdee: "---",
        activityLevel: "---",
      };
    }

    const currentWeight =
      weightLogArray.length > 0
        ? weightLogArray[weightLogArray.length - 1].weight
        : userData.weight;
    const { gender, age, height, steps } = userData;
    const { startDate, endDate, targetWeight } = goal;

    const bmr = Math.round(
      gender === "male"
        ? 10 * currentWeight + 6.25 * height - 5 * age + 5
        : 10 * currentWeight + 6.25 * height - 5 * age - 161
    );

    let activityFactor = 1.2,
      activityLevel = "Sedentaria";
    if (steps >= 10000) {
      activityFactor = 1.725;
      activityLevel = "Muy Activa";
    } else if (steps >= 7500) {
      activityFactor = 1.55;
      activityLevel = "Moderada";
    } else if (steps >= 5000) {
      activityFactor = 1.375;
      activityLevel = "Ligera";
    }

    const tdee = Math.round(bmr * activityFactor);

    if (!startDate || !endDate || !targetWeight) {
      return {
        isValid: false,
        message: "Completa tu objetivo para ver el plan detallado.",
        bmr,
        tdee,
        activityLevel,
      };
    }

    const start = new Date(startDate),
      end = new Date(endDate),
      target = parseFloat(targetWeight);
    if (start >= end) {
      return {
        isValid: false,
        message: "La fecha de fin debe ser posterior a la de inicio.",
        bmr,
        tdee,
        activityLevel,
      };
    }

    const weightToChange = currentWeight - target;
    if (weightToChange <= 0) {
      return {
        isValid: false,
        message: `Tu peso actual ya es igual o inferior al objetivo. ¡Felicidades!`,
        bmr,
        tdee,
        activityLevel,
      };
    }

    const totalKcalDeficit = weightToChange * 7700;
    const durationInDays = (end - start) / (1000 * 60 * 60 * 24);
    if (durationInDays <= 0) {
      return {
        isValid: false,
        message: "El período de tiempo no es válido.",
        bmr,
        tdee,
        activityLevel,
      };
    }
    const dailyKcalDeficit = Math.round(totalKcalDeficit / durationInDays);
    const weeklyWeightLoss = ((dailyKcalDeficit * 7) / 7700).toFixed(2);
    const targetCalories = tdee - dailyKcalDeficit;

    let alert = null;
    if (weeklyWeightLoss > 1.5)
      alert = {
        type: "danger",
        text: "¡Peligro! Perder más de 1.5 kg/semana no es seguro sin supervisión médica.",
      };
    else if (weeklyWeightLoss > 1)
      alert = {
        type: "warning",
        text: "Advertencia: Perder más de 1 kg por semana es un objetivo muy agresivo.",
      };
    else if (targetCalories < 1200)
      alert = {
        type: "warning",
        text: `Cuidado: Tu objetivo de ${targetCalories} kcal es muy bajo. Se recomienda no consumir menos de 1200 kcal.`,
      };

    return {
      isValid: true,
      bmr,
      tdee,
      activityLevel,
      dailyKcalDeficit,
      weeklyWeightLoss,
      targetCalories,
      alert,
    };
  }, [goal, weightLog, userData]);

  return (
    <div class="grid lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          {/* Formulario de Objetivo */}
          <h3 class="text-xl font-bold text-stone-800 mb-4">
            Define tu Objetivo
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Peso Objetivo (kg)
              </label>
              <input
                type="number"
                name="targetWeight"
                value={goal?.targetWeight || ""}
                onChange={handleGoalChange}
                class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={goal?.startDate || ""}
                  onChange={handleGoalChange}
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={goal?.endDate || ""}
                  onChange={handleGoalChange}
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Sección de Análisis */}
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold text-stone-800 mb-4">
            Análisis del Objetivo
          </h3>
          <div class="space-y-4 text-stone-700">
            <div class="p-4 bg-gray-50 rounded-lg">
              <h4 class="font-semibold text-lg text-[#3a5a40]">
                Tu Gasto Energético
              </h4>
              <p class="text-sm mt-1">
                Metabolismo Basal (BMR): <strong>{analysis.bmr} kcal</strong>.
              </p>
              <p class="text-sm mt-1">
                Mantenimiento ({analysis.activityLevel}):{" "}
                <strong>{analysis.tdee} kcal</strong>.
              </p>
            </div>
            {analysis.isValid ? (
              <div class="p-4 bg-blue-50 rounded-lg">
                <h4 class="font-semibold text-lg text-blue-800">
                  Plan para tu Meta
                </h4>
                <p class="text-sm mt-1">
                  Calorías objetivo diarias:{" "}
                  <strong>{analysis.targetCalories} kcal</strong>.
                </p>
                <ul class="text-sm list-disc list-inside space-y-1 pl-2 mt-2">
                  <li>
                    Déficit diario necesario:{" "}
                    <strong>{analysis.dailyKcalDeficit} kcal</strong>.
                  </li>
                  <li>
                    Pérdida de peso estimada:{" "}
                    <strong>{analysis.weeklyWeightLoss} kg/semana</strong>.
                  </li>
                </ul>
              </div>
            ) : (
              <p class="text-stone-500 italic text-center p-4">
                {analysis.message}
              </p>
            )}
            {analysis.alert && (
              <div
                class={`p-4 mt-2 rounded-lg text-sm font-bold ${
                  analysis.alert.type === "danger"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                <p>{analysis.alert.text}</p>
              </div>
            )}
          </div>
        </div>
        {/* Formulario de Añadir Peso */}
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold text-stone-800 mb-4">
            Añadir Registro de Peso
          </h3>
          <form onSubmit={handleAddWeight} class="flex items-end gap-4">
            <div class="flex-grow">
              <label class="block text-sm font-medium text-gray-700">
                Nuevo Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={newWeight}
                onInput={(e) => setNewWeight(e.target.value)}
                class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
              />
            </div>
            <button
              type="submit"
              class="bg-[#6B8A7A] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#597465] transition h-10"
            >
              Añadir
            </button>
          </form>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
        <ProgressChart weightLog={weightLog} goal={goal} />
      </div>
    </div>
  );
}
