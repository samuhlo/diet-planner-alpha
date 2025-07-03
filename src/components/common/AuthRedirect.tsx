import { useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $user, $loading, initAuth } from "../../stores/authStore";

export default function AuthRedirect() {
  const user = useStore($user);
  const isLoading = useStore($loading);

  useEffect(() => {
    // Inicializar autenticación cuando se monta el componente
    initAuth();
  }, []);

  useEffect(() => {
    // Si ya terminó de cargar y hay un usuario, redirigir
    if (!isLoading && user) {
      window.location.href = "/";
    }
  }, [user, isLoading]);

  return null;
}
