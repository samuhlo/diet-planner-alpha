import { useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { signUp, $loading, $error, clearError } from "../../stores/authStore";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loading = useStore($loading);
  const authError = useStore($error);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Limpiar errores previos
    clearError();
    setLocalError(null);
    setSuccess(false);

    // Validaciones básicas
    if (!email || !password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      setLocalError("Las contraseñas no coinciden");
      return;
    }

    try {
      const result = await signUp(email, password);

      if (result.success) {
        setSuccess(true);
        // Limpiar formulario
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Error en registro:", error);
    }
  };

  const error = localError || authError;

  if (success) {
    return (
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div class="text-center">
          <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <h3 class="font-bold">¡Registro exitoso!</h3>
            <p class="text-sm">
              Hemos enviado un email de verificación a tu correo. Por favor,
              revisa tu bandeja de entrada y haz clic en el enlace para activar
              tu cuenta.
            </p>
          </div>
          <a
            href="/login"
            class="inline-block bg-[#3a5a40] text-white py-2 px-4 rounded-md hover:bg-[#2d4530] transition-colors"
          >
            Ir a Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-center text-[#3a5a40] mb-6">
        Crear Cuenta
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
            placeholder="Mínimo 6 caracteres"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent"
            disabled={loading}
            required
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirmar Contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onInput={(e) =>
              setConfirmPassword((e.target as HTMLInputElement).value)
            }
            placeholder="Repite tu contraseña"
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
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" class="text-[#3a5a40] hover:underline font-medium">
            Inicia sesión aquí
          </a>
        </p>
      </div>
    </div>
  );
}
