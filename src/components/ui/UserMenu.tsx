import { useStore } from "@nanostores/preact";
import { useState, useEffect } from "preact/hooks";
import {
  $user,
  $isAuthenticated,
  $loading,
  signOut,
} from "../../stores/authStore";

export default function UserMenu() {
  const user = useStore($user);
  const isAuthenticated = useStore($isAuthenticated);
  const authLoading = useStore($loading);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
        window.location.href = "/welcome";
      } else {
        console.error("❌ Error al cerrar sesión:", result.error);
        window.location.href = "/welcome";
      }
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      window.location.href = "/welcome";
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleToggleMenu = (e: Event) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  const handleCloseMenu = () => {
    setShowUserMenu(false);
  };

  // Mostrar loading
  if (authLoading) {
    return <div className="text-sm text-stone-600">Cargando...</div>;
  }

  // Mostrar botones de login/signup si no está autenticado
  if (!isAuthenticated || !user) {
    return (
      <div className="flex gap-2">
        <a
          href="/login"
          className="px-3 py-1 text-sm bg-[#3a5a40] text-white rounded-md hover:bg-[#2d4530] transition-colors"
        >
          Iniciar Sesión
        </a>
        <a
          href="/signup"
          className="px-3 py-1 text-sm border border-[#3a5a40] text-[#3a5a40] rounded-md hover:bg-[#3a5a40] hover:text-white transition-colors"
        >
          Registrarse
        </a>
      </div>
    );
  }

  // Menú de usuario autenticado
  return (
    <div className="relative">
      <button
        onClick={handleToggleMenu}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-100 transition-colors"
        aria-label="Menú de usuario"
        tabIndex={0}
      >
        {/* Información del usuario - visible en pantallas medianas y grandes */}
        <div className="text-right hidden md:block max-w-xs">
          <div
            className="text-sm font-medium text-stone-700 truncate"
            title={user.email}
          >
            {user.email}
          </div>
          <div className="text-xs text-stone-500">Usuario registrado</div>
        </div>

        {/* Avatar - siempre visible */}
        <div className="w-8 h-8 bg-[#3a5a40] rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">
            {user.email?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>

        {/* Icono de dropdown - oculto en pantallas pequeñas */}
        <svg
          className="w-4 h-4 text-stone-500 hidden sm:block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Menú desplegable */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-56 sm:w-48 max-w-xs bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {/* Información del usuario en móvil - solo visible cuando el menú está abierto */}
            <div className="px-4 py-2 border-b border-gray-200 md:hidden">
              <div
                className="text-sm font-medium text-stone-700 truncate"
                title={user.email}
              >
                {user.email}
              </div>
              <div className="text-xs text-stone-500">Usuario registrado</div>
            </div>

            <a
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={handleCloseMenu}
            >
              <svg
                className="w-4 h-4 mr-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Mi Perfil
            </a>

            <hr className="border-gray-200" />

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                isSigningOut
                  ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "text-red-700 hover:bg-red-50"
              }`}
            >
              {isSigningOut ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-3" />
              ) : (
                <svg
                  className="w-4 h-4 mr-3 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              )}
              {isSigningOut ? "Cerrando sesión..." : "Cerrar Sesión"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
