import { atom, computed } from "nanostores";
import { supabase } from "../lib/supabase";
import type { User, Session, AuthError } from "../lib/supabase";

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
    } else {
      $session.set(session);
      $user.set(session?.user ?? null);
    }

    // Listener para cambios de autenticación
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      $session.set(session);
      $user.set(session?.user ?? null);

      if (event === "SIGNED_OUT") {
        // Limpiar datos locales al cerrar sesión
        $error.set(null);
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
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
