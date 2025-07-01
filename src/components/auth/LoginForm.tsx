import { useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { signIn, $loading, $error, clearError } from "../../stores/authStore";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const loading = useStore($loading);
  const authError = useStore($error);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Limpiar errores previos
    clearError();
    setLocalError(null);

    // Validaciones básicas
    if (!email || !password) {
      setLocalError("Por favor, completa todos los campos");
      return;
    }

    if (!email.includes("@")) {
      setLocalError("Por favor, ingresa un email válido");
      return;
    }

    if (password.length < 6) {
      setLocalError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const result = await signIn(email, password);

      if (result.success) {
        // Redireccionar al home o donde sea apropiado
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  const error = localError || authError;

  return (
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-center text-[#3a5a40] mb-6">
        Iniciar Sesión
      </h2>

      {error && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label
            htmlFor="email"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            placeholder="tu@email.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            placeholder="Tu contraseña"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-[#3a5a40] text-white py-2 px-4 rounded-md hover:bg-[#2d4530] focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <a href="/signup" class="text-[#3a5a40] hover:underline font-medium">
            Regístrate aquí
          </a>
        </p>
        <p class="text-sm text-gray-600 mt-2">
          <a href="/forgot-password" class="text-[#3a5a40] hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </p>
      </div>
    </div>
  );
}
