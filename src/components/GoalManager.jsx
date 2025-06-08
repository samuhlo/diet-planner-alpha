// src/components/GoalManager.jsx
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useState, useMemo } from "preact/hooks";
import ProgressChart from "./ProgressChart";

const defaultGoal = { startDate: "", endDate: "", targetWeight: 90 };
const defaultLog = [
  {
    weight: 96,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
const defaultUserData = {
  gender: "male",
  age: 35,
  height: 180,
  weight: 96,
  steps: 7500,
};

export default function GoalManager() {
  const [goal, setGoal] = useLocalStorage("userGoal", defaultGoal);
  const [weightLog, setWeightLog] = useLocalStorage("weightLog", defaultLog);
  const [userData] = useLocalStorage("userData", defaultUserData); // Leemos los datos del usuario
  const [newWeight, setNewWeight] = useState("");

  const handleGoalChange = (e) => {
    setGoal((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addWeightEntry = (e) => {
    e.preventDefault();
    const weightValue = parseFloat(newWeight);
    if (weightValue > 30 && weightValue < 200) {
      const newEntry = { weight: weightValue, date: new Date().toISOString() };
      const sortedLog = [...weightLog, newEntry].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      setWeightLog(sortedLog);
      setNewWeight("");
    }
  };
  // --- LÓGICA DE ANÁLISIS ---
  const analysis = useMemo(() => {
    const currentWeight =
      weightLog.length > 0
        ? weightLog[weightLog.length - 1].weight
        : userData.weight;
    const { gender, age, height, steps } = userData;
    const { startDate, endDate, targetWeight } = goal;

    // 1. Cálculo de BMR y TDEE (Mantenimiento)
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

    // 2. Análisis específico del objetivo
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

    // 3. Cálculo del plan de pérdida de peso
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

    // 4. Alertas de seguridad
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
  }, [goal, weightLog, userData]); // Se recalcula si cambia el objetivo, el peso o los datos del usuario
  // --- FIN DE LA LÓGICA DE ANÁLISIS ---

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
                value={goal.targetWeight}
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
                  value={goal.startDate}
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
                  value={goal.endDate}
                  onChange={handleGoalChange}
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- NUEVA SECCIÓN DE ANÁLISIS --- */}
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
                (Energía en reposo total).
              </p>
              <p class="text-sm mt-1">
                Mantenimiento con actividad ({analysis.activityLevel}):{" "}
                <strong>{analysis.tdee} kcal</strong>. (Energía para mantener tu
                peso actual).
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
                    Esto supone un déficit diario de{" "}
                    <strong>{analysis.dailyKcalDeficit} kcal</strong>.
                  </li>
                  <li>
                    Ritmo de pérdida de peso estimado:{" "}
                    <strong>{analysis.weeklyWeightLoss} kg por semana</strong>.
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
        {/* --- FIN DE LA NUEVA SECCIÓN --- */}

        <div class="bg-white p-6 rounded-lg shadow-md">
          {/* Formulario de Añadir Peso (sin cambios) */}
          <h3 class="text-xl font-bold text-stone-800 mb-4">
            Añadir Registro de Peso
          </h3>
          <form onSubmit={addWeightEntry} class="flex items-end gap-4">
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
