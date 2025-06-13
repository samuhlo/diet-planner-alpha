// src/components/ProgressChart.jsx
import { useRef, useEffect, useMemo } from "preact/hooks";
import Chart from "chart.js/auto";

export default function ProgressChart({ weightLog, goal }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Preparar datos del peso real con fechas únicas
  const realData = useMemo(() => {
    if (weightLog.length === 0) return { labels: [], data: [] };

    // Agrupar pesos por fecha y tomar el último de cada día
    const weightByDate = {};
    weightLog.forEach((entry) => {
      const dateKey = new Date(entry.date).toLocaleDateString("es-ES");
      weightByDate[dateKey] = entry.weight;
    });

    // Ordenar por fecha
    const sortedDates = Object.keys(weightByDate).sort((a, b) => {
      return (
        new Date(a.split("/").reverse().join("-")) -
        new Date(b.split("/").reverse().join("-"))
      );
    });

    return {
      labels: sortedDates,
      data: sortedDates.map((date) => weightByDate[date]),
    };
  }, [weightLog]);

  // Calcular línea de peso objetivo desde inicio hasta fin
  const goalLineData = useMemo(() => {
    if (
      !goal ||
      goal.goalType !== "lose" ||
      !goal.startDate ||
      !goal.endDate ||
      !goal.targetWeight ||
      weightLog.length === 0
    ) {
      return null;
    }

    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const targetWeight = parseFloat(goal.targetWeight);

    // Obtener el peso inicial (primer registro)
    const initialWeight = weightLog.length > 0 ? weightLog[0].weight : null;
    if (!initialWeight) return null;

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (totalDays <= 0) return null;

    // Generar puntos de la línea de objetivo
    const goalPoints = [];
    const goalLabels = [];

    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      // Línea recta desde peso inicial hasta peso objetivo
      const progress = i / totalDays;
      const goalWeight =
        initialWeight - progress * (initialWeight - targetWeight);

      goalPoints.push(goalWeight);
      goalLabels.push(currentDate.toLocaleDateString("es-ES"));
    }

    return {
      labels: goalLabels,
      data: goalPoints,
      startDate,
      endDate,
      targetWeight,
      initialWeight,
    };
  }, [goal, weightLog]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const datasets = [
      {
        label: "Peso Real (kg)",
        data: realData.data,
        borderColor: "#6B8A7A",
        backgroundColor: "rgba(107, 138, 122, 0.1)",
        fill: true,
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ];

    // Determinar las fechas del gráfico
    let chartLabels = realData.labels;

    // Si hay objetivo de pérdida de peso, incluir fechas de inicio y fin
    if (goal && goal.goalType === "lose" && goal.startDate && goal.endDate) {
      const startDate = new Date(goal.startDate).toLocaleDateString("es-ES");
      const endDate = new Date(goal.endDate).toLocaleDateString("es-ES");

      // Combinar todas las fechas y eliminar duplicados
      const allDates = [...new Set([startDate, ...realData.labels, endDate])];
      chartLabels = allDates.sort((a, b) => {
        return (
          new Date(a.split("/").reverse().join("-")) -
          new Date(b.split("/").reverse().join("-"))
        );
      });
    }

    // Agregar línea de peso objetivo desde inicio hasta fin
    if (goalLineData) {
      datasets.push({
        label: "Peso Objetivo",
        data: goalLineData.data,
        borderColor: "#f56500",
        borderDash: [8, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartLabels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(
                  1
                )} kg`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Fecha",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Peso (kg)",
            },
            beginAtZero: false,
            ticks: {
              callback: function (value) {
                return value.toFixed(1) + " kg";
              },
            },
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
        elements: {
          point: {
            hoverRadius: 8,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [weightLog, goal, goalLineData, realData]);

  return (
    <div class="h-96 w-full">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
