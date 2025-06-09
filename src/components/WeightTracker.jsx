// src/components/WeightTracker.jsx
import { useStore } from "@nanostores/preact";
import {
  $userGoal,
  $weightLog,
  addWeightEntry,
} from "../stores/userProfileStore.ts";
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

  const handleAddWeight = (e) => {
    e.preventDefault();
    const weightValue = parseFloat(newWeight);
    if (weightValue > 30 && weightValue < 200) {
      addWeightEntry({ weight: weightValue, date: new Date().toISOString() });
      setNewWeight("");
    }
  };

  return (
    <div class="space-y-6">
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
        </div>
      </div>
    </div>
  );
}
