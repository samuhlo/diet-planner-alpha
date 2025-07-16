import { createClient } from "@supabase/supabase-js";

// Función para verificar y loggear configuración
const verifySupabaseConfig = () => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  console.log("🔧 [SUPABASE_CONFIG] Verificando configuración...");
  console.log("🔧 [SUPABASE_CONFIG] Environment:", {
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
  });

  // Verificar URL
  if (!supabaseUrl) {
    console.error("❌ [SUPABASE_CONFIG] PUBLIC_SUPABASE_URL no está definida");
    throw new Error("PUBLIC_SUPABASE_URL no está definida");
  } else {
    console.log(
      "✅ [SUPABASE_CONFIG] URL:",
      supabaseUrl.substring(0, 30) + "..."
    );
  }

  // Verificar clave anónima
  if (!supabaseAnonKey) {
    console.error(
      "❌ [SUPABASE_CONFIG] PUBLIC_SUPABASE_ANON_KEY no está definida"
    );
    throw new Error("PUBLIC_SUPABASE_ANON_KEY no está definida");
  } else {
    console.log(
      "✅ [SUPABASE_CONFIG] Anon Key:",
      supabaseAnonKey.substring(0, 20) + "..."
    );
  }

  // Verificar formato de URL
  try {
    new URL(supabaseUrl);
    console.log("✅ [SUPABASE_CONFIG] URL tiene formato válido");
  } catch {
    console.error(
      "❌ [SUPABASE_CONFIG] URL tiene formato inválido:",
      supabaseUrl
    );
    throw new Error("PUBLIC_SUPABASE_URL tiene formato inválido");
  }

  return { supabaseUrl, supabaseAnonKey };
};

// Obtener y verificar las variables de entorno
const { supabaseUrl, supabaseAnonKey } = verifySupabaseConfig();

// Crear el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configuraciones específicas para producción
    storageKey: "supabase-auth-token",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

// Log de inicialización exitosa
console.log("✅ [SUPABASE_CONFIG] Cliente inicializado correctamente");

// Tipos para TypeScript
export type { User, Session, AuthError } from "@supabase/supabase-js";
