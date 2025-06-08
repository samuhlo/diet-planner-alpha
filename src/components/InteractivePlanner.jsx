import { useMemo } from "preact/hooks";

export default function InteractivePlanner({
  allMeals,
  plan,
  onPlanChange,
  targetCalories,
}) {
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
  const mealsByType = useMemo(
    () => ({
      desayuno: allMeals.filter((m) => m.tags.includes("desayuno")),
      almuerzo: allMeals.filter((m) => m.tags.includes("almuerzo")),
      cena: allMeals.filter((m) => m.tags.includes("cena")),
    }),
    [allMeals]
  );

  const handlePlanChange = (day, mealType, field, value) => {
    const key = `${day.toLowerCase()}-${mealType}`;
    onPlanChange((prevPlan) => ({
      ...prevPlan,
      [key]: { ...prevPlan[key], [field]: value },
    }));
  };

  // FUNCIÓN PARA GENERAR EL MENSAJE DE ESTADO DIARIO
  const getDailyStatus = (dailyCals) => {
    if (dailyCals === 0) return null;

    const lowerBound = targetCalories - 100;
    const upperBound = targetCalories + 100;
    const minCalories = 1200;

    if (dailyCals < minCalories) {
      return {
        text: `Cuidado: ${dailyCals} kcal es un consumo muy bajo para ser saludable.`,
        className: "bg-orange-100 text-orange-800",
      };
    }
    if (dailyCals > upperBound) {
      return {
        text: `Aviso: Has superado tu objetivo de ${targetCalories} kcal.`,
        className: "bg-yellow-100 text-yellow-800",
      };
    }
    if (
      dailyCals >= lowerBound ||
      (dailyCals >= minCalories && dailyCals <= upperBound)
    ) {
      return {
        text: `¡Correcto! Estás dentro de tu objetivo de ${targetCalories} kcal.`,
        className: "bg-green-100 text-green-800",
      };
    }
    return null;
  };

  // CÁLCULO DEL RESUMEN SEMANAL ---
  const weeklySummary = useMemo(() => {
    let totalCals = 0,
      totalP = 0,
      totalC = 0,
      totalF = 0;
    const plannedDays = new Set();

    Object.entries(plan).forEach(([key, plannedMeal]) => {
      if (plannedMeal?.recipeName) {
        const mealData = allMeals.find(
          (m) => m.nombre === plannedMeal.recipeName
        );
        if (mealData) {
          const diners = plannedMeal.diners || 1;
          totalCals += mealData.calorias * diners;
          totalP += mealData.p * diners;
          totalC += mealData.c * diners;
          totalF += mealData.f * diners;
          // Añadimos el día al Set para contarlo solo una vez
          plannedDays.add(key.split("-")[0]);
        }
      }
    });
    const weeklyTargetCals = targetCalories * 7;
    const deviation = totalCals - weeklyTargetCals;

    // LÓGICA DE ALERTA
    let alert = null;
    const numberOfPlannedDays = plannedDays.size;
    if (numberOfPlannedDays > 0) {
      const averageDailyCals = totalCals / numberOfPlannedDays;
      if (averageDailyCals < 1200) {
        alert = {
          type: "warning",
          text: `Cuidado: Un promedio de ${Math.round(
            averageDailyCals
          )} kcal diarias es muy bajo y puede ser perjudicial para tu salud a largo plazo.`,
        };
      }
    }

    return {
      totalCals,
      totalP,
      totalC,
      totalF,
      deviation,
      weeklyTargetCals,
      alert,
    };
  }, [plan, targetCalories]);

  return (
    <div id="weekly-planner-container">
      <div class="space-y-6">
        {days.map((day) => {
          // ... El mapeo de los días y su lógica interna no cambian ...
          // ... (código idéntico al de la lección anterior) ...
          const dayId = day.toLowerCase();
          let dailyTotals = { cals: 0, p: 0, c: 0, f: 0 };
          mealTypes.forEach((mealType) => {
            const plannedMeal = plan[`${dayId}-${mealType}`];
            if (plannedMeal?.recipeName) {
              const mealData = allMeals.find(
                (m) => m.nombre === plannedMeal.recipeName
              );
              if (mealData) {
                // Nota: El total diario sigue siendo para 1 comensal para simplicidad del feedback diario
                dailyTotals.cals += mealData.calorias;
                dailyTotals.p += mealData.p;
                dailyTotals.c += mealData.c;
                dailyTotals.f += mealData.f;
              }
            }
          });
          const dailyStatus = getDailyStatus(dailyTotals.cals);
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
                            class="w-12 text-center border-gray-300 rounded-md text-sm p-1"
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
                        class="block w-full text-base border-gray-300 rounded-md"
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
                <div class="text-sm text-stone-700 bg-stone-100 p-3 rounded-md mt-4 font-semibold text-center md:text-right">
                  <strong>Total Diario (1p):</strong> {dailyTotals.cals} kcal |{" "}
                  <strong>P:</strong> {dailyTotals.p}g, <strong>C:</strong>{" "}
                  {dailyTotals.c}g, <strong>F:</strong> {dailyTotals.f}g
                </div>
              )}
              {dailyStatus && (
                <div
                  class={`p-3 mt-4 rounded-lg text-center font-semibold text-sm ${dailyStatus.className}`}
                >
                  {dailyStatus.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BLOQUE DE RESUMEN SEMANAL */}
      {weeklySummary.totalCals > 0 && (
        <div class="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h3 class="text-2xl font-bold text-center mb-4 text-[#3a5a40]">
            Resumen Total de la Semana
          </h3>
          <div class="text-center text-lg text-stone-700 space-y-2">
            <p>
              <strong>Calorías Totales:</strong> {weeklySummary.totalCals} kcal
              /{" "}
              <span class="text-stone-500">
                {weeklySummary.weeklyTargetCals} kcal (Objetivo)
              </span>
            </p>
            <p>
              <strong>Desviación del Objetivo:</strong>{" "}
              <span
                class={`font-bold ${
                  weeklySummary.deviation > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {weeklySummary.deviation > 0 ? "+" : ""}
                {weeklySummary.deviation} kcal
              </span>
            </p>
            <p class="text-sm text-stone-500 pt-2">
              <strong>Otros Nutrientes (Total):</strong> Proteínas:{" "}
              {weeklySummary.totalP}g, Carbs: {weeklySummary.totalC}g, Grasas:{" "}
              {weeklySummary.totalF}g
            </p>
          </div>

          {/* ALERTA SEMANAL */}
          {weeklySummary.alert && (
            <div
              class={`p-4 mt-4 rounded-lg text-center font-bold ${
                weeklySummary.alert.type === "warning"
                  ? "bg-orange-100 text-orange-800"
                  : ""
              }`}
            >
              <p>{weeklySummary.alert.text}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
