// src/components/ProgressChart.jsx
import { useState, useRef, useEffect } from "preact/hooks";
import Chart from "chart.js/auto"; // Importamos la librería

const initialData = [96];
const initialLabels = [
  new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString(
    "es-ES"
  ),
];

export default function ProgressChart() {
  const [weightData, setWeightData] = useState(initialData);
  const [weightLabels, setWeightLabels] = useState(initialLabels);
  const [inputValue, setInputValue] = useState("");

  // HOOK: useRef
  // Lo usamos para tener una referencia directa al elemento <canvas> del DOM.
  const canvasRef = useRef(null);
  // También lo usamos para guardar la instancia del gráfico y que no se pierda entre renders.
  const chartRef = useRef(null);

  // HOOK: useEffect
  // Este hook ejecuta código cuando el componente se "monta" en la página
  // o cuando alguna de sus dependencias (las del array final) cambia.
  // Es el lugar PERFECTO para trabajar con librerías externas que manipulan el DOM.
  useEffect(() => {
    if (canvasRef.current) {
      // Si ya existe un gráfico, lo destruimos antes de crear uno nuevo.
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext("2d");
      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: weightLabels,
          datasets: [
            {
              label: "Peso (kg)",
              data: weightData,
              borderColor: "#6B8A7A",
              backgroundColor: "rgba(107, 138, 122, 0.1)",
              fill: true,
              tension: 0.1,
            },
            {
              label: "Objetivo",
              data: Array(weightLabels.length).fill(90),
              borderColor: "#e53e3e",
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    // Esta función de retorno se ejecuta cuando el componente se "desmonta".
    // Es para limpiar y evitar problemas de memoria.
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [weightData, weightLabels]); // Se volverá a ejecutar si los datos o las etiquetas cambian

  const addWeight = () => {
    const newWeight = parseFloat(inputValue);
    if (newWeight > 50 && newWeight < 150) {
      setWeightData([...weightData, newWeight]);
      setWeightLabels([
        ...weightLabels,
        new Date().toLocaleDateString("es-ES"),
      ]);
      setInputValue(""); // Limpiamos el input
    }
  };

  return (
    <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h3 class="text-xl font-bold text-stone-800 mb-4">Registro de Peso</h3>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <label for="currentWeight" class="font-semibold">
          Peso actual (kg):
        </label>
        <input
          type="number"
          id="currentWeight"
          step="0.1"
          class="border border-stone-300 rounded-lg p-2 w-32 text-center"
          placeholder="95.5"
          value={inputValue}
          onInput={(e) => setInputValue(e.currentTarget.value)}
        />
        <button
          onClick={addWeight}
          class="bg-[#6B8A7A] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#597465] transition"
        >
          Añadir
        </button>
      </div>
      <div class="h-64">
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}
