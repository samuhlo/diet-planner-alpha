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

    // Verificar si hay una cuenta eliminada marcada para evitar bucles
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem("accountDeleted")
    ) {
      console.log("🗑️ Cuenta eliminada detectada en initAuth, evitando bucle");
      sessionStorage.removeItem("accountDeleted");
      clearLocalStorage();
      $user.set(null);
      $session.set(null);
      return;
    }

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
      // Permitir que cuentas OAuth se reutilicen incluso si tienen email "deleted_"
      // La verificación real se hace a nivel de perfil en userProfileStore

      $session.set(session);
      $user.set(session?.user ?? null);

      // Si no hay usuario autenticado, limpiar localStorage
      if (!session?.user) {
        // Verificar si hay una sesión de invitado activa
        const isGuestMode = localStorage.getItem("guestMode") === "true";
        
        if (isGuestMode) {
          if (import.meta.env.DEV) {
            console.log("👤 Restaurando sesión de invitado...");
          }
          
          // Restaurar sesión de invitado
          const guestSession: Session = {
            access_token: "guest-token",
            refresh_token: "guest-refresh-token",
            expires_in: 3600,
            token_type: "bearer",
            user: GUEST_USER,
          };

          $session.set(guestSession);
          $user.set(GUEST_USER);
          
          // No limpiamos localStorage porque son los datos del invitado
        } else {
          clearLocalStorage();
        }
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
      if (import.meta.env.DEV) {
        console.log("Auth state changed:", event, session);
      }

      // Si estamos en modo invitado, ignorar eventos de sesión nula/signout
      // para evitar que se borre el estado local del invitado
      const isGuestMode = localStorage.getItem("guestMode") === "true";
      const currentUser = $user.get();
      
      if ((isGuestMode || currentUser?.id === "guest-user-id") && !session) {
        if (import.meta.env.DEV) {
          console.log("👤 Manteniendo sesión de invitado a pesar de evento de auth:", event);
        }
        // Asegurarnos que el usuario sigue seteado en el store si se perdió
        if (!$user.get()) {
           $user.set(GUEST_USER);
        }
        return;
      }

      // Permitir que OAuth complete el proceso incluso con email "deleted_"
      // La detección de cuentas eliminadas se maneja a nivel de perfil

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

    // Permitir login incluso con email "deleted_" para permitir reutilización de cuentas

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

// --- GUEST MODE ---
export const GUEST_USER: User = {
  id: "guest-user-id",
  app_metadata: { provider: "email" },
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "invitado@demo.local",
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
};

/**
 * Iniciar sesión como invitado (sin backend)
 */
export const loginAsGuest = async () => {
  try {
    $loading.set(true);
    $error.set(null);

    // Simular un pequeño delay para que se sienta natural
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Establecer usuario invitado
    const guestSession: Session = {
      access_token: "guest-token",
      refresh_token: "guest-refresh-token",
      expires_in: 3600,
      token_type: "bearer",
      user: GUEST_USER,
    };

    $session.set(guestSession);
    $user.set(GUEST_USER);

    // Limpiar datos previos para asegurar un estado limpio
    clearLocalStorage();
    
    // Marcar modo invitado para persistencia
    localStorage.setItem("guestMode", "true");
    
    return { success: true, user: GUEST_USER };
  } catch (error) {
    console.error("Error en login de invitado:", error);
    return { success: false, error: "Error al iniciar como invitado" };
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

    const user = $user.get();

    if (import.meta.env.DEV) {
      console.log("🔄 [LOGOUT] Iniciando proceso de cierre de sesión...");
      console.log("🔄 [LOGOUT] Usuario actual:", user?.email || "Sin email");
      console.log("🔄 [LOGOUT] Environment:", {
        isDev: import.meta.env.DEV,
        mode: import.meta.env.MODE,
        origin: typeof window !== "undefined" ? window.location.origin : "N/A",
      });
    }

    // Detectar si es usuario de GitHub OAuth
    const isGitHubUser =
      user &&
      (user.app_metadata?.provider === "github" ||
        user.user_metadata?.iss?.includes("github") ||
        user.email?.includes("github"));

    if (import.meta.env.DEV) {
      console.log("🔄 [LOGOUT] Es usuario de GitHub:", isGitHubUser);
    }

    // Cerrar sesión con scope global si es GitHub
    if (import.meta.env.DEV) {
      console.log("🔄 [LOGOUT] Llamando a supabase.auth.signOut()...");
    }
    const { error } = isGitHubUser
      ? await supabase.auth.signOut({ scope: "global" as const })
      : await supabase.auth.signOut();

    if (error) {
      console.error("❌ [LOGOUT] Error en Supabase signOut:", error);
      $error.set(error.message);
      return { success: false, error: error.message };
    }

    if (import.meta.env.DEV) {
      console.log("✅ [LOGOUT] Supabase signOut exitoso");
    }

    // Para GitHub, limpiar almacenamiento adicional
    if (isGitHubUser) {
      if (import.meta.env.DEV) {
        console.log("🔄 [LOGOUT] Limpiando datos relacionados con GitHub...");
      }
      // Limpiar localStorage relacionado con OAuth
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes("github") ||
            key.includes("oauth") ||
            key.includes("supabase"))
        ) {
          if (import.meta.env.DEV) {
            console.log("🔄 [LOGOUT] Removiendo key:", key);
          }
          localStorage.removeItem(key);
        }
      }
    }

    if (import.meta.env.DEV) {
      console.log("🔄 [LOGOUT] Limpiando localStorage y stores...");
    }
    // Limpiar localStorage al cerrar sesión (inmediatamente, no esperar listener)
    clearLocalStorage();
    localStorage.removeItem("guestMode");

    // Limpiar stores inmediatamente también
    $user.set(null);
    $session.set(null);

    if (import.meta.env.DEV) {
      console.log("✅ [LOGOUT] Sesión cerrada exitosamente");
    }
    return { success: true };
  } catch (error) {
    console.error("❌ [LOGOUT] Error al cerrar sesión:", error);

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

    // Llamar a la función RPC para eliminar la cuenta
    const { data, error } = await supabase.rpc("delete_user_account");

    if (error) {
      console.error("Error RPC al eliminar cuenta:", error);
      throw new Error(error.message || "Error al eliminar cuenta");
    }

    // Verificar respuesta de la función
    if (data && !data.success) {
      console.error("Error en función delete_user_account:", data.error);
      throw new Error(data.error || "Error al eliminar cuenta");
    }

    // Si llegamos aquí, la cuenta fue eliminada exitosamente
    // Detectar si es usuario de GitHub OAuth para cierre completo
    const isGitHubUser =
      user.app_metadata?.provider === "github" ||
      user.user_metadata?.iss?.includes("github") ||
      user.email?.includes("github");

    // Cerrar sesión de Supabase explícitamente con scope global si es GitHub
    const { error: signOutError } = isGitHubUser
      ? await supabase.auth.signOut({ scope: "global" as const })
      : await supabase.auth.signOut();
    if (signOutError) {
      console.warn("Error al cerrar sesión después de eliminar:", signOutError);
    }

    // Para GitHub, también limpiar cookies y redirigir para forzar logout completo
    if (isGitHubUser) {
      // Limpiar todas las cookies relacionadas con GitHub
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        if (
          name.includes("github") ||
          name.includes("oauth") ||
          name.includes("auth")
        ) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.github.com`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });

      // También limpiar localStorage relacionado con OAuth
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes("github") ||
            key.includes("oauth") ||
            key.includes("supabase"))
        ) {
          localStorage.removeItem(key);
        }
      }
    }

    // Limpiar datos locales
    clearLocalStorage();
    $user.set(null);
    $session.set(null);

    console.log("✅ Cuenta eliminada exitosamente");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error al eliminar cuenta";
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
