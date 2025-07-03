import { useStore } from "@nanostores/preact";
import { useState, useEffect } from "preact/hooks";
import { $user } from "../../stores/authStore";
import { getUserProfile } from "../../services/databaseService";
import Tabs from "../common/Tabs";
import AppDataForm from "./AppDataForm";
import ProfileDataForm from "./ProfileDataForm";
import type { UserProfile } from "../../types/database";

export default function UserProfile() {
  const user = useStore($user);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Cargar perfil del usuario para obtener avatar
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        const userProfile = await getUserProfile(user.id);
        setProfile(userProfile);
      }
    };
    loadProfile();
  }, [user?.id]);

  // Si no hay usuario autenticado, mostrar mensaje
  if (!user) {
    return (
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            Acceso Requerido
          </h2>
          <p class="text-gray-600 mb-6">
            Debes iniciar sesión para acceder a tu perfil.
          </p>
          <a
            href="/login"
            class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#3a5a40] hover:bg-[#2d4530] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3a5a40]"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  // Configurar tabs
  const tabs = [
    {
      id: "app-data",
      label: "Datos y Análisis",
      content: <AppDataForm />,
    },
    {
      id: "profile-data",
      label: "Perfil Personal",
      content: <ProfileDataForm />,
    },
  ];

  return (
    <div class="max-w-4xl flex flex-col gap-4 mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div class="mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center  space-x-4">
            {/* Avatar del usuario */}
            <div class="flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar del usuario"
                  class="w-16 h-16 rounded-full object-cover border-2 border-[#3a5a40]"
                />
              ) : (
                <div class="w-16 h-16 bg-[#3a5a40] rounded-full flex items-center justify-center">
                  <span class="text-white text-xl font-bold">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>

            {/* Información básica */}
            <div class="flex-1">
              <h1 class="text-2xl font-bold text-gray-900">
                {profile?.full_name || "Mi Perfil"}
              </h1>
              <p class="text-gray-600">{user.email}</p>
              <p class="text-sm text-gray-500">
                Gestiona tu información personal y configuración de la
                aplicación
              </p>
            </div>

            {/* Estado de verificación */}
            <div class="flex-shrink-0">
              <span
                class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.email_confirmed_at
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {user.email_confirmed_at ? "Verificado" : "Pendiente"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs y contenido */}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Tabs tabs={tabs} defaultTab="app-data" />
      </div>
    </div>
  );
}
