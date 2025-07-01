import { useState, useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  $user,
  deleteAccount,
  isEmailConfirmed,
  resendConfirmation,
} from "../../stores/authStore";
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

  // Estados para eliminación de cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const handleResendEmailConfirmation = async () => {
    if (!user?.email) return;

    try {
      setSaving(true);
      setMessage(null);

      const result = await resendConfirmation(user.email);

      if (result.success) {
        setMessage({
          type: "success",
          text: "Email de confirmación reenviado. Revisa tu bandeja de entrada.",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Error al reenviar confirmación",
        });
      }
    } catch (error) {
      console.error("Error al reenviar confirmación:", error);
      setMessage({ type: "error", text: "Error al reenviar confirmación" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "ELIMINAR") {
      setMessage({
        type: "error",
        text: "Debes escribir 'ELIMINAR' para confirmar la eliminación de la cuenta",
      });
      return;
    }

    try {
      setDeleting(true);
      setMessage(null);

      const result = await deleteAccount();

      if (result.success) {
        // Redirigir al inicio después de eliminar
        window.location.href = "/";
      } else {
        setMessage({
          type: "error",
          text: result.error || "Error al eliminar la cuenta",
        });
      }
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
      setMessage({ type: "error", text: "Error al eliminar la cuenta" });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmText("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-600">Cargando datos del perfil...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Verificación de email */}
      {user && !isEmailConfirmed() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Email no verificado
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Tu email no está verificado. Por favor, revisa tu bandeja de
                  entrada.
                </p>
                <button
                  onClick={handleResendEmailConfirmation}
                  disabled={saving}
                  className="mt-2 text-yellow-800 hover:text-yellow-900 underline disabled:opacity-50"
                >
                  Reenviar email de confirmación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Datos del perfil */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información del Perfil
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                handleInputChange(
                  "full_name",
                  (e.target as HTMLInputElement).value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del Avatar
            </label>
            <input
              type="url"
              value={formData.avatar_url}
              onChange={(e) =>
                handleInputChange(
                  "avatar_url",
                  (e.target as HTMLInputElement).value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com/tu-avatar.jpg"
            />
          </div>

          <button
            onClick={handleUpdateProfile}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Actualizar Perfil"}
          </button>
        </div>
      </div>

      {/* Cambio de email */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Cambiar Email
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nuevo email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                handleInputChange("email", (e.target as HTMLInputElement).value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleUpdateEmail}
            disabled={saving || formData.email === user?.email}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Actualizando..." : "Cambiar Email"}
          </button>
        </div>
      </div>

      {/* Cambio de contraseña */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Cambiar Contraseña
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) =>
                handleInputChange(
                  "current_password",
                  (e.target as HTMLInputElement).value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) =>
                handleInputChange(
                  "new_password",
                  (e.target as HTMLInputElement).value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={formData.confirm_password}
              onChange={(e) =>
                handleInputChange(
                  "confirm_password",
                  (e.target as HTMLInputElement).value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleUpdatePassword}
            disabled={
              saving ||
              !formData.current_password ||
              !formData.new_password ||
              !formData.confirm_password
            }
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Actualizando..." : "Cambiar Contraseña"}
          </button>
        </div>
      </div>

      {/* Zona de peligro - Eliminar cuenta */}
      <div className="bg-white shadow rounded-lg p-6 border-l-4 border-red-500">
        <h3 className="text-lg font-medium text-red-900 mb-4">
          Zona de Peligro
        </h3>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Una vez que elimines tu cuenta, no podrás recuperarla. Esta acción
            eliminará permanentemente todos tus datos.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Eliminar Cuenta
          </button>
        </div>
      </div>

      {/* Modal de confirmación para eliminar cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmar eliminación de cuenta
              </h3>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Esta acción no se puede deshacer. Se eliminarán
                  permanentemente todos tus datos.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escribe "ELIMINAR" para confirmar:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) =>
                      setDeleteConfirmText((e.target as HTMLInputElement).value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="ELIMINAR"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirmText !== "ELIMINAR"}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? "Eliminando..." : "Eliminar Cuenta"}
                  </button>

                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText("");
                    }}
                    disabled={deleting}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes de estado */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "error"
              ? "bg-red-50 border border-red-200 text-red-600"
              : "bg-green-50 border border-green-200 text-green-600"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
