import { useState, useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $user } from "../../stores/authStore";
import { supabase } from "../../lib/supabase";
import {
  getUserProfile,
  updateUserProfile,
} from "../../services/databaseService";
import type { UserProfile } from "../../types/database";

export default function ProfileDataForm() {
  const user = useStore($user);

  // Estados del formulario
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    avatar_url: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Cargar datos del usuario al montar
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const userProfile = await getUserProfile(user.id);

        setProfile(userProfile);

        // Llenar formulario con datos existentes
        if (userProfile) {
          setFormData((prev) => ({
            ...prev,
            full_name: userProfile.full_name || "",
            email: user.email || "",
            avatar_url: userProfile.avatar_url || "",
          }));
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setMessage({ type: "error", text: "Error al cargar los datos" });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id, user?.email]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;

    try {
      setSaving(true);
      setMessage(null);

      // Actualizar perfil en Supabase
      const profileUpdates = {
        full_name: formData.full_name || undefined,
        avatar_url: formData.avatar_url || undefined,
      };

      const updatedProfile = await updateUserProfile(user.id, profileUpdates);
      if (updatedProfile) {
        setProfile(updatedProfile);
        setMessage({
          type: "success",
          text: "¡Perfil actualizado correctamente!",
        });
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      setMessage({ type: "error", text: "Error al actualizar el perfil" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user?.id || !formData.email) return;

    try {
      setSaving(true);
      setMessage(null);

      // Actualizar email en Supabase Auth
      const { error } = await supabase.auth.updateUser({
        email: formData.email,
      });

      if (error) {
        setMessage({
          type: "error",
          text: `Error al actualizar email: ${error.message}`,
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Email actualizado. Revisa tu correo para confirmar el cambio.",
      });
    } catch (error) {
      console.error("Error al actualizar email:", error);
      setMessage({ type: "error", text: "Error al actualizar el email" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (
      !formData.current_password ||
      !formData.new_password ||
      !formData.confirm_password
    ) {
      setMessage({
        type: "error",
        text: "Por favor, completa todos los campos de contraseña",
      });
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setMessage({
        type: "error",
        text: "Las nuevas contraseñas no coinciden",
      });
      return;
    }

    if (formData.new_password.length < 6) {
      setMessage({
        type: "error",
        text: "La nueva contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      // Verificar contraseña actual reautenticando
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: formData.current_password,
      });

      if (signInError) {
        setMessage({ type: "error", text: "Contraseña actual incorrecta" });
        return;
      }

      // Actualizar contraseña
      const { error } = await supabase.auth.updateUser({
        password: formData.new_password,
      });

      if (error) {
        setMessage({
          type: "error",
          text: `Error al actualizar contraseña: ${error.message}`,
        });
        return;
      }

      // Limpiar campos de contraseña
      setFormData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));

      setMessage({
        type: "success",
        text: "¡Contraseña actualizada correctamente!",
      });
    } catch (error) {
      console.error("Error al actualizar contraseña:", error);
      setMessage({ type: "error", text: "Error al actualizar la contraseña" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div class="flex justify-center items-center py-8">
        <div class="text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div class="space-y-6">
      {/* Mensaje de estado */}
      {message && (
        <div
          class={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Datos Personales */}
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Información Personal
        </h3>

        <div class="space-y-4">
          {/* Avatar */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <div class="flex items-center space-x-4">
              {formData.avatar_url && (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  class="w-16 h-16 rounded-full object-cover border border-gray-300"
                />
              )}
              <div class="flex-1">
                <input
                  type="url"
                  value={formData.avatar_url}
                  onInput={(e) =>
                    handleInputChange(
                      "avatar_url",
                      (e.target as HTMLInputElement).value
                    )
                  }
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
                  placeholder="https://ejemplo.com/tu-avatar.jpg"
                />
                <p class="text-xs text-gray-500 mt-1">
                  URL pública de tu imagen de perfil
                </p>
              </div>
            </div>
          </div>

          {/* Nombre Completo */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.full_name}
              onInput={(e) =>
                handleInputChange(
                  "full_name",
                  (e.target as HTMLInputElement).value
                )
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button
            onClick={handleUpdateProfile}
            disabled={saving}
            class="px-4 py-2 bg-[#3a5a40] text-white rounded-md hover:bg-[#2d4530] focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Guardando..." : "Actualizar Perfil"}
          </button>
        </div>
      </div>

      {/* Cambiar Email */}
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Cambiar Email</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nuevo Email
            </label>
            <input
              type="email"
              value={formData.email}
              onInput={(e) =>
                handleInputChange("email", (e.target as HTMLInputElement).value)
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
              placeholder="nuevo@email.com"
            />
            <p class="text-xs text-gray-500 mt-1">
              Recibirás un email de confirmación para verificar el cambio
            </p>
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button
            onClick={handleUpdateEmail}
            disabled={saving || formData.email === user?.email}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Actualizando..." : "Cambiar Email"}
          </button>
        </div>
      </div>

      {/* Cambiar Contraseña */}
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          Cambiar Contraseña
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Contraseña Actual
            </label>
            <input
              type="password"
              value={formData.current_password}
              onInput={(e) =>
                handleInputChange(
                  "current_password",
                  (e.target as HTMLInputElement).value
                )
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
              placeholder="Tu contraseña actual"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={formData.new_password}
              onInput={(e) =>
                handleInputChange(
                  "new_password",
                  (e.target as HTMLInputElement).value
                )
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={formData.confirm_password}
              onInput={(e) =>
                handleInputChange(
                  "confirm_password",
                  (e.target as HTMLInputElement).value
                )
              }
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
              placeholder="Repite la nueva contraseña"
            />
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button
            onClick={handleUpdatePassword}
            disabled={saving}
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Actualizando..." : "Cambiar Contraseña"}
          </button>
        </div>
      </div>
    </div>
  );
}
