import { useState, useMemo } from "preact/hooks";
import InteractivePlanner from "./InteractivePlanner";
import Modal from "./Modal"; // Importamos nuestro nuevo componente

const getFromStorage = (key, defaultValue) => {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

export default function PlannerManager({ allMeals }) {
  const [plan, setPlan] = useState({});
  // ESTADO PARA EL MODAL ACTIVO
  // 'null' -> ninguno, 'shopping' -> lista compra, 'analysis' -> análisis
  const [activeModal, setActiveModal] = useState(null);
  // Estado para guardar el contenido calculado del modal
  const [modalContent, setModalContent] = useState(null);

  // --- LÓGICA PARA EL CÁLCULO DEL OBJETIVO CALÓRICO ---
  const calorieGoal = useMemo(() => {
    const userData = getFromStorage("userData", {
      weight: 96,
      height: 180,
      age: 35,
      gender: "male",
      steps: 7500,
    });
    const goalData = getFromStorage("userGoal", { startDate: "", endDate: "" });

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
        const dailyDeficit = Math.round((weightToLose * 7700) / durationInDays);
        return tdee - dailyDeficit;
      }
    }
    return tdee - 500;
  }, []); // Se calcula una vez cuando el componente se monta.

  // --- LÓGICA PARA LA LISTA DE LA COMPRA ---
  const generateShoppingList = () => {
    const shoppingList = {};
    Object.values(plan).forEach((plannedMeal) => {
      if (!plannedMeal.recipeName) return;
      const mealData = allMeals.find(
        (m) => m.nombre === plannedMeal.recipeName
      );
      const diners = plannedMeal.diners || 1;
      if (mealData?.ingredientes) {
        mealData.ingredientes.forEach((ing) => {
          const key = `${ing.n.toLowerCase()}_${ing.u.toLowerCase()}`;
          if (!shoppingList[key]) {
            shoppingList[key] = { ...ing, q: 0 };
          }
          shoppingList[key].q += ing.q * diners;
        });
      }
    });
    const aggregated = Object.values(shoppingList);
    setModalContent(aggregated);
    setActiveModal("shopping");
  };

  // --- LÓGICA PARA EL ANÁLISIS SEMANAL (usando datos del usuario, guardados en el localStorage) ---
  const analyzeWeek = () => {
    // Leemos directamente de localStorage. Si no hay nada, usamos valores por defecto.
    const userData = JSON.parse(localStorage.getItem("userData")) || {
      weight: 96,
      height: 180,
      age: 35,
      gender: "male",
      steps: 7500,
    };

    // Convertimos los pasos a un factor de actividad
    let activityFactor = 1.2; // Sedentario
    if (userData.steps >= 10000) activityFactor = 1.725; // Activo
    else if (userData.steps >= 7500) activityFactor = 1.55; // Moderado
    else if (userData.steps >= 5000) activityFactor = 1.375; // Ligero

    const bmr =
      userData.gender === "male"
        ? 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5
        : 10 * userData.weight +
          6.25 * userData.height -
          5 * userData.age -
          161;

    const tdee = Math.round(bmr * activityFactor);
    const targetCals = tdee - 500;

    // El resto de la función (cálculo de calorías del plan) permanece igual
    let totalCals = 0;
    const daysPlanned = new Set();
    Object.entries(plan).forEach(([key, plannedMeal]) => {
      if (plannedMeal.recipeName) {
        const meal = allMeals.find((m) => m.nombre === plannedMeal.recipeName);
        if (meal) {
          totalCals += meal.calorias;
          daysPlanned.add(key.split("-")[0]);
        }
      }
    });

    const numDays = daysPlanned.size;
    const avgCals = numDays > 0 ? Math.round(totalCals / numDays) : 0;
    const analysisData = { tdee, targetCals, numDays, avgCals };
    setModalContent(analysisData);
    setActiveModal("analysis");
  };

  // --- CERRAR MODAL ---
  const closeModal = () => setActiveModal(null);

  // --- RENDERIZADO ---
  return (
    <div>
      <div class="text-center mb-8 flex flex-wrap justify-center items-center gap-4">
        <button
          onClick={generateShoppingList}
          class="bg-[#3a5a40] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#2c4230] transition shadow-lg"
        >
          🛒 Generar Lista de la Compra
        </button>
        <button
          onClick={analyzeWeek}
          class="bg-[#6B8A7A] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#597465] transition shadow-lg"
        >
          📊 Analizar Semana
        </button>
      </div>
      <InteractivePlanner
        allMeals={allMeals}
        plan={plan}
        onPlanChange={setPlan}
        targetCalories={calorieGoal}
      />
      <Modal
        isOpen={activeModal === "shopping"}
        onClose={closeModal}
        title="Lista de la Compra Semanal"
      >
        {modalContent?.length > 0 ? (
          <ul class="list-disc list-inside space-y-2">
            {modalContent.map((ing) => {
              let unitText = ing.u;
              let quantity = Number(ing.q.toPrecision(3));
              if (
                quantity > 1 &&
                !unitText.endsWith("s") &&
                !["g", "ml", "kg"].includes(unitText)
              ) {
                unitText = unitText.endsWith("z")
                  ? unitText.slice(0, -1) + "ces"
                  : unitText + "s";
              }
              return (
                <li key={ing.n} class="text-stone-700">
                  {quantity} {unitText} de {ing.n}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No has seleccionado ninguna receta todavía.</p>
        )}
      </Modal>
      <Modal
        isOpen={activeModal === "analysis"}
        onClose={closeModal}
        title="Análisis Nutricional Semanal"
      >
        {modalContent && (
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
    </div>
  );
}
