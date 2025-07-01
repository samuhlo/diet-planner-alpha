// src/components/Header.tsx
import { useStore } from "@nanostores/preact";
import type { VNode } from "preact";
import { useState, useEffect } from "preact/hooks";
import {
  $user,
  $isAuthenticated,
  $loading,
  signOut,
} from "../../stores/authStore";

export default function Header(): VNode {
  // Nos suscribimos a las stores
  const user = useStore($user);
  const isAuthenticated = useStore($isAuthenticated);
  const authLoading = useStore($loading);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Efecto para manejar el estado de carga inicial
  useEffect(() => {
    // Dar tiempo a que se carguen los datos desde localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setShowUserMenu(false); // Cerrar el menú

    try {
      console.log("🔄 Iniciando proceso de cerrar sesión...");
      const result = await signOut();

      if (result.success) {
        console.log("✅ Sesión cerrada, redirigiendo a welcome...");
        // Redirigir a welcome después de cerrar sesión
        window.location.href = "/welcome";
      } else {
        console.error("❌ Error al cerrar sesión:", result.error);
        window.location.href = "/welcome";
      }
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      // Aun así redirigir a welcome para evitar estados inconsistentes
      window.location.href = "/welcome";
    } finally {
      setIsSigningOut(false);
    }
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
            <div class="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                class="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <div class="text-right">
                  <div class="text-sm font-medium text-stone-700">
                    {user.email}
                  </div>
                  <div class="text-xs text-stone-500">Usuario registrado</div>
                </div>
                <div class="w-8 h-8 bg-[#3a5a40] rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-bold">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <svg
                  class="w-4 h-4 text-stone-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>

              {/* Menú desplegable */}
              {showUserMenu && (
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div class="py-1">
                    <a
                      href="/profile"
                      class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg
                        class="w-4 h-4 mr-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                      Mi Perfil
                    </a>
                    <hr class="border-gray-200" />
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      class={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                        isSigningOut
                          ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "text-red-700 hover:bg-red-50"
                      }`}
                    >
                      {isSigningOut ? (
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-3"></div>
                      ) : (
                        <svg
                          class="w-4 h-4 mr-3 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          ></path>
                        </svg>
                      )}
                      {isSigningOut ? "Cerrando sesión..." : "Cerrar Sesión"}
                    </button>
                  </div>
                </div>
              )}
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
    </header>
  );
}
