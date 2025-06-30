import { useEffect, useState } from "preact/hooks";

export default function ClerkDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    hasPublishableKey: false,
    clerkLoaded: false,
    environment: "unknown",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Verificar variables de entorno
      const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

      setDiagnostics({
        hasPublishableKey: !!publishableKey,
        clerkLoaded: typeof window.Clerk !== "undefined",
        environment: import.meta.env.MODE || "unknown",
      });

      // Escuchar cuando Clerk se carga
      const checkClerk = () => {
        setDiagnostics((prev) => ({
          ...prev,
          clerkLoaded: typeof window.Clerk !== "undefined",
        }));
      };

      window.addEventListener("clerk:loaded", checkClerk);

      // Verificar periodicamente
      const interval = setInterval(checkClerk, 1000);

      return () => {
        window.removeEventListener("clerk:loaded", checkClerk);
        clearInterval(interval);
      };
    }
  }, []);

  // Solo mostrar en desarrollo
  if (import.meta.env.MODE !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded-lg text-xs max-w-xs">
      <div className="font-bold mb-2">🔧 Clerk Diagnóstico</div>
      <div className="space-y-1">
        <div
          className={`flex items-center gap-2 ${
            diagnostics.hasPublishableKey ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{diagnostics.hasPublishableKey ? "✅" : "❌"}</span>
          <span>Publishable Key</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            diagnostics.clerkLoaded ? "text-green-600" : "text-red-600"
          }`}
        >
          <span>{diagnostics.clerkLoaded ? "✅" : "❌"}</span>
          <span>Clerk Cargado</span>
        </div>
        <div className="text-gray-600">Env: {diagnostics.environment}</div>
      </div>
    </div>
  );
}
