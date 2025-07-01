import { atom, computed } from "nanostores";
import { supabase } from "../lib/supabase";
import type { User, Session, AuthError } from "../lib/supabase";
import { syncUserDataAfterLogin } from "../services/migrationService";
import { clearUserStores, loadUserDataFromSupabase } from "./userProfileStore";

/**
 * Limpiar todos los datos locales del localStorage y stores
 */
const clearLocalStorage = () => {
  const keysToRemove = [
    "userData",
    "userGoal",
    "userAnalysis",
    "isProfileComplete",
    "userProfile",
    "weightLog",
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  // También limpiar los stores
  clearUserStores();

  console.log("localStorage y stores limpiados para usuario no autenticado");
};

// --- ESTADOS DEL STORE ---
export const $user = atom<User | null>(null);
export const $session = atom<Session | null>(null);
export const $loading = atom<boolean>(true);
export const $error = atom<string | null>(null);

// --- COMPUTED STORES ---
export const $isAuthenticated = computed($user, (user) => !!user);

// --- FUNCIONES DE AUTENTICACIÓN ---

/**
 * Inicializar el store de autenticación
 * Obtiene la sesión actual y configura los listeners
 */
export const initAuth = async () => {
  try {
    $loading.set(true);
    $error.set(null);

    // Obtener sesión actual
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error al obtener sesión:", error);
      $error.set(error.message);
      clearLocalStorage(); // Limpiar si hay error
    } else {
      $session.set(session);
      $user.set(session?.user ?? null);

      // Si no hay usuario autenticado, limpiar localStorage
      if (!session?.user) {
        clearLocalStorage();
      } else {
        // Si hay usuario autenticado, cargar sus datos
        try {
          await loadUserDataFromSupabase(session.user.id);
        } catch (error) {
          console.warn("Error cargando datos en initAuth:", error);
        }
      }
    }

    // Listener para cambios de autenticación
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      $session.set(session);
      $user.set(session?.user ?? null);

      if (event === "SIGNED_OUT" || !session?.user) {
        // Limpiar datos locales al cerrar sesión o si no hay usuario
        $error.set(null);
        clearLocalStorage();
      } else if (event === "SIGNED_IN" && session?.user) {
        // Cargar datos cuando se detecta una sesión activa
        try {
          await loadUserDataFromSupabase(session.user.id);
        } catch (error) {
          console.warn("Error cargando datos en auth state change:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error al inicializar auth:", error);
    $error.set("Error al inicializar autenticación");
  } finally {
    $loading.set(false);
  }
};

/**
 * Registrar un nuevo usuario
 */
export const signUp = async (email: string, password: string) => {
  try {
    $loading.set(true);
    $error.set(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      $error.set(error.message);
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    const errorMessage = "Error al registrar usuario";
    $error.set(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    $loading.set(false);
  }
};

/**
 * Iniciar sesión con email y contraseña
 */
export const signIn = async (email: string, password: string) => {
  try {
    $loading.set(true);
    $error.set(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      $error.set(error.message);
      return { success: false, error: error.message };
    }

    // Sincronizar datos después del login exitoso
    if (data.user?.email) {
      try {
        await syncUserDataAfterLogin(data.user.id, data.user.email);

        // Cargar datos en stores locales para que estén disponibles inmediatamente
        await loadUserDataFromSupabase(data.user.id);
      } catch (error) {
        console.warn("Error en sincronización post-login:", error);
        // No fallar el login por errores de sincronización
      }
    }

    return { success: true, user: data.user };
  } catch (error) {
    const errorMessage = "Error al iniciar sesión";
    $error.set(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    $loading.set(false);
  }
};

/**
 * Cerrar sesión
 */
export const signOut = async () => {
  try {
    $loading.set(true);
    $error.set(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      $error.set(error.message);
      console.error("Error en Supabase signOut:", error);
      return { success: false, error: error.message };
    }

    // Limpiar localStorage al cerrar sesión (inmediatamente, no esperar listener)
    clearLocalStorage();

    // Limpiar stores inmediatamente también
    $user.set(null);
    $session.set(null);

    console.log("✅ Sesión cerrada exitosamente");
    return { success: true };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    // En caso de error, limpiar de todas formas para evitar estados inconsistentes
    clearLocalStorage();
    $user.set(null);
    $session.set(null);

    const errorMessage = "Error al cerrar sesión";
    $error.set(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    $loading.set(false);
  }
};

/**
 * Enviar email de recuperación de contraseña
 */
export const resetPassword = async (email: string) => {
  try {
    $loading.set(true);
    $error.set(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      $error.set(error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = "Error al enviar email de recuperación";
    $error.set(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    $loading.set(false);
  }
};

/**
 * Limpiar errores
 */
export const clearError = () => {
  $error.set(null);
};

/**
 * Iniciar sesión con OAuth (Google, GitHub, Apple, etc.)
 */
export const signInWithOAuth = async (
  provider: "google" | "github" | "apple"
) => {
  try {
    $loading.set(true);
    $error.set(null);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      $error.set(error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    const errorMessage = `Error al autenticar con ${provider}`;
    $error.set(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    $loading.set(false);
  }
};

/**
 * Verificar email de usuario
 */
export const resendConfirmation = async (email: string) => {
  try {
    $loading.set(true);
    $error.set(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      $error.set(error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = "Error al reenviar confirmación";
    $error.set(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    $loading.set(false);
  }
};

/**
 * Eliminar cuenta de usuario
 */
export const deleteAccount = async () => {
  try {
    $loading.set(true);
    $error.set(null);

    const user = $user.get();
    if (!user?.id) {
      throw new Error("No hay usuario autenticado");
    }

    // Primero cerrar sesión
    await signOut();

    // La eliminación del usuario debe hacerse desde el servidor
    // por razones de seguridad usando supabase.auth.admin.deleteUser()
    // Por ahora, solo cerramos sesión y limpiamos datos

    return { success: true };
  } catch (error) {
    const errorMessage = "Error al eliminar cuenta";
    $error.set(errorMessage);
    return { success: false, error: errorMessage };
  } finally {
    $loading.set(false);
  }
};

/**
 * Obtener información del usuario actual
 */
export const getCurrentUser = () => {
  return $user.get();
};

/**
 * Verificar si el email del usuario está confirmado
 */
export const isEmailConfirmed = () => {
  const user = $user.get();
  return user?.email_confirmed_at != null;
};
