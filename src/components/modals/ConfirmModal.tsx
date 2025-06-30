import { useStore } from "@nanostores/preact";
import { $modal, getModalData, closeModal } from "../../stores/modalStore";

/**
 * Modal de confirmación para acciones importantes
 */
export default function ConfirmModal() {
  const modalState = useStore($modal);
  const confirmData = getModalData();

  if (!confirmData) {
    return (
      <div className="error-message">
        No se encontró información para la confirmación
      </div>
    );
  }

  const {
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    danger,
  } = confirmData;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    closeModal();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    closeModal();
  };

  return (
    <div className={`confirm-modal ${danger ? "danger" : ""}`}>
      <h2 className="modal-title">{title}</h2>

      <div className="modal-message">
        <p>{message}</p>
      </div>

      <div className="modal-actions">
        <button className="cancel-button" onClick={handleCancel}>
          {cancelLabel || "Cancelar"}
        </button>
        <button
          className={`confirm-button ${danger ? "danger" : ""}`}
          onClick={handleConfirm}
        >
          {confirmLabel || "Confirmar"}
        </button>
      </div>
    </div>
  );
}
