// src/components/GoalManager.jsx
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useState, useMemo } from "preact/hooks";
import ProgressChart from "./ProgressChart"; // Importamos la gráfica "tonta"

const defaultGoal = { startDate: "", endDate: "", targetWeight: 90 };
const defaultLog = [
  {
    weight: 96,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function GoalManager() {
  const [goal, setGoal] = useLocalStorage("userGoal", defaultGoal);
  const [weightLog, setWeightLog] = useLocalStorage("weightLog", defaultLog);
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
    if (
      !goal.startDate ||
      !goal.endDate ||
      !goal.targetWeight ||
      weightLog.length === 0
    ) {
      return {
        isValid: false,
        message: "Completa los datos de tu objetivo para ver el análisis.",
      };
    }

    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const currentWeight = weightLog[weightLog.length - 1].weight;
    const targetWeight = parseFloat(goal.targetWeight);

    if (startDate >= endDate) {
      return {
        isValid: false,
        message: "La fecha de fin debe ser posterior a la fecha de inicio.",
      };
    }

    const weightToLose = currentWeight - targetWeight;
    if (weightToLose <= 0) {
      return {
        isValid: false,
        message:
          "Tu peso actual ya es igual o inferior al objetivo. ¡Felicidades!",
      };
    }

    const totalKcalDeficit = weightToLose * 7700; // 1kg de grasa ~= 7700 kcal
    const durationInDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const durationInWeeks = durationInDays / 7;

    const weeklyKcalDeficit = Math.round(totalKcalDeficit / durationInWeeks);
    const dailyKcalDeficit = Math.round(weeklyKcalDeficit / 7);
    const weeklyWeightLoss = (weeklyKcalDeficit / 7700).toFixed(2);

    let alert = null;
    if (weeklyWeightLoss > 1.5) {
      alert = {
        type: "danger",
        text: "¡Peligro! Un ritmo de pérdida de peso superior a 1.5 kg/semana es muy peligroso. Consulta a un profesional de la salud.",
      };
    } else if (weeklyWeightLoss > 1) {
      alert = {
        type: "warning",
        text: "Advertencia: Perder más de 1 kg por semana es un objetivo muy agresivo y puede no ser sostenible ni saludable.",
      };
    }

    return {
      isValid: true,
      dailyKcalDeficit,
      weeklyKcalDeficit,
      weeklyWeightLoss,
      alert,
    };
  }, [goal, weightLog]); // Se recalcula si el objetivo o el registro cambian
  // --- FIN DE LA LÓGICA DE ANÁLISIS ---

  return (
    <div class="grid lg:grid-cols-2 gap-8">
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          {/* Formulario de Objetivo (sin cambios) */}
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
          {analysis.isValid ? (
            <div class="space-y-3 text-stone-700">
              <p>Para alcanzar tu meta necesitas:</p>
              <ul class="list-disc list-inside space-y-1 pl-2">
                <li>
                  Un déficit diario de{" "}
                  <strong>{analysis.dailyKcalDeficit} kcal</strong>.
                </li>
                <li>
                  Un déficit semanal de{" "}
                  <strong>{analysis.weeklyKcalDeficit} kcal</strong>.
                </li>
              </ul>
              <p>
                Esto equivale a una pérdida de peso estimada de{" "}
                <strong>{analysis.weeklyWeightLoss} kg por semana</strong>.
              </p>

              {analysis.alert && (
                <div
                  class={`p-4 mt-4 rounded-lg ${
                    analysis.alert.type === "danger"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  <p class="font-bold">{analysis.alert.text}</p>
                </div>
              )}
            </div>
          ) : (
            <p class="text-stone-500 italic">{analysis.message}</p>
          )}
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
