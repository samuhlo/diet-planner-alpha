import React from "preact/compat";
import { useStore } from "@nanostores/preact";
import { $modal, getModalData } from "../../stores/modalStore";
import type { ModalDataMap } from "../../stores/modalStore";

const NutritionDetailModal: React.FC = () => {
  const modalState = useStore($modal);
  const nutritionData = getModalData<"nutritionDetail">();

  if (!nutritionData) {
    return (
      <div className="error-message">
        No se encontró información nutricional
      </div>
    );
  }

  const { title, nutritionalData, period, targetValues } = nutritionData;

  // Función para calcular el porcentaje del objetivo
  const calculatePercentage = (value: number, target: number | undefined) => {
    if (!target) return null;
    return Math.round((value / target) * 100);
  };

  // Función para generar clases según el porcentaje
  const getPercentageClass = (percentage: number | null) => {
    if (percentage === null) return "";
    if (percentage < 80) return "below-target";
    if (percentage > 120) return "above-target";
    return "on-target";
  };

  return (
    <div className="nutrition-detail-modal">
      <h2 className="modal-title">{title}</h2>

      <div className="period-indicator">
        {period === "day" && "Información nutricional diaria"}
        {period === "week" && "Información nutricional semanal"}
        {period === "meal" && "Información nutricional por comida"}
      </div>

      <div className="nutrition-summary">
        <div className="nutrition-chart">
          {/* Aquí podríamos añadir un gráfico circular o de barras */}
          <div className="chart-placeholder">
            {/* Representación visual de macros */}
            <div
              className="protein-bar"
              style={{
                width: `${
                  (nutritionalData.protein /
                    (nutritionalData.protein +
                      nutritionalData.carbs +
                      nutritionalData.fat)) *
                  100
                }%`,
              }}
            />
            <div
              className="carbs-bar"
              style={{
                width: `${
                  (nutritionalData.carbs /
                    (nutritionalData.protein +
                      nutritionalData.carbs +
                      nutritionalData.fat)) *
                  100
                }%`,
              }}
            />
            <div
              className="fat-bar"
              style={{
                width: `${
                  (nutritionalData.fat /
                    (nutritionalData.protein +
                      nutritionalData.carbs +
                      nutritionalData.fat)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="nutrition-table">
          <div className="table-header">
            <span className="nutrient-header">Nutriente</span>
            <span className="value-header">Valor</span>
            {targetValues && <span className="target-header">Objetivo</span>}
            {targetValues && <span className="percentage-header">%</span>}
          </div>

          <div className="nutrient-row">
            <span className="nutrient-name">Calorías</span>
            <span className="nutrient-value">
              {nutritionalData.calories} kcal
            </span>
            {targetValues && (
              <>
                <span className="target-value">
                  {targetValues.calories} kcal
                </span>
                <span
                  className={`percentage ${getPercentageClass(
                    calculatePercentage(
                      nutritionalData.calories,
                      targetValues.calories
                    )
                  )}`}
                >
                  {calculatePercentage(
                    nutritionalData.calories,
                    targetValues.calories
                  )}
                  %
                </span>
              </>
            )}
          </div>

          <div className="nutrient-row">
            <span className="nutrient-name">Proteínas</span>
            <span className="nutrient-value">{nutritionalData.protein} g</span>
            {targetValues && (
              <>
                <span className="target-value">{targetValues.protein} g</span>
                <span
                  className={`percentage ${getPercentageClass(
                    calculatePercentage(
                      nutritionalData.protein,
                      targetValues.protein
                    )
                  )}`}
                >
                  {calculatePercentage(
                    nutritionalData.protein,
                    targetValues.protein
                  )}
                  %
                </span>
              </>
            )}
          </div>

          <div className="nutrient-row">
            <span className="nutrient-name">Carbohidratos</span>
            <span className="nutrient-value">{nutritionalData.carbs} g</span>
            {targetValues && (
              <>
                <span className="target-value">{targetValues.carbs} g</span>
                <span
                  className={`percentage ${getPercentageClass(
                    calculatePercentage(
                      nutritionalData.carbs,
                      targetValues.carbs
                    )
                  )}`}
                >
                  {calculatePercentage(
                    nutritionalData.carbs,
                    targetValues.carbs
                  )}
                  %
                </span>
              </>
            )}
          </div>

          <div className="nutrient-row">
            <span className="nutrient-name">Grasas</span>
            <span className="nutrient-value">{nutritionalData.fat} g</span>
            {targetValues && (
              <>
                <span className="target-value">{targetValues.fat} g</span>
                <span
                  className={`percentage ${getPercentageClass(
                    calculatePercentage(nutritionalData.fat, targetValues.fat)
                  )}`}
                >
                  {calculatePercentage(nutritionalData.fat, targetValues.fat)}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {nutritionalData.details && (
        <div className="nutrition-details">
          <h3>Detalles adicionales</h3>
          <div className="details-content">
            {Object.entries(nutritionalData.details).map(([key, value]) => (
              <div key={key} className="detail-item">
                <span className="detail-label">{key}:</span>
                <span className="detail-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {nutritionalData.notes && (
        <div className="nutrition-notes">
          <h3>Notas</h3>
          <p>{nutritionalData.notes}</p>
        </div>
      )}
    </div>
  );
};

export default NutritionDetailModal;
