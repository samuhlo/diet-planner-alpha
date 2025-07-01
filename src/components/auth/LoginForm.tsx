import { useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  signIn,
  resetPassword,
  signInWithOAuth,
  resendConfirmation,
  $loading,
  $error,
  clearError,
} from "../../stores/authStore";

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

export default function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const loading = useStore($loading);
  const error = useStore($error);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    clearError();
    const result = await signIn(email, password);

    if (result.success) {
      console.log("Login exitoso");
      // La navegación se maneja automáticamente por el AuthRedirect
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github" | "apple") => {
    clearError();
    const result = await signInWithOAuth(provider);

    if (result.success) {
      console.log(`Login con ${provider} iniciado`);
      // El usuario será redirigido automáticamente
    }
  };

  const handleResetPassword = async (e: Event) => {
    e.preventDefault();

    if (!resetEmail) return;

    clearError();
    const result = await resetPassword(resetEmail);

    if (result.success) {
      setResetMessage(
        "Te hemos enviado un email con instrucciones para restablecer tu contraseña."
      );
      setShowResetPassword(false);
      setResetEmail("");
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

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "google":
        return "🔍";
      case "github":
        return "⚡";
      case "apple":
        return "🍎";
      default:
        return "";
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "google":
        return "Google";
      case "github":
        return "GitHub";
      case "apple":
        return "Apple";
      default:
        return provider;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Iniciar Sesión
        </h2>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          {(["google", "github", "apple"] as const).map((provider) => (
            <button
              key={provider}
              onClick={() => handleOAuthSignIn(provider)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">{getProviderIcon(provider)}</span>
              Continuar con {getProviderName(provider)}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              O continúa con email
            </span>
          </div>
        </div>

        {!showResetPassword ? (
          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
                {error.includes("Email not confirmed") && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Reenviar email de confirmación
                    </button>
                  </div>
                )}
              </div>
            )}

            {resetMessage && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {resetMessage}
              </div>
            )}

            {confirmationMessage && (
              <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-md text-sm">
                {confirmationMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-blue-600 hover:underline text-sm"
              >
                ¿Olvidaste tu contraseña?
              </button>

              <div>
                <span className="text-sm text-gray-600">
                  ¿No tienes cuenta?{" "}
                </span>
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Regístrate aquí
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email para recuperación
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) =>
                  setResetEmail((e.target as HTMLInputElement).value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !resetEmail}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar email de recuperación"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowResetPassword(false);
                setResetEmail("");
                clearError();
              }}
              className="w-full text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Volver al login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
