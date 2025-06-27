import React from "preact/compat";
import { useStore } from "@nanostores/preact";
import { $modal, getModalData, closeModal } from "../../stores/modalStore";
import type { Supplement } from "../../types/supplements";

const SupplementDetailModal: React.FC = () => {
  const modalState = useStore($modal);
  const supplement = getModalData() as Supplement;

  if (modalState.type !== "supplementDetail" || !supplement) {
    return null;
  }

  return (
    <div className="supplement-detail-modal">
      <h2 className="modal-title">{supplement.name}</h2>

      {supplement.imageUrl && (
        <div className="supplement-image-container">
          <img
            src={supplement.imageUrl}
            alt={supplement.name}
            className="supplement-image"
          />
        </div>
      )}

      <div className="supplement-info-container">
        {supplement.description && (
          <div className="supplement-description">
            <p>{supplement.description}</p>
          </div>
        )}

        <div className="supplement-details">
          {supplement.brand && (
            <div className="detail-item">
              <span className="detail-label">Marca:</span>
              <span className="detail-value">{supplement.brand}</span>
            </div>
          )}

          {supplement.type && (
            <div className="detail-item">
              <span className="detail-label">Tipo:</span>
              <span className="detail-value">{supplement.type}</span>
            </div>
          )}

          {supplement.dosage && (
            <div className="detail-item">
              <span className="detail-label">Dosis:</span>
              <span className="detail-value">{supplement.dosage}</span>
            </div>
          )}

          {supplement.timing && (
            <div className="detail-item">
              <span className="detail-label">Momento de toma:</span>
              <span className="detail-value">{supplement.timing}</span>
            </div>
          )}
        </div>

        {supplement.nutritionalInfo && (
          <div className="nutritional-info">
            <h3>Información Nutricional</h3>
            <div className="nutritional-table">
              <div className="nutritional-row">
                <span className="nutritional-label">Calorías:</span>
                <span className="nutritional-value">
                  {supplement.nutritionalInfo.calories} kcal
                </span>
              </div>
              <div className="nutritional-row">
                <span className="nutritional-label">Proteínas:</span>
                <span className="nutritional-value">
                  {supplement.nutritionalInfo.protein} g
                </span>
              </div>
              {supplement.nutritionalInfo.carbs !== undefined && (
                <div className="nutritional-row">
                  <span className="nutritional-label">Carbohidratos:</span>
                  <span className="nutritional-value">
                    {supplement.nutritionalInfo.carbs} g
                  </span>
                </div>
              )}
              {supplement.nutritionalInfo.fat !== undefined && (
                <div className="nutritional-row">
                  <span className="nutritional-label">Grasas:</span>
                  <span className="nutritional-value">
                    {supplement.nutritionalInfo.fat} g
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {supplement.benefits && supplement.benefits.length > 0 && (
          <div className="benefits-section">
            <h3>Beneficios</h3>
            <ul className="benefits-list">
              {supplement.benefits.map((benefit, index) => (
                <li key={index} className="benefit-item">
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        {supplement.tags && supplement.tags.length > 0 && (
          <div className="tags-section">
            <h3>Etiquetas</h3>
            <div className="tags-container">
              {supplement.tags.map((tag, index) => (
                <span key={index} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {supplement.price && (
          <div className="price-section">
            <span className="price-label">Precio aproximado:</span>
            <span className="price-value">{supplement.price} €</span>
          </div>
        )}

        {supplement.link && (
          <div className="link-section">
            <a
              href={supplement.link}
              target="_blank"
              rel="noopener noreferrer"
              className="supplement-link"
            >
              Ver más información
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplementDetailModal;
