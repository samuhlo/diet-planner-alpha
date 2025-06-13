import { useStore } from "@nanostores/preact";
import { $userGoal, updateUserGoal } from "../../stores/userProfileStore.ts";
import { useState, useEffect } from "preact/hooks";

const goalDefaults = { startDate: "", endDate: "", targetWeight: 90 };

export default function GoalForm() {
  const goal = useStore($userGoal);
  const [isEditing, setIsEditing] = useState(false);
  const [editableGoal, setEditableGoal] = useState(goalDefaults);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar datos del localStorage al montar el componente
  useEffect(() => {
    const loadGoalFromStorage = () => {
      try {
        const storedGoal = localStorage.getItem("userGoal");
        if (storedGoal) {
          const parsedGoal = JSON.parse(storedGoal);
          setEditableGoal(parsedGoal);
          // Si hay datos válidos, no estar en modo edición
          if (parsedGoal.startDate && parsedGoal.targetWeight) {
            setIsEditing(false);
          } else {
            setIsEditing(true);
          }
        } else {
          // Si no hay datos en localStorage, entrar en modo edición
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error loading goal from localStorage:", error);
        setIsEditing(true);
      }
      setIsLoaded(true);
    };

    loadGoalFromStorage();
  }, []);

  // Sincronizar con el store cuando cambie
  useEffect(() => {
    if (isLoaded && goal) {
      setEditableGoal(goal);
      // Si se guardan datos por primera vez, salimos del modo edición
      if (isEditing && goal.startDate && goal.targetWeight) {
        setIsEditing(false);
      }
    }
  }, [goal, isLoaded]);

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
    // Restaurar los datos del store o localStorage
    const currentGoal = goal || goalDefaults;
    setEditableGoal(currentGoal);
    setIsEditing(false);
  };

  // Mostrar loading mientras se cargan los datos
  if (!isLoaded) {
    return (
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-stone-800 mb-4">
          Define tu Objetivo
        </h3>
        <div class="flex items-center justify-center py-8">
          <div class="text-gray-500">Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-xl font-bold text-stone-800 mb-4">Define tu Objetivo</h3>

      {isEditing ? (
        // Formulario de edición
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Peso Objetivo (kg)
            </label>
            <input
              type="number"
              name="targetWeight"
              value={editableGoal.targetWeight || ""}
              onChange={handleGoalChange}
              step="0.1"
              class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                value={editableGoal.startDate || ""}
                onChange={handleGoalChange}
                class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Fecha Fin
              </label>
              <input
                type="date"
                name="endDate"
                value={editableGoal.endDate || ""}
                onChange={handleGoalChange}
                class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-2">
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
          </div>
        </div>
      ) : (
        // Vista de solo lectura
        <div class="space-y-4">
          {editableGoal.startDate && editableGoal.targetWeight ? (
            // Mostrar información del objetivo actual
            <div class="p-4 bg-green-50 border border-green-200 rounded-md">
              <div class="text-sm text-green-800">
                <div class="font-medium text-base mb-3">Objetivo actual:</div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-green-700">
                      {editableGoal.targetWeight}
                    </div>
                    <div class="text-xs text-green-600">kg objetivo</div>
                  </div>
                  <div class="text-center">
                    <div class="text-sm font-medium text-green-700">
                      {new Date(editableGoal.startDate).toLocaleDateString(
                        "es-ES"
                      )}
                    </div>
                    <div class="text-xs text-green-600">Fecha inicio</div>
                  </div>
                  {editableGoal.endDate && (
                    <div class="text-center">
                      <div class="text-sm font-medium text-green-700">
                        {new Date(editableGoal.endDate).toLocaleDateString(
                          "es-ES"
                        )}
                      </div>
                      <div class="text-xs text-green-600">Fecha fin</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // No hay objetivo definido
            <div class="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
              <div class="text-gray-500 mb-3">No hay objetivo definido</div>
              <div class="text-sm text-gray-400">
                Define tu peso objetivo y fechas para comenzar
              </div>
            </div>
          )}

          <div class="flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editableGoal.startDate && editableGoal.targetWeight
                ? "Editar Objetivo"
                : "Definir Objetivo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
