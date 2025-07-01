import { useState } from "preact/hooks";
import { signIn, signUp } from "../../stores/authStore";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = isLogin
        ? await signIn(email, password)
        : await signUp(email, password);

      if (result.success) {
        // Redireccionar después del éxito
        window.location.href = "/";
      } else {
        setMessage({
          type: "error",
          text: result.error || "Error en la autenticación",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error de conexión",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="space-y-6">
      {/* Header del formulario */}
      <div class="text-center space-y-2">
        <h3 class="text-2xl font-bold text-gray-900">
          {isLogin ? "Inicia Sesión" : "Crea tu Cuenta"}
        </h3>
        <p class="text-gray-600">
          {isLogin
            ? "Accede a tu planificador personalizado"
            : "Comienza tu viaje hacia una alimentación saludable"}
        </p>
      </div>

      {/* Tabs */}
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setIsLogin(true)}
          class={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            isLogin
              ? "bg-white text-[#3a5a40] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          onClick={() => setIsLogin(false)}
          class={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            !isLogin
              ? "bg-white text-[#3a5a40] shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Registrarse
        </button>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div
          class={`p-4 rounded-lg ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent transition-colors"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            required
            minLength={6}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a5a40] focus:border-transparent transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="w-full bg-gradient-to-r from-[#3a5a40] to-[#2d4530] text-white py-3 px-6 rounded-lg font-semibold hover:from-[#2d4530] hover:to-[#1f2f20] focus:outline-none focus:ring-2 focus:ring-[#3a5a40] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
        >
          {loading
            ? "Procesando..."
            : isLogin
            ? "Iniciar Sesión"
            : "Crear Cuenta"}
        </button>
      </form>

      {!isLogin && (
        <div class="text-xs text-gray-500 text-center">
          Al registrarte, aceptas nuestros términos de servicio y política de
          privacidad.
        </div>
      )}
    </div>
  );
}
