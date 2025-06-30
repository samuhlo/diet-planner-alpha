import { useEffect } from "preact/hooks";
import {
  syncClerkData,
  loadLocalData,
  clearSyncedData,
} from "../../stores/userSyncStore";
import { initializeAuth } from "../../stores/authStore";

// Este componente se encarga de sincronizar el estado de Clerk con nuestros stores
export default function AuthInitializer() {
  useEffect(() => {
    // Inicializar autenticación
    initializeAuth();

    // Cargar datos locales existentes como backup
    loadLocalData();

    // Verificar estado de autenticación de Clerk
    // En un entorno real, esto se conectaría con los eventos de Clerk
    if (typeof window !== "undefined") {
      // Función para manejar cambios en el estado de autenticación
      const handleAuthChange = () => {
        // Aquí se integraría con Clerk's user store
        // Por ahora, simulamos el comportamiento
        const isSignedIn = false; // Esto vendría de Clerk

        if (!isSignedIn) {
          clearSyncedData();
        }
      };

      // Escuchar cambios en el estado de autenticación
      window.addEventListener("clerk:loaded", handleAuthChange);
      window.addEventListener("clerk:signOut", () => clearSyncedData());

      return () => {
        window.removeEventListener("clerk:loaded", handleAuthChange);
        window.removeEventListener("clerk:signOut", () => clearSyncedData());
      };
    }
  }, []);

  // Este componente no renderiza nada visible
  return null;
}
