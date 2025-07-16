import { supabase } from "../lib/supabase";

/**
 * Función de diagnóstico para problemas de autenticación
 * Útil para debugging en producción
 */
export const runAuthDiagnostics = async () => {
  console.log(
    "🔍 [AUTH_DIAGNOSTICS] Iniciando diagnóstico de autenticación..."
  );

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      origin: typeof window !== "undefined" ? window.location.origin : "N/A",
      hostname:
        typeof window !== "undefined" ? window.location.hostname : "N/A",
      protocol:
        typeof window !== "undefined" ? window.location.protocol : "N/A",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
    },
    supabase: {
      urlConfigured: !!import.meta.env.PUBLIC_SUPABASE_URL,
      keyConfigured: !!import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
      urlPrefix:
        import.meta.env.PUBLIC_SUPABASE_URL?.substring(0, 30) + "..." || "N/A",
    },
    storage: {} as any,
    session: null as any,
    connection: false as any,
  };

  // Verificar localStorage
  try {
    if (typeof window !== "undefined") {
      const authKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes("supabase") || key.includes("auth"))) {
          authKeys.push(key);
        }
      }
      diagnostics.storage = {
        available: true,
        authKeys: authKeys.length,
        keys: authKeys,
      };
    } else {
      diagnostics.storage = {
        available: false,
        reason: "window not available",
      };
    }
  } catch (error) {
    diagnostics.storage = { available: false, error: (error as Error).message };
  }

  // Verificar sesión actual
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      diagnostics.session = { error: error.message };
    } else if (session) {
      diagnostics.session = {
        exists: true,
        userId: session.user?.id || "N/A",
        email: session.user?.email || "N/A",
        provider: session.user?.app_metadata?.provider || "email",
        expiresAt: session.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : "N/A",
      };
    } else {
      diagnostics.session = { exists: false };
    }
  } catch (error) {
    diagnostics.session = { error: (error as Error).message };
  }

  // Verificar conexión a Supabase
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("id")
      .limit(1);
    if (error) {
      diagnostics.connection = { success: false, error: error.message };
    } else {
      diagnostics.connection = { success: true };
    }
  } catch (error) {
    diagnostics.connection = {
      success: false,
      error: (error as Error).message,
    };
  }

  console.log("🔍 [AUTH_DIAGNOSTICS] Resultados:", diagnostics);

  return diagnostics;
};

/**
 * Función específica para diagnosticar problemas de logout
 */
export const runLogoutDiagnostics = async () => {
  console.log("🔍 [LOGOUT_DIAGNOSTICS] Iniciando diagnóstico de logout...");

  const before = await runAuthDiagnostics();

  try {
    // Intentar logout
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("❌ [LOGOUT_DIAGNOSTICS] Error en signOut:", error);
      return { success: false, error: error.message, before };
    }

    // Verificar estado después del logout
    setTimeout(async () => {
      const after = await runAuthDiagnostics();
      console.log("🔍 [LOGOUT_DIAGNOSTICS] Estado después del logout:", {
        before,
        after,
        success: true,
      });
    }, 1000);

    return { success: true, before };
  } catch (error) {
    console.error("❌ [LOGOUT_DIAGNOSTICS] Error en proceso de logout:", error);
    return { success: false, error: (error as Error).message, before };
  }
};

// Función para exponer diagnósticos globalmente en desarrollo
if (typeof window !== "undefined" && import.meta.env.DEV) {
  (window as any).authDiagnostics = runAuthDiagnostics;
  (window as any).logoutDiagnostics = runLogoutDiagnostics;
}
