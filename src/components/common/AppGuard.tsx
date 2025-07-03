import { useEffect, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $user, $loading } from "../../stores/authStore";
import { getUserProfile } from "../../services/databaseService";
import { loadUserDataFromSupabase } from "../../stores/userProfileStore";

export default function AppGuard() {
  const user = useStore($user);
  const isLoading = useStore($loading);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkUserStatus() {
      try {
        // Esperar a que termine la carga de autenticación
        if (isLoading) {
          return;
        }

        // Si no hay usuario, redirigir a welcome
        if (!user) {
          window.location.href = "/welcome";
          return;
        }

        // Verificar si el usuario tiene datos completos
        const profile = await getUserProfile(user.id);

        if (!profile || !isProfileComplete(profile)) {
          // Usuario sin datos completos, redirigir a setup
          window.location.href = "/setup";
          return;
        }

        // Cargar datos en stores locales para asegurar que estén disponibles
        try {
          await loadUserDataFromSupabase(user.id);
        } catch (error) {
          console.warn("Error cargando datos en AppGuard:", error);
          // No bloquear el acceso por errores de carga de datos
        }

        // Todo está bien, el usuario puede acceder a la app
        setIsChecking(false);
      } catch (error) {
        console.error("Error verificando estado del usuario:", error);
        // En caso de error, redirigir a welcome para empezar de nuevo
        window.location.href = "/welcome";
      }
    }

    checkUserStatus();
  }, [user, isLoading]);

  const isProfileComplete = (profile: any): boolean => {
    return !!(
      profile.weight &&
      profile.height &&
      profile.age &&
      profile.gender &&
      profile.steps !== null
    );
  };

  // Mostrar loading mientras se verifica
  if (isLoading || isChecking) {
    return (
      <div class="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div class="text-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3a5a40] mx-auto"></div>
          <p class="text-gray-600">Verificando tu sesión...</p>
        </div>
      </div>
    );
  }

  // Si llegamos aquí, todo está bien y el usuario puede ver la app
  return null;
}
