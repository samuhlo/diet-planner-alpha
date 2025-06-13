// src/components/WeightTracker.jsx
import { useStore } from "@nanostores/preact";
import {
  $userGoal,
  $weightLog,
  addWeightEntry,
} from "../../stores/userProfileStore.ts";
import { useState, useMemo } from "preact/hooks";
import ProgressChart from "./ProgressChart";

export default function WeightTracker() {
  const goal = useStore($userGoal);
  const weightLogObject = useStore($weightLog);
  const weightLog = useMemo(
    () => Object.values(weightLogObject || {}),
    [weightLogObject]
  );

  const [newWeight, setNewWeight] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  const handleAddWeight = (e) => {
    e.preventDefault();
    const weightValue = parseFloat(newWeight);
    if (weightValue > 30 && weightValue < 200) {
      addWeightEntry({ weight: weightValue, date: new Date().toISOString() });
      setNewWeight("");

      // Mostrar notificación
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const handleDeleteWeight = () => {
    $weightLog.set({});
  };

  return (
    <div class="space-y-6">
      {/* Notificación de peso actualizado */}
      {showNotification && (
        <div class="bg-green-50 border border-green-200 rounded-md p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">
                ¡Peso actualizado! Tu perfil se ha actualizado con el nuevo
                peso.
              </p>
            </div>
          </div>
        </div>
      )}

      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-stone-800 mb-4">
          Tu Progreso Visual
        </h3>
        <div class="h-full">
          <ProgressChart weightLog={weightLog} goal={goal} />
        </div>
        <div class="p-6 ">
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
              class="bg-[#6B8A7A] text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition h-10"
            >
              Añadir
            </button>
          </form>
          <div class="mt-4 flex justify-center">
            <button
              onClick={handleDeleteWeight}
              class="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition h-10"
            >
              Borrar Registros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
