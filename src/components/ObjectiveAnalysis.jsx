// src/components/ObjectiveAnalysis.jsx
import { useStore } from "@nanostores/preact";
import {
  $userData,
  $userGoal,
  $weightLog,
} from "../stores/userProfileStore.ts";
import { useMemo } from "preact/hooks";

export default function ObjectiveAnalysis() {
  const goal = useStore($userGoal);
  const userData = useStore($userData);
  const weightLogObject = useStore($weightLog);
  const weightLog = useMemo(
    () => Object.values(weightLogObject || {}),
    [weightLogObject]
  );

  const analysis = useMemo(() => {
    if (!userData || !goal || !goal.targetWeight) {
      return {
        isValid: false,
        message: "Define tus datos y objetivo para ver el análisis.",
        bmr: "---",
        tdee: "---",
        activityLevel: "---",
      };
    }

    const currentWeight =
      weightLog.length > 0
        ? weightLog[weightLog.length - 1].weight
        : userData.weight;
    const { gender, age, height, steps } = userData;
    const { startDate, endDate, targetWeight } = goal;

    // ... (Toda la lógica de cálculo del `analysis` que ya tenías va aquí, no necesita cambios)
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

    if (!startDate || !endDate || !targetWeight)
      return {
        isValid: false,
        message: "Completa tu objetivo para ver el plan detallado.",
        bmr,
        tdee,
        activityLevel,
      };
    const start = new Date(startDate),
      end = new Date(endDate),
      target = parseFloat(targetWeight);
    if (start >= end)
      return {
        isValid: false,
        message: "La fecha de fin debe ser posterior a la de inicio.",
        bmr,
        tdee,
        activityLevel,
      };
    const weightToChange = currentWeight - target;
    if (weightToChange <= 0)
      return {
        isValid: false,
        message: `Tu peso actual ya es igual o inferior al objetivo. ¡Felicidades!`,
        bmr,
        tdee,
        activityLevel,
      };
    const totalKcalDeficit = weightToChange * 7700;
    const durationInDays = (end - start) / (1000 * 60 * 60 * 24);
    if (durationInDays <= 0)
      return {
        isValid: false,
        message: "El período de tiempo no es válido.",
        bmr,
        tdee,
        activityLevel,
      };
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
  }, [goal, userData, weightLog]);

  return (
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
  );
}
