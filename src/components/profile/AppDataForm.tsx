import { useState, useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $user } from "../../stores/authStore";
import {
  getUserProfile,
  updateUserProfile,
  getActiveUserGoal,
  createUserGoal,
  updateUserGoal,
} from "../../services/databaseService";
import type { UserProfile, UserGoal } from "../../types/database";
import ObjectiveAnalysis from "../progress/ObjectiveAnalysis";
import ProfileGoalForm from "./ProfileGoalForm";

// Necesitamos mantener compatibilidad con las stores locales para el análisis
import {
  $userData,
  setUserData,
  $userGoal,
  updateUserGoal as updateLocalGoal,
} from "../../stores/userProfileStore";

export default function AppDataForm() {
  const user = useStore($user);

  // Estados del formulario
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeGoal, setActiveGoal] = useState<UserGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estados del formulario - usando la estructura actual de la app
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    steps: "",
    doesStrengthTraining: false,
    strengthTrainingDays: 0,
    gender: "male" as "male" | "female" | "other",
    // Datos del objetivo
    goal_type: "maintain" as "lose" | "gain" | "maintain",
    target_weight: "",
    start_date: "",
    end_date: "",
  });

  // Cargar datos del usuario al montar
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const [userProfile, userGoal] = await Promise.all([
          getUserProfile(user.id),
          getActiveUserGoal(user.id),
        ]);

        setProfile(userProfile);
        setActiveGoal(userGoal);

        // Llenar formulario con datos existentes DESDE LA BASE DE DATOS
        if (userProfile) {
          setFormData((prev) => ({
            ...prev,
            weight: userProfile.weight?.toString() || "",
            height: userProfile.height?.toString() || "",
            age: userProfile.age?.toString() || "",
            steps: userProfile.steps?.toString() || "15000",
            doesStrengthTraining: userProfile.does_strength_training || false,
            strengthTrainingDays: userProfile.strength_training_days || 0,
            gender: userProfile.gender || "male",
          }));

          // Sincronizar con store local SOLO para compatibilidad con análisis
          const localUserData = {
            weight: userProfile.weight || 0,
            height: userProfile.height || 0,
            age: userProfile.age || 0,
            steps: userProfile.steps || 15000,
            doesStrengthTraining: userProfile.does_strength_training || false,
            strengthTrainingDays: userProfile.strength_training_days || 0,
            gender:
              userProfile.gender === "other"
                ? "male"
                : userProfile.gender || "male",
          };
          setUserData(localUserData);
        }

        if (userGoal) {
          setFormData((prev) => ({
            ...prev,
            goal_type: userGoal.goal_type || "maintain",
            target_weight: userGoal.target_weight?.toString() || "",
            start_date: userGoal.start_date || "",
            end_date: userGoal.end_date || "",
          }));

          // Sincronizar objetivo con store local
          const localGoal = {
            startDate: userGoal.start_date || "",
            endDate: userGoal.end_date || "",
            targetWeight: userGoal.target_weight || 0,
            goalType:
              userGoal.goal_type === "gain"
                ? "lose"
                : userGoal.goal_type || "maintain",
          };
          updateLocalGoal("startDate", localGoal.startDate);
          updateLocalGoal("endDate", localGoal.endDate);
          updateLocalGoal("targetWeight", localGoal.targetWeight);
          updateLocalGoal("goalType", localGoal.goalType);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setMessage({ type: "error", text: "Error al cargar los datos" });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage(null);

    // Actualizar stores locales en tiempo real para que el análisis se actualice
    const newFormData = { ...formData, [field]: value };

    // Sincronizar datos de usuario
    const localUserData = {
      weight: parseFloat(newFormData.weight) || 0,
      height: parseFloat(newFormData.height) || 0,
      age: parseInt(newFormData.age) || 0,
      steps: parseInt(newFormData.steps) || 15000,
      doesStrengthTraining: newFormData.doesStrengthTraining,
      strengthTrainingDays: newFormData.strengthTrainingDays,
      gender: newFormData.gender === "other" ? "male" : newFormData.gender,
    };
    setUserData(localUserData);

    // Sincronizar objetivo si es un campo de objetivo
    if (
      ["goal_type", "target_weight", "start_date", "end_date"].includes(field)
    ) {
      updateLocalGoal(
        field === "goal_type"
          ? "goalType"
          : field === "target_weight"
          ? "targetWeight"
          : field === "start_date"
          ? "startDate"
          : "endDate",
        field === "target_weight"
          ? parseFloat(value) || 0
          : field === "goal_type" && value === "gain"
          ? "lose"
          : value
      );
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      setMessage(null);

      // Validaciones básicas
      if (
        formData.weight &&
        (parseFloat(formData.weight) <= 0 || parseFloat(formData.weight) > 500)
      ) {
        setMessage({
          type: "error",
          text: "El peso debe estar entre 1 y 500 kg",
        });
        return;
      }

      if (
        formData.height &&
        (parseFloat(formData.height) <= 0 || parseFloat(formData.height) > 300)
      ) {
        setMessage({
          type: "error",
          text: "La altura debe estar entre 1 y 300 cm",
        });
        return;
      }

      if (
        formData.age &&
        (parseInt(formData.age) <= 0 || parseInt(formData.age) > 120)
      ) {
        setMessage({
          type: "error",
          text: "La edad debe estar entre 1 y 120 años",
        });
        return;
      }

      // Actualizar perfil - GUARDAR TODOS LOS DATOS EN LA BASE DE DATOS
      const profileUpdates = {
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        // Campos de actividad esenciales para el funcionamiento
        steps: formData.steps ? parseInt(formData.steps) : undefined,
        does_strength_training: formData.doesStrengthTraining,
        strength_training_days: formData.strengthTrainingDays,
      };

      // Sincronizar con stores locales SOLO para compatibilidad con análisis
      const localUserData = {
        weight: parseFloat(formData.weight) || 0,
        height: parseFloat(formData.height) || 0,
        age: parseInt(formData.age) || 0,
        steps: parseInt(formData.steps) || 15000,
        doesStrengthTraining: formData.doesStrengthTraining,
        strengthTrainingDays: formData.strengthTrainingDays,
        gender: formData.gender === "other" ? "male" : formData.gender, // Ajustar para compatibilidad
      };
      setUserData(localUserData);

      const updatedProfile = await updateUserProfile(user.id, profileUpdates);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      // Actualizar o crear objetivo si hay datos
      if (formData.target_weight || formData.start_date || formData.end_date) {
        const goalData = {
          target_weight: formData.target_weight
            ? parseFloat(formData.target_weight)
            : undefined,
          goal_type: formData.goal_type,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
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
          const localGoal = {
            startDate: updatedGoal.start_date || "",
            endDate: updatedGoal.end_date || "",
            targetWeight: updatedGoal.target_weight || 0,
            goalType:
              updatedGoal.goal_type === "gain"
                ? "lose"
                : updatedGoal.goal_type || "maintain", // Ajustar tipos
          };
          updateLocalGoal("startDate", localGoal.startDate);
          updateLocalGoal("endDate", localGoal.endDate);
          updateLocalGoal("targetWeight", localGoal.targetWeight);
          updateLocalGoal("goalType", localGoal.goalType);
        }
      }

      setMessage({ type: "success", text: "¡Datos guardados correctamente!" });
    } catch (error) {
      console.error("Error al guardar:", error);
      setMessage({ type: "error", text: "Error al guardar los datos" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center py-8">
        <div class="text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
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

      {/* Datos Físicos */}
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Datos Físicos</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onInput={(e) =>
                handleInputChange(
                  "weight",
                  (e.target as HTMLInputElement).value
                )
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
              placeholder="70.5"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Altura (cm)
            </label>
            <input
              type="number"
              value={formData.height}
              onInput={(e) =>
                handleInputChange(
                  "height",
                  (e.target as HTMLInputElement).value
                )
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
              placeholder="175"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Edad
            </label>
            <input
              type="number"
              value={formData.age}
              onInput={(e) =>
                handleInputChange("age", (e.target as HTMLInputElement).value)
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
              placeholder="30"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Media de pasos diarios
            </label>
            <input
              type="number"
              step="500"
              value={formData.steps}
              onInput={(e) =>
                handleInputChange("steps", (e.target as HTMLInputElement).value)
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
              placeholder="15000"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                handleInputChange(
                  "gender",
                  (e.target as HTMLSelectElement).value
                )
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>
        </div>

        {/* Sección de entrenamiento de fuerza */}
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center mb-2">
            <input
              type="checkbox"
              id="doesStrengthTraining"
              checked={formData.doesStrengthTraining}
              onChange={(e) => {
                const isChecked = (e.target as HTMLInputElement).checked;
                setFormData((prev) => ({
                  ...prev,
                  doesStrengthTraining: isChecked,
                  strengthTrainingDays: isChecked
                    ? prev.strengthTrainingDays
                    : 0,
                }));

                // Sincronizar con store local inmediatamente
                const updatedData = {
                  weight: parseFloat(formData.weight) || 0,
                  height: parseFloat(formData.height) || 0,
                  age: parseInt(formData.age) || 0,
                  steps: parseInt(formData.steps) || 15000,
                  doesStrengthTraining: isChecked,
                  strengthTrainingDays: isChecked
                    ? formData.strengthTrainingDays
                    : 0,
                  gender:
                    formData.gender === "other" ? "male" : formData.gender,
                };
                setUserData(updatedData);
              }}
              class="h-4 w-4 text-[#3a5a40] rounded border-gray-300"
            />
            <label
              for="doesStrengthTraining"
              class="ml-2 block text-sm font-medium text-gray-700"
            >
              ¿Haces entrenamiento de fuerza?
            </label>
          </div>

          {formData.doesStrengthTraining && (
            <div class="ml-6 mt-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Días de entrenamiento por semana
              </label>
              <select
                value={formData.strengthTrainingDays}
                onChange={(e) => {
                  const days = parseInt((e.target as HTMLSelectElement).value);
                  setFormData((prev) => ({
                    ...prev,
                    strengthTrainingDays: days,
                  }));

                  // Sincronizar con store local inmediatamente
                  const updatedData = {
                    weight: parseFloat(formData.weight) || 0,
                    height: parseFloat(formData.height) || 0,
                    age: parseInt(formData.age) || 0,
                    steps: parseInt(formData.steps) || 15000,
                    doesStrengthTraining: formData.doesStrengthTraining,
                    strengthTrainingDays: days,
                    gender:
                      formData.gender === "other" ? "male" : formData.gender,
                  };
                  setUserData(updatedData);
                }}
                class="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
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

      {/* Objetivos */}
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Objetivo de Peso
        </h3>
        <ProfileGoalForm />
      </div>

      {/* Análisis del Objetivo */}
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <ObjectiveAnalysis />
      </div>

      {/* Botón de guardar */}
      <div class="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          class="px-6 py-2 bg-[#3a5a40] text-white rounded-md hover:bg-[#2d4530] focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
