import { useState, useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $user } from "../../stores/authStore";
import {
  getActiveUserGoal,
  createUserGoal,
  updateUserGoal,
} from "../../services/databaseService";
import type { UserGoal } from "../../types/database";

// Importar stores locales para sincronización con análisis
import {
  $userData,
  $userGoal,
  updateUserGoal as updateLocalGoal,
} from "../../stores/userProfileStore";

interface ProfileGoalFormProps {
  onGoalChange?: (goal: UserGoal | null) => void;
}

export default function ProfileGoalForm({
  onGoalChange,
}: ProfileGoalFormProps) {
  const user = useStore($user);
  const userData = useStore($userData);

  const [activeGoal, setActiveGoal] = useState<UserGoal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estado del formulario editable
  const [editableGoal, setEditableGoal] = useState({
    goal_type: "maintain" as "lose" | "gain" | "maintain",
    target_weight: "",
    start_date: "",
    end_date: "",
  });

  // Cargar objetivo actual
  useEffect(() => {
    const loadGoal = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const goal = await getActiveUserGoal(user.id);
        setActiveGoal(goal);

        if (goal) {
          setEditableGoal({
            goal_type: goal.goal_type || "maintain",
            target_weight: goal.target_weight?.toString() || "",
            start_date: goal.start_date || "",
            end_date: goal.end_date || "",
          });

          // Sincronizar con store local
          updateLocalGoal(
            "goalType",
            goal.goal_type === "gain" ? "lose" : goal.goal_type || "maintain"
          );
          updateLocalGoal("targetWeight", goal.target_weight || 0);
          updateLocalGoal("startDate", goal.start_date || "");
          updateLocalGoal("endDate", goal.end_date || "");
        } else {
          // Si no hay objetivo, activar modo edición
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error al cargar objetivo:", error);
        setMessage({ type: "error", text: "Error al cargar el objetivo" });
      } finally {
        setLoading(false);
      }
    };

    loadGoal();
  }, [user?.id]);

  const handleGoalChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;

    setEditableGoal((prev) => ({
      ...prev,
      [name]: value,
      // Si se selecciona mantener peso, establecer el peso actual como objetivo
      ...(name === "goal_type" &&
        value === "maintain" &&
        userData?.weight && {
          target_weight: userData.weight.toString(),
        }),
    }));

    // Sincronizar con store local en tiempo real
    if (name === "goal_type") {
      const goalType =
        value === "gain" ? "lose" : (value as "maintain" | "lose");
      updateLocalGoal("goalType", goalType);
      if (value === "maintain" && userData?.weight) {
        updateLocalGoal("targetWeight", userData.weight);
      }
    } else if (name === "target_weight") {
      updateLocalGoal("targetWeight", parseFloat(value) || 0);
    } else if (name === "start_date") {
      updateLocalGoal("startDate", value);
    } else if (name === "end_date") {
      updateLocalGoal("endDate", value);
    }

    setMessage(null);
  };

  const handleSaveGoal = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      setMessage(null);

      const goalData = {
        goal_type: editableGoal.goal_type,
        target_weight: editableGoal.target_weight
          ? parseFloat(editableGoal.target_weight)
          : undefined,
        start_date: editableGoal.start_date || undefined,
        end_date: editableGoal.end_date || undefined,
      };

      let updatedGoal;
      if (activeGoal) {
        // Actualizar objetivo existente
        updatedGoal = await updateUserGoal(activeGoal.id, goalData);
      } else {
        // Crear nuevo objetivo
        updatedGoal = await createUserGoal({
          user_id: user.id,
          ...goalData,
        });
      }

      if (updatedGoal) {
        setActiveGoal(updatedGoal);

        // Sincronizar con store local para análisis
        updateLocalGoal(
          "goalType",
          updatedGoal.goal_type === "gain"
            ? "lose"
            : updatedGoal.goal_type || "maintain"
        );
        updateLocalGoal("targetWeight", updatedGoal.target_weight || 0);
        updateLocalGoal("startDate", updatedGoal.start_date || "");
        updateLocalGoal("endDate", updatedGoal.end_date || "");

        // Notificar cambio al componente padre
        onGoalChange?.(updatedGoal);
      }

      setIsEditing(false);
      setMessage({
        type: "success",
        text: "¡Objetivo guardado correctamente!",
      });
    } catch (error) {
      console.error("Error al guardar objetivo:", error);
      setMessage({ type: "error", text: "Error al guardar el objetivo" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Restaurar datos originales
    if (activeGoal) {
      setEditableGoal({
        goal_type: activeGoal.goal_type || "maintain",
        target_weight: activeGoal.target_weight?.toString() || "",
        start_date: activeGoal.start_date || "",
        end_date: activeGoal.end_date || "",
      });
    }
    setIsEditing(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center py-8">
        <div class="text-gray-600">Cargando objetivo...</div>
      </div>
    );
  }

  return (
    <div class="space-y-4">
      {/* Mensaje de estado */}
      {message && (
        <div
          class={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

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
                  name="goal_type"
                  value="maintain"
                  checked={editableGoal.goal_type === "maintain"}
                  onChange={handleGoalChange}
                  class="h-4 w-4 text-[#3a5a40] border-gray-300 focus:ring-[#3a5a40]"
                />
                <span class="ml-2 text-sm text-gray-700">
                  <strong>Mantener mi peso actual</strong> - Planificador de
                  comidas saludables
                </span>
              </label>
              <label class="flex items-center">
                <input
                  type="radio"
                  name="goal_type"
                  value="lose"
                  checked={editableGoal.goal_type === "lose"}
                  onChange={handleGoalChange}
                  class="h-4 w-4 text-[#3a5a40] border-gray-300 focus:ring-[#3a5a40]"
                />
                <span class="ml-2 text-sm text-gray-700">
                  <strong>Bajar de peso</strong> - Plan de pérdida de peso con
                  déficit calórico
                </span>
              </label>
            </div>
          </div>

          {/* Campos específicos para bajar de peso */}
          {editableGoal.goal_type === "lose" && (
            <>
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Peso Objetivo (kg)
                </label>
                <input
                  type="number"
                  name="target_weight"
                  value={editableGoal.target_weight}
                  onChange={handleGoalChange}
                  step="0.1"
                  class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                  placeholder="65.0"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={editableGoal.start_date}
                    onChange={handleGoalChange}
                    class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    value={editableGoal.end_date}
                    onChange={handleGoalChange}
                    class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          <div class="flex justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveGoal}
              disabled={saving}
              class="px-4 py-2 text-sm font-medium text-white bg-[#3a5a40] rounded-md hover:bg-[#2d4530] disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      ) : (
        // Vista de solo lectura
        <div class="space-y-4">
          {activeGoal?.goal_type ? (
            // Mostrar información del objetivo actual
            <div
              class={`p-4 border rounded-md ${
                activeGoal.goal_type === "maintain"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <div
                class={`text-sm ${
                  activeGoal.goal_type === "maintain"
                    ? "text-blue-800"
                    : "text-green-800"
                }`}
              >
                <div class="font-medium text-base mb-3">
                  {activeGoal.goal_type === "maintain"
                    ? "Objetivo: Mantener peso"
                    : "Objetivo: Bajar de peso"}
                </div>

                {activeGoal.goal_type === "maintain" ? (
                  <div class="text-center">
                    <div class="text-2xl font-bold text-blue-700">
                      {activeGoal.target_weight} kg
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
                        {activeGoal.target_weight}
                      </div>
                      <div class="text-xs text-green-600">kg objetivo</div>
                    </div>
                    <div class="text-center">
                      <div class="text-sm font-medium text-green-700">
                        {activeGoal.start_date &&
                          new Date(activeGoal.start_date).toLocaleDateString(
                            "es-ES"
                          )}
                      </div>
                      <div class="text-xs text-green-600">Fecha inicio</div>
                    </div>
                    {activeGoal.end_date && (
                      <div class="text-center">
                        <div class="text-sm font-medium text-green-700">
                          {new Date(activeGoal.end_date).toLocaleDateString(
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
              class="px-4 py-2 text-sm font-medium text-white bg-[#3a5a40] rounded-md hover:bg-[#2d4530]"
            >
              {activeGoal?.goal_type ? "Editar Objetivo" : "Definir Objetivo"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
