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

  const handleOAuthSignIn = async (provider: "google" | "github") => {
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
        return (
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        );
      case "github":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      /*case "apple":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        );*/
      default:
        return null;
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

  const getProviderStyles = (provider: string) => {
    switch (provider) {
      case "google":
        return "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500";
      case "github":
        return "bg-[#24292e] border-[#24292e] text-white hover:bg-[#2c3136] focus:ring-gray-500";
      /*case "apple":
        return "bg-black border-black text-white hover:bg-gray-900 focus:ring-gray-500";*/
      default:
        return "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Iniciar Sesión
        </h2>

        {/* OAuth Buttons de momento desactivo Apple*/}
        <div className="space-y-3 mb-6">
          {(["google", "github"] as const).map((provider) => (
            <button
              key={provider}
              onClick={() => handleOAuthSignIn(provider)}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${getProviderStyles(
                provider
              )}`}
            >
              {getProviderIcon(provider)}
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
