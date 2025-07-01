// src/components/Header.tsx
import { useStore } from "@nanostores/preact";
import type { VNode } from "preact";
import { useState, useEffect } from "preact/hooks";
import { $isProfileComplete } from "../../stores/userProfileStore";
import {
  $user,
  $isAuthenticated,
  $loading,
  signOut,
} from "../../stores/authStore";

export default function Header(): VNode {
  // Nos suscribimos a las stores
  const isProfileComplete = useStore($isProfileComplete);
  const user = useStore($user);
  const isAuthenticated = useStore($isAuthenticated);
  const authLoading = useStore($loading);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para manejar el estado de carga inicial
  useEffect(() => {
    // Dar tiempo a que se carguen los datos desde localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header>
      {/* Barra de usuario */}
      <div class="flex justify-between items-center mb-4 p-4 bg-stone-50 rounded-lg">
        <div class="text-center flex-1">
          <h1 class="text-4xl md:text-5xl font-bold text-[#3a5a40]">
            Tu Camino Hacia el Bienestar
          </h1>
          <p class="mt-2 text-lg text-stone-600">
            Un plan interactivo para alcanzar tus objetivos
          </p>
        </div>

        {/* Información de usuario */}
        <div class="flex items-center gap-4">
          {authLoading ? (
            <div class="text-sm text-stone-600">Cargando...</div>
          ) : isAuthenticated && user ? (
            <div class="flex items-center gap-3">
              <div class="text-right">
                <div class="text-sm font-medium text-stone-700">
                  {user.email}
                </div>
                <div class="text-xs text-stone-500">Usuario registrado</div>
              </div>
              <button
                onClick={handleSignOut}
                class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div class="flex gap-2">
              <a
                href="/login"
                class="px-3 py-1 text-sm bg-[#3a5a40] text-white rounded-md hover:bg-[#2d4530] transition-colors"
              >
                Iniciar Sesión
              </a>
              <a
                href="/signup"
                class="px-3 py-1 text-sm border border-[#3a5a40] text-[#3a5a40] rounded-md hover:bg-[#3a5a40] hover:text-white transition-colors"
              >
                Registrarse
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Alerta Condicional - solo mostrar si no está cargando y el perfil no está completo */}
      {!isLoading && !isProfileComplete && (
        <div
          class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-8"
          role="alert"
        >
          <p class="font-bold">¡Atención!</p>
          <p>
            Para obtener un análisis preciso y usar todas las funciones, por
            favor, completa tus datos en las pestañas "Mis Datos" y "Objetivo y
            Progreso".
          </p>
        </div>
      )}
    </header>
  );
}
