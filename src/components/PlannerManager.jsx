// src/components/PlannerManager.jsx
import { useState } from "preact/hooks";
import InteractivePlanner from "./InteractivePlanner"; // Importamos el planificador

export default function PlannerManager({ allMeals }) {
  // 1. EL ESTADO VIVE AQUÍ AHORA
  // El estado del plan y los comensales se gestiona en el componente padre.
  const [plan, setPlan] = useState({});

  // 2. LÓGICA DE LOS BOTONES Y MODALES
  // (Añadiremos los modales en el siguiente paso)
  const generateShoppingList = () => {
    console.log("Generando lista para este plan:", plan);
    // Aquí irá la lógica para abrir el modal de la lista de la compra

    alert("Lógica de la lista de la compra pendiente.");
  };

  const analyzeWeek = () => {
    console.log("Analizando este plan:", plan);
    // Aquí irá la lógica para abrir el modal de análisis
    alert("Lógica del análisis pendiente.");
  };

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

      {/* 3. PASAMOS EL ESTADO Y LA FUNCIÓN PARA ACTUALIZARLO AL HIJO */}
      <InteractivePlanner
        allMeals={allMeals}
        plan={plan} // Prop: El estado actual (lectura)
        onPlanChange={setPlan} // Prop: La función para cambiar el estado (escritura)
      />

      {/* Aquí renderizaremos los modales más adelante */}
    </div>
  );
}
