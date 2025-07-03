import { useEffect } from "preact/hooks";
import { initAuth } from "../../stores/authStore";

interface AuthProviderProps {
  children: any;
}

/**
 * Componente que inicializa la autenticación al cargar la app
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Inicializar autenticación al montar el componente
    initAuth();
  }, []);

  return children;
}
