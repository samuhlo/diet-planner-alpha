import { useState, useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $user } from "../../stores/authStore";
import {
  getUserProfile,
  updateUserProfile,
  createUserGoal,
} from "../../services/databaseService";
import type { UserProfileUpdate } from "../../types/database";

interface SetupData {
  // Paso 1: Datos básicos
  weight: string;
  height: string;
  age: string;
  gender: "male" | "female" | "other";

  // Paso 2: Actividad
  steps: string;
  doesStrengthTraining: boolean;
  strengthTrainingDays: number;

  // Paso 3: Objetivo
  goalType: "lose" | "gain" | "maintain";
  targetWeight: string;
  startDate: string;
  endDate: string;
}

const defaultData: SetupData = {
  weight: "",
  height: "",
  age: "",
  gender: "male",
  steps: "15000",
  doesStrengthTraining: false,
  strengthTrainingDays: 0,
  goalType: "maintain",
  targetWeight: "",
  startDate: "",
  endDate: "",
};

export default function SetupFlow() {
  const user = useStore($user);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SetupData>(defaultData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Redireccionar si no hay usuario
  useEffect(() => {
    if (!user) {
      window.location.href = "/welcome";
    }
  }, [user]);

  const updateFormData = (field: keyof SetupData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.weight &&
          formData.height &&
          formData.age &&
          formData.gender
        );
      case 2:
        return !!formData.steps;
      case 3:
        if (formData.goalType === "maintain") {
          return true; // Solo necesita el tipo para mantener peso
        }
        return !!(
          formData.targetWeight &&
          formData.startDate &&
          formData.endDate
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      setMessage({
        type: "error",
        text: "Por favor, completa todos los campos requeridos.",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setMessage(null);
  };

  const saveData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setMessage(null);

      // Preparar datos de perfil
      const profileData: UserProfileUpdate = {
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
        gender: formData.gender === "other" ? "male" : formData.gender,
        steps: parseInt(formData.steps),
        does_strength_training: formData.doesStrengthTraining,
        strength_training_days: formData.strengthTrainingDays,
      };

      // Actualizar perfil
      await updateUserProfile(user.id, profileData);

      // Crear objetivo si no es mantener peso o si tiene datos específicos
      if (formData.goalType !== "maintain" || formData.targetWeight) {
        const goalData = {
          user_id: user.id,
          goal_type: formData.goalType,
          target_weight: formData.targetWeight
            ? parseFloat(formData.targetWeight)
            : parseFloat(formData.weight),
          start_date:
            formData.startDate || new Date().toISOString().split("T")[0],
          end_date: formData.endDate || undefined,
        };

        await createUserGoal(goalData);
      }

      // Redireccionar a la aplicación principal
      window.location.href = "/";
    } catch (error) {
      console.error("Error guardando datos:", error);
      setMessage({
        type: "error",
        text: "Error al guardar los datos. Inténtalo de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div class="max-w-2xl mx-auto">
      {/* Barra de progreso */}
      <div class="mb-8">
        <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Paso {currentStep} de 3</span>
          <span>{Math.round(progressPercentage)}% completado</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-gradient-to-r from-[#3a5a40] to-[#2d4530] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Contenido del paso */}
      <div class="bg-white rounded-2xl shadow-lg p-8">
        {/* Mensaje de estado */}
        {message && (
          <div
            class={`mb-6 p-4 rounded-lg ${
              message.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Paso 1: Datos Básicos */}
        {currentStep === 1 && (
          <div class="space-y-6">
            <div class="text-center space-y-2">
              <h2 class="text-2xl font-bold text-gray-900">Datos Básicos</h2>
              <p class="text-gray-600">
                Necesitamos conocerte para personalizar tu plan
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onInput={(e) =>
                    updateFormData(
                      "weight",
                      (e.target as HTMLInputElement).value
                    )
                  }
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                  placeholder="70.0"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Altura (cm) *
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onInput={(e) =>
                    updateFormData(
                      "height",
                      (e.target as HTMLInputElement).value
                    )
                  }
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                  placeholder="170"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Edad (años) *
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onInput={(e) =>
                    updateFormData("age", (e.target as HTMLInputElement).value)
                  }
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                  placeholder="30"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    updateFormData(
                      "gender",
                      (e.target as HTMLSelectElement).value
                    )
                  }
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Actividad */}
        {currentStep === 2 && (
          <div class="space-y-6">
            <div class="text-center space-y-2">
              <h2 class="text-2xl font-bold text-gray-900">
                Nivel de Actividad
              </h2>
              <p class="text-gray-600">
                Esto nos ayuda a calcular tus necesidades calóricas
              </p>
            </div>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Pasos diarios promedio *
                </label>
                <select
                  value={formData.steps}
                  onChange={(e) =>
                    updateFormData(
                      "steps",
                      (e.target as HTMLSelectElement).value
                    )
                  }
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                >
                  <option value="5000">Menos de 5,000 - Sedentario</option>
                  <option value="10000">
                    5,000 - 10,000 - Ligeramente activo
                  </option>
                  <option value="15000">
                    10,000 - 15,000 - Moderadamente activo
                  </option>
                  <option value="20000">Más de 15,000 - Muy activo</option>
                </select>
              </div>

              <div class="space-y-4">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="strengthTraining"
                    checked={formData.doesStrengthTraining}
                    onChange={(e) => {
                      const isChecked = (e.target as HTMLInputElement).checked;
                      updateFormData("doesStrengthTraining", isChecked);
                      if (!isChecked) {
                        updateFormData("strengthTrainingDays", 0);
                      }
                    }}
                    class="h-4 w-4 text-[#3a5a40] border-gray-300 rounded"
                  />
                  <label
                    for="strengthTraining"
                    class="ml-2 block text-sm font-medium text-gray-700"
                  >
                    ¿Haces entrenamiento de fuerza/pesas?
                  </label>
                </div>

                {formData.doesStrengthTraining && (
                  <div class="ml-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Días por semana
                    </label>
                    <select
                      value={formData.strengthTrainingDays}
                      onChange={(e) =>
                        updateFormData(
                          "strengthTrainingDays",
                          parseInt((e.target as HTMLSelectElement).value)
                        )
                      }
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                    >
                      <option value={1}>1 día</option>
                      <option value={2}>2 días</option>
                      <option value={3}>3 días</option>
                      <option value={4}>4 o más días</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Objetivo */}
        {currentStep === 3 && (
          <div class="space-y-6">
            <div class="text-center space-y-2">
              <h2 class="text-2xl font-bold text-gray-900">Tu Objetivo</h2>
              <p class="text-gray-600">
                Define qué quieres lograr con tu plan alimentario
              </p>
            </div>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-4">
                  ¿Cuál es tu objetivo principal? *
                </label>
                <div class="space-y-3">
                  <label class="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="goalType"
                      value="maintain"
                      checked={formData.goalType === "maintain"}
                      onChange={(e) => {
                        updateFormData(
                          "goalType",
                          (e.target as HTMLInputElement).value
                        );
                        updateFormData("targetWeight", formData.weight);
                      }}
                      class="h-4 w-4 text-[#3a5a40] border-gray-300"
                    />
                    <div class="ml-3">
                      <div class="font-medium text-gray-900">
                        Mantener mi peso actual
                      </div>
                      <div class="text-sm text-gray-600">
                        Planificador de comidas saludables
                      </div>
                    </div>
                  </label>

                  <label class="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="goalType"
                      value="lose"
                      checked={formData.goalType === "lose"}
                      onChange={(e) =>
                        updateFormData(
                          "goalType",
                          (e.target as HTMLInputElement).value
                        )
                      }
                      class="h-4 w-4 text-[#3a5a40] border-gray-300"
                    />
                    <div class="ml-3">
                      <div class="font-medium text-gray-900">Perder peso</div>
                      <div class="text-sm text-gray-600">
                        Plan con déficit calórico controlado
                      </div>
                    </div>
                  </label>

                  <label class="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="goalType"
                      value="gain"
                      checked={formData.goalType === "gain"}
                      onChange={(e) =>
                        updateFormData(
                          "goalType",
                          (e.target as HTMLInputElement).value
                        )
                      }
                      class="h-4 w-4 text-[#3a5a40] border-gray-300"
                    />
                    <div class="ml-3">
                      <div class="font-medium text-gray-900">Ganar peso</div>
                      <div class="text-sm text-gray-600">
                        Plan con superávit calórico controlado
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.goalType !== "maintain" && (
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Peso objetivo (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.targetWeight}
                      onInput={(e) =>
                        updateFormData(
                          "targetWeight",
                          (e.target as HTMLInputElement).value
                        )
                      }
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                      placeholder="65.0"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Fecha inicio *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onInput={(e) =>
                        updateFormData(
                          "startDate",
                          (e.target as HTMLInputElement).value
                        )
                      }
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Fecha objetivo *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onInput={(e) =>
                        updateFormData(
                          "endDate",
                          (e.target as HTMLInputElement).value
                        )
                      }
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            class="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              class="px-6 py-2 bg-[#3a5a40] text-white rounded-lg hover:bg-[#2d4530] transition-colors"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={saveData}
              disabled={loading || !validateStep(3)}
              class="px-8 py-2 bg-gradient-to-r from-[#3a5a40] to-[#2d4530] text-white rounded-lg hover:from-[#2d4530] hover:to-[#1f2f20] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
            >
              {loading ? "Guardando..." : "Completar Configuración"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
