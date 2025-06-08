export default function Modal({ isOpen, isClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div
      class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose} // Cierra el modal si se hace clic en el fondo
    >
      <div
        class="modal-content bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-xl transform transition-transform scale-100"
        onClick={(e) => e.stopPropagation()} // Evita que el clic en el contenido cierre el modal
      >
        <div class="p-6 border-b flex justify-between items-center">
          <h3 class="text-2xl font-bold text-stone-800">{title}</h3>
          <button
            onClick={onClose}
            class="text-3xl font-bold text-stone-500 hover:text-stone-800"
          >
            &times;
          </button>
        </div>
        <div class="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
