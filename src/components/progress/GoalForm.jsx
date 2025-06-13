import { useStore } from "@nanostores/preact";
import { $userGoal, updateUserGoal } from "../../stores/userProfileStore.ts";
import { $userData } from "../../stores/userProfileStore.ts";
import { useState, useEffect } from "preact/hooks";

const goalDefaults = {
  startDate: "",
  endDate: "",
  targetWeight: 90,
  goalType: "maintain",
};

export default function GoalForm() {
  const goal = useStore($userGoal);
  const userData = useStore($userData);
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
          if (parsedGoal.goalType) {
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
      if (isEditing && goal.goalType) {
        setIsEditing(false);
      }
    }
  }, [goal, isLoaded]);

  const handleGoalChange = (e) => {
    const { name, value } = e.target;
    setEditableGoal((prev) => ({
      ...prev,
      [name]: value,
      // Si se selecciona mantener peso, establecer el peso objetivo como el peso actual del usuario
      ...(name === "goalType" &&
        value === "maintain" &&
        userData?.weight && {
          targetWeight: userData.weight,
        }),
    }));
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
          {/* Selección del tipo de objetivo */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ¿Cuál es tu objetivo?
            </label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  type="radio"
                  name="goalType"
                  value="maintain"
                  checked={editableGoal.goalType === "maintain"}
                  onChange={handleGoalChange}
                  class="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span class="ml-2 text-sm text-gray-700">
                  <strong>Mantener mi peso actual</strong> - Planificador de
                  comidas saludables
                </span>
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  name="goalType"
                  value="lose"
                  checked={editableGoal.goalType === "lose"}
                  onChange={handleGoalChange}
                  class="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <span class="ml-2 text-sm text-gray-700">
                  <strong>Bajar de peso</strong> - Plan de pérdida de peso con
                  déficit calórico
                </span>
              </label>
            </div>
          </div>

          {/* Campos específicos para bajar de peso */}
          {editableGoal.goalType === "lose" && (
            <>
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
            </>
          )}

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
          {editableGoal.goalType ? (
            // Mostrar información del objetivo actual
            <div
              class={`p-4 border rounded-md ${
                editableGoal.goalType === "maintain"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div
                class={`text-sm ${
                  editableGoal.goalType === "maintain"
                    ? "text-blue-800"
                    : "text-green-800"
                }`}
              >
                <div class="font-medium text-base mb-3">
                  {editableGoal.goalType === "maintain"
                    ? "Objetivo: Mantener peso"
                    : "Objetivo: Bajar de peso"}
                </div>

                {editableGoal.goalType === "maintain" ? (
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-700">
                      {editableGoal.targetWeight} kg
                    </div>
                    <div class="text-xs text-blue-600">
                      Peso objetivo (actual)
                    </div>
                    <div class="text-sm mt-2 text-blue-700">
                      Planificador de comidas saludables para mantener tu peso
                    </div>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          ) : (
            // No hay objetivo definido
            <div class="p-4 bg-gray-50 border border-gray-200 rounded-md text-center">
              <div class="text-gray-500 mb-3">No hay objetivo definido</div>
              <div class="text-sm text-gray-400">
                Define tu tipo de objetivo para comenzar
              </div>
            </div>
          )}

          <div class="flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {editableGoal.goalType ? "Editar Objetivo" : "Definir Objetivo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
