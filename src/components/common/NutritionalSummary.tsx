import type { VNode } from "preact";
import { useStore } from "@nanostores/preact";
import { $userData, $userGoal } from "../../stores/userProfileStore.ts";
import { useNutritionalCalculations } from "../../hooks/useNutritionalCalculations";

interface SummaryItem {
  label: string;
  value: number;
  unit: string;
  color: string;
  description: string;
}

const NutritionalSummary = (): VNode | null => {
  const userData = useStore($userData);
  const userGoal = useStore($userGoal);

  const {
    bmr,
    tdee,
    proteinFactor,
    proteinGoal,
    calorieGoal,
    carbGoal,
    fatGoal,
  } = useNutritionalCalculations(userData, userGoal);

  if (!userData) return null;

  const summaryItems: SummaryItem[] = [
    {
      label: "Metabolismo Basal (BMR)",
      value: bmr,
      unit: "kcal/día",
      color: "text-blue-600",
      description: `Calorías en reposo`,
    },
    {
      label: "Gasto Energético (TDEE)",
      value: tdee,
      unit: "kcal/día",
      color: "text-green-600",
      description: "Incluye actividad física",
    },
    {
      label: "Objetivo Calórico",
      value: calorieGoal,
      unit: "kcal/día",
      color: "text-purple-600",
      description:
        calorieGoal < tdee
          ? `Déficit de ${tdee - calorieGoal} kcal`
          : "Mantenimiento",
    },
    {
      label: "Proteínas",
      value: proteinGoal,
      unit: "g/día",
      color: "text-amber-600",
      description: `${proteinFactor.toFixed(1)} g/kg de peso`,
    },
    {
      label: "Carbohidratos",
      value: carbGoal,
      unit: "g/día",
      color: "text-orange-600",
      description: "Calorías restantes",
    },
    {
      label: "Grasas",
      value: fatGoal,
      unit: "g/día",
      color: "text-red-600",
      description: "25% de calorías",
    },
    {
      label: "Objetivo de Peso",
      value: userGoal?.targetWeight || userData.weight,
      unit: "kg",
      color: "text-rose-600",
      description: userGoal?.targetWeight
        ? `Meta para ${new Date(userGoal.endDate).toLocaleDateString()}`
        : "Sin meta definida",
    },
  ];

  return (
    <div class="bg-white p-4 rounded-lg shadow-md mb-8">
      <div class="flex flex-wrap justify-around items-start gap-x-6 gap-y-4 text-center">
        {summaryItems.map((item) => (
          <div key={item.label}>
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {item.label}
            </h3>
            <p class={`text-xl font-bold ${item.color}`}>
              {item.value}{" "}
              <span class="text-base font-normal">{item.unit}</span>
            </p>
            <p class="text-xs text-gray-500 mt-1">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionalSummary;
