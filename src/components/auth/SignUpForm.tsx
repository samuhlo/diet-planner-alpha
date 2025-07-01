import { useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  signUp,
  signInWithOAuth,
  $loading,
  $error,
  clearError,
} from "../../stores/authStore";

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export default function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const loading = useStore($loading);
  const error = useStore($error);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      // Este error se maneja en la validación visual
      return;
    }

    clearError();
    setSuccessMessage(null);

    const result = await signUp(email, password);

    if (result.success) {
      setSuccessMessage(
        "¡Registro exitoso! Revisa tu email para confirmar tu cuenta."
      );
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github" | "apple") => {
    clearError();
    const result = await signInWithOAuth(provider);

    if (result.success) {
      console.log(`Registro con ${provider} iniciado`);
      // El usuario será redirigido automáticamente
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

  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Crear Cuenta
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
              O regístrate con email
            </span>
          </div>
        </div>

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
            {password && !isPasswordValid && (
              <p className="text-red-600 text-xs mt-1">
                La contraseña debe tener al menos 6 caracteres
              </p>
            )}
          </div>

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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !email ||
              !password ||
              !confirmPassword ||
              !isPasswordValid ||
              !doPasswordsMatch
            }
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-600">¿Ya tienes cuenta? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:underline text-sm"
            >
              Inicia sesión aquí
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
