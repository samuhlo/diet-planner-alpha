// src/components/UserDataForm.jsx
import { useStore } from "@nanostores/preact";
import { $userData, setUserData } from "../stores/userProfileStore.ts";
import { useState, useEffect } from "preact/hooks";

// Valores por defecto para el formulario si no hay nada en el estado global
const formDefaults = {
  gender: "male",
  age: 30,
  height: 170,
  weight: 70,
  steps: 5000,
};

export default function UserDataForm() {
  const globalUserData = useStore($userData);

  // El estado local se inicializa con los datos globales si existen, o con los defaults si no.
  const [formData, setFormData] = useState(globalUserData || formDefaults);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Si los datos globales se cargan después (desde localStorage), actualizamos el form.
    setFormData(globalUserData || formDefaults);
  }, [globalUserData]);

  const handleChange = (e) => {
    setIsSaved(false);
    const { name, value } = e.target;
    const parsedValue = name === "gender" ? value : parseFloat(value) || 0;
    setFormData((prevData) => ({ ...prevData, [name]: parsedValue }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUserData(formData); // Guardamos el estado del formulario en la store global
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
        {/* Campos para age, height, weight, y steps usando formData y handleChange */}
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
