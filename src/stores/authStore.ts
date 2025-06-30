import { map, computed } from "nanostores";

// Tipos para el estado de autenticación
export interface AuthState {
  isSignedIn: boolean;
  userId: string | null;
  user: any | null; // Aquí irán los datos del usuario de Clerk
  isLoading: boolean;
}

// Estado inicial
const initialAuthState: AuthState = {
  isSignedIn: false,
  userId: null,
  user: null,
  isLoading: true,
};

// Store principal de autenticación
export const $authState = map<AuthState>(initialAuthState);

// Acciones para actualizar el estado
export const setAuthState = (authData: Partial<AuthState>) => {
  const currentState = $authState.get();
  $authState.set({ ...currentState, ...authData });
};

export const setUser = (user: any) => {
  const currentState = $authState.get();
  $authState.set({
    ...currentState,
    user,
    userId: user?.id || null,
    isSignedIn: !!user,
    isLoading: false,
  });
};

export const clearAuth = () => {
  $authState.set({
    isSignedIn: false,
    userId: null,
    user: null,
    isLoading: false,
  });
};

// Stores computadas
export const $isSignedIn = computed($authState, (state) => state.isSignedIn);
export const $currentUser = computed($authState, (state) => state.user);
export const $isAuthLoading = computed($authState, (state) => state.isLoading);

// Función para inicializar el estado de autenticación
// Esta se llamará desde el layout o componentes principales
export const initializeAuth = () => {
  // En el contexto del cliente, podemos acceder a la información de Clerk
  if (typeof window !== "undefined") {
    // Aquí se integrará con los stores de Clerk cuando esté disponible
    // Por ahora, marcamos como no cargando
    setAuthState({ isLoading: false });
  }
};
