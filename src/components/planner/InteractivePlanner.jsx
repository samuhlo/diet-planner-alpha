import { useMemo } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $plan, updatePlanEntry } from "../../stores/planStore";

export default function InteractivePlanner({
  allMeals,
  allSupplements,
  targetCalories,
  targetProtein,
}) {
  const plan = useStore($plan);
  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const mealTypes = ["Desayuno", "Almuerzo", "Cena"];
  const mealsByType = useMemo(
    () => ({
      Desayuno: allMeals.filter((m) => m.tags.includes("Desayuno")),
      Almuerzo: allMeals.filter((m) => m.tags.includes("Almuerzo")),
      Cena: allMeals.filter((m) => m.tags.includes("Cena")),
    }),
    [allMeals]
  );

  const handlePlanChange = (dayId, section, field, value) => {
    updatePlanEntry(dayId, section, field, value);
  };

  // FUNCIÓN PARA GENERAR EL MENSAJE DE ESTADO DIARIO
  const getDailyStatus = (dailyCals) => {
    if (dailyCals === 0) return null;
    const lowerBound = targetCalories - 100;
    const upperBound = targetCalories + 100;
    const minCalories = 1200;
    if (dailyCals < minCalories)
      return {
        text: `Cuidado: ${dailyCals} kcal es un consumo muy bajo.`,
        className: "bg-orange-100 text-orange-800",
      };
    if (dailyCals > upperBound)
      return {
        text: `Aviso: Has superado tu objetivo de ${targetCalories} kcal.`,
        className: "bg-yellow-100 text-yellow-800",
      };
    if (dailyCals >= lowerBound || dailyCals >= minCalories)
      return {
        text: `¡Correcto! Estás dentro de tu objetivo.`,
        className: "bg-green-100 text-green-800",
      };
    return null;
  };
  const getProteinStatus = (dailyProtein) => {
    if (dailyProtein === 0) return null;
    const lowerBound = targetProtein * 0.8;
    const upperBound = targetProtein * 1.5;
    if (dailyProtein < lowerBound)
      return {
        text: `Proteína baja. Objetivo: ${targetProtein}g.`,
        className: "bg-yellow-100 text-yellow-800",
      };
    if (dailyProtein > upperBound)
      return {
        text: `Proteína alta. Objetivo: ${targetProtein}g.`,
        className: "bg-orange-100 text-orange-800",
      };
    return {
      text: `Proteína correcta. Objetivo: ${targetProtein}g.`,
      className: "bg-green-100 text-green-800",
    };
  };

  // CÁLCULO DEL RESUMEN SEMANAL ---
  const weeklySummary = useMemo(() => {
    let totalCals = 0,
      totalP = 0,
      totalC = 0,
      totalF = 0;
    const plannedDays = new Set();

    Object.entries(plan).forEach(([dayId, dailyPlan]) => {
      let dayHasContent = false;
      // Sumamos comidas
      mealTypes.forEach((mealType) => {
        const mealInfo = dailyPlan[mealType];
        if (mealInfo?.recipeName) {
          const mealData = allMeals.find(
            (m) => m.nombre === mealInfo.recipeName
          );
          if (mealData) {
            const diners = mealInfo.diners || 1;
            totalCals += mealData.calorias * diners;
            totalP += mealData.p * diners;
            totalC += mealData.c * diners;
            totalF += mealData.f * diners;
            dayHasContent = true;
          }
        }
      });
      // Sumamos suplementos
      const suppInfo = dailyPlan.supplement;
      if (suppInfo?.shakes > 0) {
        const suppData = allSupplements.find((s) => s.id === suppInfo.type);
        if (suppData) {
          totalCals += suppInfo.shakes * suppData.calories;
          totalP += suppInfo.shakes * suppData.protein;
          dayHasContent = true;
        }
      }
      if (dayHasContent) plannedDays.add(dayId);
    });

    const weeklyTargetCals = targetCalories * 7;
    const deviation = totalCals - weeklyTargetCals;
    let alert = null;
    const numberOfPlannedDays = plannedDays.size;
    if (numberOfPlannedDays > 0) {
      const averageDailyCals = totalCals / numberOfPlannedDays;
      if (averageDailyCals < 1200) {
        alert = {
          type: "warning",
          text: `Cuidado: Un promedio de ${Math.round(
            averageDailyCals
          )} kcal diarias es muy bajo.`,
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
  }, [plan, targetCalories, allSupplements]);

  return (
    <div id="weekly-planner-container">
      <div class="space-y-6">
        {days.map((day) => {
          const dayId = day.toLowerCase();
          const dailyPlan = plan[dayId] || {};
          let dailyTotals = { cals: 0, p: 0, c: 0, f: 0 };

          mealTypes.forEach((mealType) => {
            const mealInfo = dailyPlan[mealType];
            if (mealInfo?.recipeName) {
              const mealData = allMeals.find(
                (m) => m.nombre === mealInfo.recipeName
              );
              if (mealData) {
                dailyTotals.cals += mealData.calorias;
                dailyTotals.p += mealData.p;
                dailyTotals.c += mealData.c;
                dailyTotals.f += mealData.f;
              }
            }
          });

          const numShakes = dailyPlan.supplement?.shakes || 0;
          const suppType = dailyPlan.supplement?.type || allSupplements[0].id;
          if (numShakes > 0) {
            const suppData = allSupplements.find((s) => s.id === suppType);
            if (suppData) {
              dailyTotals.cals += numShakes * suppData.calories;
              dailyTotals.p += numShakes * suppData.protein;
            }
          }

          const dailyStatus = getDailyStatus(dailyTotals.cals);
          const proteinStatus = getProteinStatus(dailyTotals.p);

          return (
            <div key={dayId} class="bg-white p-4 rounded-lg shadow-md">
              <h3 class="text-xl font-bold mb-4 text-center md:text-left text-[#6B8A7A]">
                {day}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mealTypes.map((mealType) => (
                  <div key={mealType} class="meal-slot lg:col-span-1">
                    <div class="flex justify-between items-center mb-1">
                      <label class="block text-sm font-medium text-stone-700 capitalize">
                        {mealType}
                      </label>
                      <input
                        type="number"
                        min="1"
                        class="w-12 text-center border-gray-300 rounded-md text-sm p-1"
                        value={dailyPlan[mealType]?.diners || 1}
                        onChange={(e) =>
                          handlePlanChange(
                            dayId,
                            mealType,
                            "diners",
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                      />
                    </div>
                    <select
                      class="block w-full text-base border-gray-300 rounded-md"
                      value={dailyPlan[mealType]?.recipeName || ""}
                      onChange={(e) =>
                        handlePlanChange(
                          dayId,
                          mealType,
                          "recipeName",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Selecciona...</option>
                      {mealsByType[mealType].map((meal) => (
                        <option key={meal.nombre} value={meal.nombre}>
                          {meal.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              {/* --- INICIO: NUEVA SECCIÓN DE SUPLEMENTOS --- */}
              <div class="mt-4 pt-4 border-t">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id={`suplemento-${dayId}`}
                    class="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    checked={numShakes > 0}
                    onChange={(e) =>
                      handlePlanChange(
                        dayId,
                        "supplement",
                        "shakes",
                        e.target.checked ? 1 : 0
                      )
                    }
                  />
                  <label
                    for={`suplemento-${dayId}`}
                    class="ml-2 block text-sm font-medium text-stone-700"
                  >
                    Añadir Suplemento Proteico
                  </label>
                </div>

                {numShakes > 0 && (
                  <div class="mt-3 ml-6 p-3 bg-gray-50 rounded-md grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label class="block text-xs font-medium text-stone-600">
                        Tipo de Suplemento
                      </label>
                      <select
                        class="mt-1 w-full text-sm border-gray-300 rounded-md"
                        value={suppType}
                        onChange={(e) =>
                          handlePlanChange(
                            dayId,
                            "supplement",
                            "type",
                            e.target.value
                          )
                        }
                      >
                        {allSupplements.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-stone-600">
                        Cantidad
                      </label>
                      <div class="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          class="mt-1 w-16 text-center border-gray-300 rounded-md text-sm p-1"
                          value={numShakes}
                          onChange={(e) =>
                            handlePlanChange(
                              dayId,
                              "supplement",
                              "shakes",
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                        />
                        <span class="text-sm text-stone-600">batido(s)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* --- FIN DE LA NUEVA SECCIÓN --- */}
              {dailyTotals.cals > 0 && (
                <div class="daily-summary text-sm text-stone-700 bg-stone-100 p-3 rounded-md mt-4 font-semibold text-center md:text-right">
                  <strong>Total Diario:</strong> {dailyTotals.cals} kcal |{" "}
                  <strong>P:</strong> {dailyTotals.p}g, <strong>C:</strong>{" "}
                  {dailyTotals.c}g, <strong>F:</strong> {dailyTotals.f}g
                </div>
              )}
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {dailyStatus && (
                  <div
                    class={`p-2 rounded-lg text-center font-semibold text-xs ${dailyStatus.className}`}
                  >
                    {dailyStatus.text}
                  </div>
                )}
                {proteinStatus && (
                  <div
                    class={`p-2 rounded-lg text-center font-semibold text-xs ${proteinStatus.className}`}
                  >
                    {proteinStatus.text}
                  </div>
                )}
              </div>
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
