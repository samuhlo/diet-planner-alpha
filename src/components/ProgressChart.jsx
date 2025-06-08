// src/components/ProgressChart.jsx
import { useRef, useEffect } from "preact/hooks";
import Chart from "chart.js/auto";

export default function ProgressChart({ weightLog, goal }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !weightLog) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = weightLog.map((entry) =>
      new Date(entry.date).toLocaleDateString("es-ES")
    );
    const dataPoints = weightLog.map((entry) => entry.weight);

    const datasets = [
      {
        label: "Peso (kg)",
        data: dataPoints,
        borderColor: "#6B8A7A",
        backgroundColor: "rgba(107, 138, 122, 0.1)",
        fill: true,
        tension: 0.1,
      },
    ];

    if (goal && goal.targetWeight) {
      datasets.push({
        label: "Objetivo",
        data: Array(labels.length).fill(goal.targetWeight),
        borderColor: "#e53e3e",
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      });
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: { labels, datasets },
      options: { responsive: true, maintainAspectRatio: false },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [weightLog, goal]); // Se redibuja si el registro o el objetivo cambian

  return (
    <div class="h-96 w-full">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
