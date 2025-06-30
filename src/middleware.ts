import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

// Define rutas que requieren autenticación
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/settings(.*)",
]);

// Define rutas públicas específicas
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/public(.*)",
]);

export const onRequest = clerkMiddleware((auth, context) => {
  const { redirectToSignIn, userId } = auth();

  // Si el usuario no está autenticado y está intentando acceder a una ruta protegida
  if (!userId && isProtectedRoute(context.request)) {
    return redirectToSignIn();
  }

  // Permitir acceso a rutas públicas y usuarios autenticados
  return;
});
