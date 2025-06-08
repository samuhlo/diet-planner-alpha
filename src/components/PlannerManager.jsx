import { useMemo, useState } from "preact/hooks";
import { allSupplements } from "../data/supplements.ts";
import InteractivePlanner from "./InteractivePlanner";
import Modal from "./Modal";

const getFromStorage = (key, defaultValue) => {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

export default function PlannerManager({ allMeals }) {
  const [plan, setPlan] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const { calorieGoal, proteinGoal } = useMemo(() => {
    const userData = getFromStorage("userData", {
      weight: 96,
      height: 180,
      age: 35,
      gender: "male",
      steps: 7500,
    });
    const goalData = getFromStorage("userGoal", {
      startDate: "",
      endDate: "",
      targetWeight: 90,
    });
    const calculatedProteinGoal = Math.round(userData.weight * 1.8);

    let activityFactor = 1.2;
    if (userData.steps >= 10000) activityFactor = 1.725;
    else if (userData.steps >= 7500) activityFactor = 1.55;
    else if (userData.steps >= 5000) activityFactor = 1.375;

    const bmr =
      userData.gender === "male"
        ? 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5
        : 10 * userData.weight +
          6.25 * userData.height -
          5 * userData.age -
          161;

    const tdee = Math.round(bmr * activityFactor);

    if (
      goalData.startDate &&
      goalData.endDate &&
      new Date(goalData.startDate) < new Date(goalData.endDate)
    ) {
      const weightToLose = userData.weight - parseFloat(goalData.targetWeight);
      if (weightToLose > 0) {
        const durationInDays =
          (new Date(goalData.endDate) - new Date(goalData.startDate)) /
          (1000 * 60 * 60 * 24);
        if (durationInDays > 0) {
          const dailyDeficit = Math.round(
            (weightToLose * 7700) / durationInDays
          );
          return {
            calorieGoal: tdee - dailyDeficit,
            proteinGoal: calculatedProteinGoal,
          };
        }
      }
    }

    return { calorieGoal: tdee - 500, proteinGoal: calculatedProteinGoal };
  }, []);

  const generateShoppingList = () => {
    const shoppingList = {};
    const mealTypes = ["desayuno", "almuerzo", "cena"];

    Object.values(plan).forEach((dailyPlan) => {
      mealTypes.forEach((mealType) => {
        const mealInfo = dailyPlan[mealType];
        if (mealInfo?.recipeName) {
          const mealData = allMeals.find(
            (m) => m.nombre === mealInfo.recipeName
          );
          const diners = mealInfo.diners || 1;
          if (mealData?.ingredientes) {
            mealData.ingredientes.forEach((ing) => {
              const key = `${ing.n.toLowerCase()}_${ing.u.toLowerCase()}`;
              if (!shoppingList[key]) {
                shoppingList[key] = { ...ing, q: 0 };
              }
              shoppingList[key].q += ing.q * diners;
            });
          }
        }
      });
    });
    const aggregated = Object.values(shoppingList);
    setModalContent(aggregated);
    setActiveModal("shopping");
  };

  const analyzeWeek = () => {
    const userData = getFromStorage("userData", {
      weight: 96,
      height: 180,
      age: 35,
      gender: "male",
      steps: 7500,
    });
    let activityFactor = 1.2;
    if (userData.steps >= 10000) activityFactor = 1.725;
    else if (userData.steps >= 7500) activityFactor = 1.55;
    else if (userData.steps >= 5000) activityFactor = 1.375;
    const bmr =
      userData.gender === "male"
        ? 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5
        : 10 * userData.weight +
          6.25 * userData.height -
          5 * userData.age -
          161;
    const tdee = Math.round(bmr * activityFactor);

    let totalCals = 0;
    const daysPlanned = new Set();
    const mealTypes = ["desayuno", "almuerzo", "cena"];

    Object.entries(plan).forEach(([dayId, dailyPlan]) => {
      let dayHasContent = false;
      mealTypes.forEach((mealType) => {
        const mealInfo = dailyPlan[mealType];
        if (mealInfo?.recipeName) {
          const mealData = allMeals.find(
            (m) => m.nombre === mealInfo.recipeName
          );
          if (mealData) {
            totalCals += mealData.calorias * (mealInfo.diners || 1);
            dayHasContent = true;
          }
        }
      });

      const suppInfo = dailyPlan.supplement;
      if (suppInfo?.shakes > 0) {
        const suppData = allSupplements.find((s) => s.id === suppInfo.type);
        if (suppData) {
          totalCals += suppInfo.shakes * suppData.calories;
          dayHasContent = true;
        }
      }

      if (dayHasContent) {
        daysPlanned.add(dayId);
      }
    });

    const numDays = daysPlanned.size;
    const avgCals = numDays > 0 ? Math.round(totalCals / numDays) : 0;
    const analysisData = { tdee, targetCals: calorieGoal, numDays, avgCals };
    setModalContent(analysisData);
    setActiveModal("analysis");
  };

  const generateWeekSummary = () => {
    const daysOfWeek = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ];
    const mealTypes = ["desayuno", "almuerzo", "cena"];
    const summaryData = daysOfWeek
      .map((day) => {
        const dayId = day.toLowerCase();
        const dailyPlan = plan[dayId] || {};
        const dayMeals = {};
        let hasContent = false;

        mealTypes.forEach((mealType) => {
          const mealInfo = dailyPlan[mealType];
          if (mealInfo?.recipeName) {
            dayMeals[mealType] = mealInfo.recipeName;
            hasContent = true;
          }
        });

        const suppInfo = dailyPlan.supplement;
        if (suppInfo?.shakes > 0) {
          const suppData = allSupplements.find((s) => s.id === suppInfo.type);
          dayMeals.supplement = `${suppInfo.shakes} ${
            suppData ? suppData.name : "batido(s)"
          }`;
          hasContent = true;
        }
        return hasContent ? { day, meals: dayMeals } : null;
      })
      .filter(Boolean);

    setModalContent(summaryData);
    setActiveModal("summary");
  };

  const copySummaryToClipboard = () => {
    const summaryEl = document.getElementById("summary-to-copy");
    if (summaryEl) {
      let textToCopy = "Resumen del Plan Semanal:\n\n";
      summaryEl.querySelectorAll(".day-summary-block").forEach((dayDiv) => {
        const dayTitle = dayDiv.querySelector("h4").innerText;
        textToCopy += `--- ${dayTitle} ---\n`;
        dayDiv.querySelectorAll("li").forEach((li) => {
          textToCopy += `• ${li.innerText}\n`;
        });
        textToCopy += "\n";
      });

      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalContent(null);
    setCopySuccess(false);
  };

  return (
    <div>
      <div class="text-center mb-8 flex flex-wrap justify-center items-center gap-4">
        <button
          onClick={generateShoppingList}
          class="bg-[#3a5a40] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#2c4230] transition shadow-lg"
        >
          🛒 Lista de la Compra
        </button>
        <button
          onClick={analyzeWeek}
          class="bg-[#6B8A7A] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#597465] transition shadow-lg"
        >
          📊 Analizar Semana
        </button>
        <button
          onClick={generateWeekSummary}
          class="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          📋 Ver Resumen
        </button>
      </div>
      <InteractivePlanner
        allMeals={allMeals}
        allSupplements={allSupplements}
        plan={plan}
        onPlanChange={setPlan}
        targetCalories={calorieGoal}
        targetProtein={proteinGoal}
      />

      <Modal
        isOpen={activeModal === "shopping"}
        onClose={closeModal}
        title="Lista de la Compra Semanal"
      >
        {/* CORRECCIÓN: Comprobamos el modal activo antes de intentar renderizar */}
        {activeModal === "shopping" &&
        modalContent &&
        modalContent.length > 0 ? (
          <ul class="list-disc list-inside space-y-2">
            {modalContent.map((ing, index) => (
              <li key={`${ing.n}-${index}`} class="text-stone-700">
                {Number(ing.q.toPrecision(3))} {ing.u} de {ing.n}
              </li>
            ))}
          </ul>
        ) : (
          <p class="text-center italic text-stone-500">
            No has seleccionado ninguna receta todavía.
          </p>
        )}
      </Modal>

      <Modal
        isOpen={activeModal === "analysis"}
        onClose={closeModal}
        title="Análisis Nutricional Semanal"
      >
        {activeModal === "analysis" && modalContent && (
          <div class="space-y-4 text-stone-700">
            <div>
              <h4 class="font-bold text-lg">Tus Necesidades Calóricas:</h4>
              <p>
                Tus necesidades diarias de mantenimiento (TDEE) son de{" "}
                <strong>{modalContent.tdee} kcal</strong>.
              </p>
              <p class="text-green-700 font-semibold">
                Tu objetivo calórico para perder peso es:{" "}
                <strong>{modalContent.targetCals} kcal/día</strong>.
              </p>
            </div>
            <hr />
            <div>
              <h4 class="font-bold text-lg">Tu Planificación:</h4>
              <p>
                Has planificado comidas para{" "}
                <strong>{modalContent.numDays}</strong> días.
              </p>
              <p>
                El consumo medio de tu plan es de{" "}
                <strong>{modalContent.avgCals} kcal/día</strong>.
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={activeModal === "summary"}
        onClose={closeModal}
        title="Resumen del Plan Semanal"
      >
        <div class="flex justify-end mb-4">
          <button
            onClick={copySummaryToClipboard}
            class="bg-gray-200 text-sm text-stone-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            {copySuccess ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
        {/* CORRECCIÓN: Comprobamos el modal activo antes de intentar renderizar */}
        {activeModal === "summary" &&
        modalContent &&
        modalContent.length > 0 ? (
          <div id="summary-to-copy" class="space-y-4">
            {modalContent.map((dayData) => (
              <div key={dayData.day} class="day-summary-block">
                <h4 class="font-bold text-lg text-[#6B8A7A] border-b pb-1 mb-2">
                  {dayData.day}
                </h4>
                {dayData.meals && (
                  <ul class="list-none space-y-1 pl-2 text-stone-700">
                    {dayData.meals.desayuno && (
                      <li>
                        <strong class="font-semibold w-24 inline-block">
                          Desayuno:
                        </strong>{" "}
                        {dayData.meals.desayuno}
                      </li>
                    )}
                    {dayData.meals.almuerzo && (
                      <li>
                        <strong class="font-semibold w-24 inline-block">
                          Almuerzo:
                        </strong>{" "}
                        {dayData.meals.almuerzo}
                      </li>
                    )}
                    {dayData.meals.cena && (
                      <li>
                        <strong class="font-semibold w-24 inline-block">
                          Cena:
                        </strong>{" "}
                        {dayData.meals.cena}
                      </li>
                    )}
                    {dayData.meals.supplement && (
                      <li>
                        <strong class="font-semibold w-24 inline-block">
                          Suplemento:
                        </strong>{" "}
                        {dayData.meals.supplement}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p class="text-center text-stone-500 italic">
            No has planificado ninguna comida todavía.
          </p>
        )}
      </Modal>
    </div>
  );
}
