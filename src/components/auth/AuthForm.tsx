import { useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  signIn,
  signUp,
  resetPassword,
  resendConfirmation,
  $loading,
  $error,
  clearError,
} from "../../stores/authStore";
import OAuthButtons from "./OAuthButtons";

type AuthMode = "login" | "signup" | "reset";

interface AuthFormProps {
  initialMode?: AuthMode;
}

export default function AuthForm({ initialMode = "login" }: AuthFormProps) {
  const loading = useStore($loading);
  const error = useStore($error);

  // Estado del modo y formularios
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Campos del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Mensajes
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );

  // Validaciones
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;
  const isFormValid = () => {
    if (mode === "reset") return email;
    if (mode === "login") return email && password;
    if (mode === "signup")
      return (
        email &&
        password &&
        confirmPassword &&
        isPasswordValid &&
        doPasswordsMatch
      );
    return false;
  };

  // Handlers
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!isFormValid()) return;

    clearError();
    setSuccessMessage(null);
    setConfirmationMessage(null);

    if (mode === "login") {
      const result = await signIn(email, password);
      if (result.success) {
        console.log("Login exitoso");
      }
    } else if (mode === "signup") {
      const result = await signUp(email, password);
      if (result.success) {
        setSuccessMessage(
          "¡Registro exitoso! Revisa tu email para confirmar tu cuenta."
        );
        resetForm();
      }
    } else if (mode === "reset") {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccessMessage(
          "Te hemos enviado un email con instrucciones para restablecer tu contraseña."
        );
        setMode("login");
        setEmail("");
      }
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setConfirmationMessage("Por favor, ingresa tu email primero");
      return;
    }

    clearError();
    const result = await resendConfirmation(email);
    if (result.success) {
      setConfirmationMessage(
        "Email de confirmación reenviado. Revisa tu bandeja de entrada."
      );
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
    setSuccessMessage(null);
    setConfirmationMessage(null);
    resetForm();
  };

  // Contenido según el modo
  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Iniciar Sesión";
      case "signup":
        return "Crear Cuenta";
      case "reset":
        return "Restablecer Contraseña";
    }
  };

  const getSubmitText = () => {
    switch (mode) {
      case "login":
        return "Iniciar Sesión";
      case "signup":
        return "Crear Cuenta";
      case "reset":
        return "Enviar Email";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {getTitle()}
          </h2>

          {/* Mensajes de éxito */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Mensajes de confirmación */}
          {confirmationMessage && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-700 text-sm">{confirmationMessage}</p>
            </div>
          )}

          {/* Errores */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* OAuth buttons (solo para login y signup) */}
          {mode !== "reset" && <OAuthButtons mode={mode} />}

          {/* Formulario de email/password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {/* Password (no para reset) */}
            {mode !== "reset" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword((e.target as HTMLInputElement).value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
                {mode === "signup" && password && !isPasswordValid && (
                  <p className="text-red-600 text-xs mt-1">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password (solo para signup) */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword((e.target as HTMLInputElement).value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
                {confirmPassword && !doPasswordsMatch && (
                  <p className="text-red-600 text-xs mt-1">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Procesando..." : getSubmitText()}
            </button>
          </form>

          {/* Links de navegación */}
          <div className="mt-6 text-center text-sm space-y-2">
            {mode === "login" && (
              <>
                <div>
                  <button
                    onClick={() => switchMode("reset")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div>
                  <span className="text-gray-600">¿No tienes cuenta? </span>
                  <button
                    onClick={() => switchMode("signup")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Crear cuenta
                  </button>
                </div>
                <div>
                  <button
                    onClick={handleResendConfirmation}
                    disabled={loading || !email}
                    className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    Reenviar email de confirmación
                  </button>
                </div>
              </>
            )}

            {mode === "signup" && (
              <div>
                <span className="text-gray-600">¿Ya tienes cuenta? </span>
                <button
                  onClick={() => switchMode("login")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Iniciar sesión
                </button>
              </div>
            )}

            {mode === "reset" && (
              <div>
                <button
                  onClick={() => switchMode("login")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Volver al login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
