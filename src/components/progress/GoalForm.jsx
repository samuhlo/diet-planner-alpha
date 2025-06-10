import { useStore } from "@nanostores/preact";
import { $userGoal, updateUserGoal } from "../../stores/userProfileStore.ts";
import { useState, useEffect } from "preact/hooks";

const goalDefaults = { startDate: "", endDate: "", targetWeight: 90 };

export default function GoalForm() {
  const goal = useStore($userGoal);
  const [isEditing, setIsEditing] = useState(!goal); // Entra en modo edición si no hay objetivo
  const [editableGoal, setEditableGoal] = useState(goal || goalDefaults);

  useEffect(() => {
    if (goal) {
      setEditableGoal(goal);
      // Si se guardan datos por primera vez, salimos del modo edición
      if (isEditing && goal.startDate && goal.targetWeight) {
        setIsEditing(false);
      }
    } else {
      // Si el objetivo se borra, entramos en modo edición
      setIsEditing(true);
    }
  }, [goal]);

  const handleGoalChange = (e) => {
    setEditableGoal((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveGoal = () => {
    // Guardamos cada clave en la store
    Object.entries(editableGoal).forEach(([key, value]) => {
      updateUserGoal(key, value);
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditableGoal(goal || goalDefaults);
    setIsEditing(false);
  };

  return (
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-xl font-bold text-stone-800 mb-4">Define tu Objetivo</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Peso Objetivo (kg)
          </label>
          <input
            type="number"
            name="targetWeight"
            value={editableGoal.targetWeight}
            onChange={handleGoalChange}
            disabled={!isEditing}
            step="0.1"
            class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md disabled:bg-gray-100"
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
              value={editableGoal.startDate}
              onChange={handleGoalChange}
              disabled={!isEditing}
              class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md disabled:bg-gray-100"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Fecha Fin
            </label>
            <input
              type="date"
              name="endDate"
              value={editableGoal.endDate}
              onChange={handleGoalChange}
              disabled={!isEditing}
              class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md disabled:bg-gray-100"
            />
          </div>
        </div>
        <div class="mt-4 flex justify-end space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveGoal}
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Guardar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Editar Objetivo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
