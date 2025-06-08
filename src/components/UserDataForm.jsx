import { useLocalStorage } from "../hooks/useLocalStorage";

const defaultData = {
  gender: "male",
  age: 35,
  height: 188,
  weight: 96.5,
  steps: 15000, // Pasos diarios de media
};

export default function UserDataForm() {
  const [userData, setUserData] = useLocalStorage("userData", defaultData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: name === "gender" ? value : parseFloat(value),
    }));
  };

  return (
    <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
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
            value={userData.gender}
            onChange={handleChange}
            class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none sm:text-sm"
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
            value={userData.age}
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
            value={userData.height}
            onChange={handleChange}
            class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label for="weight" class="block text-sm font-medium text-gray-700">
            Peso inicial (kg)
          </label>
          <input
            type="number"
            name="weight"
            id="weight"
            value={userData.weight}
            step="0.1"
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
            value={userData.steps}
            step="500"
            onChange={handleChange}
            class="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
