// src/components/InteractivePlanner.jsx
import { useMemo } from "preact/hooks";

export default function InteractivePlanner({ allMeals, plan, onPlanChange }) {
  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const mealTypes = ["desayuno", "almuerzo", "cena"];

  // Agrupamos las comidas por tipo una sola vez para optimizar
  const mealsByType = useMemo(() => {
    return {
      desayuno: allMeals.filter((m) => m.tags.includes("desayuno")),
      almuerzo: allMeals.filter((m) => m.tags.includes("almuerzo")),
      cena: allMeals.filter((m) => m.tags.includes("cena")),
    };
  }, [allMeals]);

  const handlePlanChange = (day, mealType, field, value) => {
    const key = `${day.toLowerCase()}-${mealType}`;
    onPlanChange((prevPlan) => ({
      ...prevPlan,
      [key]: {
        ...prevPlan[key],
        [field]: value,
      },
    }));
  };

  return (
    <div id="weekly-planner" class="space-y-6">
      {days.map((day) => {
        const dayId = day.toLowerCase();
        // Calculamos el total diario basándonos en el estado 'plan'
        let dailyTotals = { cals: 0, p: 0, c: 0, f: 0 };
        mealTypes.forEach((mealType) => {
          const key = `${dayId}-${mealType}`;
          const plannedMeal = plan[key];
          if (plannedMeal?.recipeName) {
            const mealData = allMeals.find(
              (m) => m.nombre === plannedMeal.recipeName
            );
            if (mealData) {
              dailyTotals.cals += mealData.calorias;
              dailyTotals.p += mealData.p;
              dailyTotals.c += mealData.c;
              dailyTotals.f += mealData.f;
            }
          }
        });

        return (
          <div key={dayId} class="bg-white p-4 rounded-lg shadow-md">
            <h3 class="text-xl font-bold mb-4 text-center md:text-left text-[#6B8A7A]">
              {day}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mealTypes.map((mealType) => {
                const mealId = `${dayId}-${mealType}`;
                const options = mealsByType[mealType];
                return (
                  <div key={mealId} class="meal-slot">
                    <div class="flex justify-between items-center mb-1">
                      <label
                        for={mealId}
                        class="block text-sm font-medium text-stone-700 capitalize"
                      >
                        {mealType}
                      </label>
                      <div class="flex items-center space-x-1">
                        <label
                          for={`diner-${mealId}`}
                          class="text-xs text-stone-500"
                        >
                          Nº:
                        </label>
                        <input
                          type="number"
                          id={`diner-${mealId}`}
                          class="diners-input w-12 text-center border-gray-300 rounded-md text-sm p-1"
                          value={plan[mealId]?.diners || 1}
                          min="1"
                          onChange={(e) =>
                            handlePlanChange(
                              day,
                              mealType,
                              "diners",
                              parseInt(e.currentTarget.value, 10)
                            )
                          }
                        />
                      </div>
                    </div>
                    <select
                      id={mealId}
                      class="meal-select block w-full text-base border-gray-300 rounded-md"
                      value={plan[mealId]?.recipeName || ""}
                      onChange={(e) =>
                        handlePlanChange(
                          day,
                          mealType,
                          "recipeName",
                          e.currentTarget.value
                        )
                      }
                    >
                      <option value="">Selecciona...</option>
                      {options.map((meal) => (
                        <option key={meal.nombre} value={meal.nombre}>
                          {meal.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
            {dailyTotals.cals > 0 && (
              <div class="daily-summary text-sm text-stone-700 bg-stone-100 p-3 rounded-md mt-4 font-semibold text-center md:text-right">
                <strong>Total Diario (1p):</strong> {dailyTotals.cals} kcal |{" "}
                <strong>P:</strong> {dailyTotals.p}g, <strong>C:</strong>{" "}
                {dailyTotals.c}g, <strong>F:</strong> {dailyTotals.f}g
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
