import { useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $modal, getModalData, closeModal } from "../../stores/modalStore";

/**
 * Modal de notificaciones temporales
 *
 * Se cierra automáticamente después de 3 segundos
 */
export default function NotificationModal() {
  const modalState = useStore($modal);
  const notificationData = getModalData() as any; // Simplificar temporalmente

  if (!notificationData) {
    return (
      <div className="error-message">
        No se encontró información para la notificación
      </div>
    );
  }

  const { title, message, type, autoClose, duration = 3000 } = notificationData;

  // Efecto para cerrar automáticamente si está habilitado
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        closeModal();
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoClose, duration]);

  // Obtener el icono según el tipo
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✗";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <div className={`notification-modal ${type}`}>
      <div className="notification-icon">{getIcon()}</div>

      <div className="notification-content">
        <h3 className="notification-title">{title}</h3>
        <p className="notification-message">{message}</p>
      </div>

      {!autoClose && (
        <button
          className="close-button"
          onClick={closeModal}
          aria-label="Cerrar notificación"
        >
          &times;
        </button>
      )}

      {autoClose && (
        <div className="auto-close-indicator">
          <div
            className="progress-bar"
            style={{
              animationDuration: `${duration}ms`,
            }}
          />
        </div>
      )}
    </div>
  );
}
