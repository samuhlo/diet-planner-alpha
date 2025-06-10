import { useStore } from "@nanostores/preact";
import { $userData, $userGoal } from "../stores/userProfileStore";
import { useNutritionalCalculations } from "../hooks/useNutritionalCalculations";

const NutritionalSummary = () => {
  const userData = useStore($userData);
  const userGoal = useStore($userGoal);

  const { bmr, tdee, proteinFactor, proteinGoal, calorieGoal } =
    useNutritionalCalculations(userData, userGoal);

  if (!userData) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Resumen Nutricional
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">
            Metabolismo Basal (BMR)
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {bmr} <span className="text-sm font-normal">kcal/día</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Calorías que tu cuerpo quema en reposo
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">
            Gasto Energético Total (TDEE)
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {tdee} <span className="text-sm font-normal">kcal/día</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">Incluye actividad física</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Objetivo Calórico</h3>
          <p className="text-2xl font-bold text-purple-600">
            {calorieGoal}
            <span className="text-sm font-normal">kcal/día</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {calorieGoal < tdee
              ? `Déficit de ${tdee - calorieGoal} kcal/día`
              : calorieGoal > tdee
              ? `Superávit de ${calorieGoal - tdee} kcal/día`
              : "Mantenimiento"}
          </p>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg">
          <h3 className="font-semibold text-amber-800">
            Proteínas Recomendadas
          </h3>
          <p className="text-2xl font-bold text-amber-600">
            {proteinGoal} <span className="text-sm font-normal">g/día</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {proteinFactor.toFixed(1)} g/kg de peso corporal
          </p>
        </div>

        <div className="bg-rose-50 p-4 rounded-lg">
          <h3 className="font-semibold text-rose-800">Objetivo de Peso</h3>
          <p className="text-2xl font-bold text-rose-600">
            {userGoal?.targetWeight || userData.weight}{" "}
            <span className="text-sm font-normal">kg</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {userGoal?.targetWeight
              ? `Meta para ${new Date(userGoal.endDate).toLocaleDateString()}`
              : "No se ha establecido una meta específica"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NutritionalSummary;
