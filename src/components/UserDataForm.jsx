// src/components/UserDataForm.jsx
import { useStore } from "@nanostores/preact";
import { $userData, setUserData } from "../stores/userProfileStore.ts";
import { useState, useEffect } from "preact/hooks";

// Valores por defecto para el formulario si no hay nada en el estado global
const formDefaults = {
  gender: "male",
  age: 35,
  height: 188,
  weight: 96,
  steps: 15000,
  doesStrengthTraining: false,
  strengthTrainingDays: 0,
};

export default function UserDataForm() {
  const globalUserData = useStore($userData);
  const [formData, setFormData] = useState(globalUserData || formDefaults);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(globalUserData || formDefaults);
  }, [globalUserData]);

  const handleChange = (e) => {
    setIsSaved(false);
    const { name, value, type, checked } = e.target;

    const newValue =
      type === "checkbox"
        ? checked
        : type === "number"
        ? parseFloat(value) || 0
        : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
      ...(name === "doesStrengthTraining" &&
        !checked && { strengthTrainingDays: 0 }),
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUserData(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <form
      onSubmit={handleSave}
      class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto"
    >
      <h3 class="text-xl font-bold text-stone-800 mb-4">
        Mis Datos Personales
      </h3>
      <div class="space-y-4">
        <div>
          <label for="gender" class="block text-sm font-medium text-gray-700">
            Género
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm"
          >
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </div>
        <div>
          <label for="age" class="block text-sm font-medium text-gray-700">
            Edad
          </label>
          <input
            type="number"
            name="age"
            id="age"
            value={formData.age}
            onChange={handleChange}
            class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label for="height" class="block text-sm font-medium text-gray-700">
            Altura (cm)
          </label>
          <input
            type="number"
            name="height"
            id="height"
            value={formData.height}
            onChange={handleChange}
            class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label for="weight" class="block text-sm font-medium text-gray-700">
            Peso actual (kg)
          </label>
          <input
            type="number"
            name="weight"
            id="weight"
            step="0.1"
            value={formData.weight}
            onChange={handleChange}
            class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label for="steps" class="block text-sm font-medium text-gray-700">
            Media de pasos diarios
          </label>
          <input
            type="number"
            name="steps"
            id="steps"
            step="500"
            value={formData.steps}
            onChange={handleChange}
            class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
          />
        </div>

        {/* Sección de entrenamiento de fuerza */}
        <div class="pt-4 border-t border-gray-200">
          <div class="flex items-center mb-2">
            <input
              type="checkbox"
              id="doesStrengthTraining"
              name="doesStrengthTraining"
              checked={formData.doesStrengthTraining}
              onChange={handleChange}
              class="h-4 w-4 text-green-600 rounded border-gray-300"
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
              <label
                for="strengthTrainingDays"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                Días de entrenamiento por semana
              </label>
              <select
                id="strengthTrainingDays"
                name="strengthTrainingDays"
                value={formData.strengthTrainingDays || 0}
                onChange={handleChange}
                class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm"
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

      <div class="mt-6 text-right">
        <button
          type="submit"
          class="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
        >
          {isSaved ? "¡Guardado!" : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
