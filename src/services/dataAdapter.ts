import {
  getRecipesFromSupabase,
  getSupplementsFromSupabase,
  getTipsFromSupabase,
  getIngredientsFromSupabase,
  testSupabaseConnection,
  clearContentCache,
} from "./contentDataService";

// Importar datos locales como fallback
import { allMeals as localMeals } from "../data/recipes";
import { allSupplements as localSupplements } from "../data/supplements";
import { allTips as localTips } from "../data/tips";
import { extractedIngredients as localIngredients } from "../data/ingredients";
import { recipeSources as localRecipeSources } from "../data/recipeSources";

import type { Recipe, Supplement, Tip } from "../types";
import type { ExtractedIngredient } from "../types/ingredients";

// Flag para controlar si usar Supabase o datos locales
let useSupabase = true;
let supabaseAvailable: boolean | null = null;

/**
 * Verifica si Supabase está disponible y accesible
 * Cachea el resultado para evitar múltiples verificaciones
 * @returns {Promise<boolean>} True si Supabase está disponible
 */
async function checkSupabaseAvailability(): Promise<boolean> {
  if (supabaseAvailable !== null) {
    return supabaseAvailable;
  }

  try {
    supabaseAvailable = await testSupabaseConnection();
    if (import.meta.env.DEV) {
      console.log(
        `🔗 Supabase ${
          supabaseAvailable ? "disponible" : "no disponible"
        } - usando datos ${supabaseAvailable ? "remotos" : "locales"}`
      );
    }
    return supabaseAvailable;
  } catch (error) {
    console.warn("Error verificando conexión a Supabase:", error);
    supabaseAvailable = false;
    return false;
  }
}

/**
 * Fuerza el uso de datos locales (útil para desarrollo/testing)
 * @param {boolean} [force=true] - Si es true, fuerza el uso de datos locales
 */
export function forceLocalData(force = true): void {
  useSupabase = !force;
  console.log(
    `🔧 Modo de datos cambiado a: ${useSupabase ? "Supabase" : "Local"}`
  );
}

/**
 * Limpiar cache de ingredientes (útil al cerrar sesión)
 * Resetea el estado de carga y el cache en memoria
 */
export function clearIngredientsCache(): void {
  ingredientsCache = null;
  isCacheLoading = false;
  if (import.meta.env.DEV) {
    console.log("🧹 Cache de ingredientes limpiado");
  }
}

/**
 * Obtiene todas las recetas disponibles
 * Intenta obtener de Supabase, con fallback a datos locales
 * @returns {Promise<Recipe[]>} Lista de recetas
 */
export async function getAllMeals(): Promise<Recipe[]> {
  if (!useSupabase) {
    return localMeals;
  }

  const isAvailable = await checkSupabaseAvailability();
  if (!isAvailable) {
    console.warn("⚠️ Supabase no disponible, usando datos locales");
    return localMeals;
  }

  try {
    const recipes = await getRecipesFromSupabase();
    return recipes.length > 0 ? recipes : localMeals;
  } catch (error) {
    console.error(
      "Error obteniendo recetas de Supabase, usando locales:",
      error
    );
    return localMeals;
  }
}

/**
 * Obtiene todos los suplementos disponibles
 * Intenta obtener de Supabase, con fallback a datos locales
 * @returns {Promise<Supplement[]>} Lista de suplementos
 */
export async function getAllSupplements(): Promise<Supplement[]> {
  if (!useSupabase) {
    return localSupplements;
  }

  const isAvailable = await checkSupabaseAvailability();
  if (!isAvailable) {
    console.warn("⚠️ Supabase no disponible, usando datos locales");
    return localSupplements;
  }

  try {
    const supplements = await getSupplementsFromSupabase();
    return supplements.length > 0 ? supplements : localSupplements;
  } catch (error) {
    console.error(
      "Error obteniendo suplementos de Supabase, usando locales:",
      error
    );
    return localSupplements;
  }
}

/**
 * Obtiene todos los consejos (tips) disponibles
 * Intenta obtener de Supabase, con fallback a datos locales
 * @returns {Promise<Tip[]>} Lista de consejos
 */
export async function getAllTips(): Promise<Tip[]> {
  if (!useSupabase) {
    return localTips;
  }

  const isAvailable = await checkSupabaseAvailability();
  if (!isAvailable) {
    console.warn("⚠️ Supabase no disponible, usando datos locales");
    return localTips;
  }

  try {
    const tips = await getTipsFromSupabase();
    return tips.length > 0 ? tips : localTips;
  } catch (error) {
    console.error("Error obteniendo tips de Supabase, usando locales:", error);
    return localTips;
  }
}

/**
 * Obtiene la base de datos de ingredientes extraídos
 * Intenta obtener de Supabase, con fallback a datos locales
 * @returns {Promise<ExtractedIngredient[]>} Lista de ingredientes
 */
export async function getExtractedIngredients(): Promise<
  ExtractedIngredient[]
> {
  if (!useSupabase) {
    return localIngredients;
  }

  const isAvailable = await checkSupabaseAvailability();
  if (!isAvailable) {
    console.warn("⚠️ Supabase no disponible, usando datos locales");
    return localIngredients;
  }

  try {
    const ingredients = await getIngredientsFromSupabase();
    return ingredients.length > 0 ? ingredients : localIngredients;
  } catch (error) {
    console.error(
      "Error obteniendo ingredientes de Supabase, usando locales:",
      error
    );
    return localIngredients;
  }
}

/**
 * Función auxiliar para normalizar nombres de ingredientes
 * Elimina acentos, caracteres especiales y espacios extra
 * @param {string} nombre - Nombre a normalizar
 * @returns {string} Nombre normalizado
 */
function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Cache de ingredientes para acceso síncrono
let ingredientsCache: ExtractedIngredient[] | null = null;
let isCacheLoading = false;

/**
 * Obtiene un ingrediente por nombre de forma asíncrona
 * @param {string} nombre - Nombre del ingrediente a buscar
 * @returns {Promise<ExtractedIngredient | undefined>} El ingrediente encontrado o undefined
 */
export async function getExtractedIngredientByName(
  nombre: string
): Promise<ExtractedIngredient | undefined> {
  const ingredients = await getExtractedIngredients();
  const nombreNormalizado = normalizarNombre(nombre);
  return ingredients.find(
    (ing) => normalizarNombre(ing.nombre) === nombreNormalizado
  );
}

/**
 * Versión síncrona para componentes que necesitan acceso inmediato
 * Usa cache local o datos locales como fallback
 * @param {string} nombre - Nombre del ingrediente a buscar
 * @returns {ExtractedIngredient | undefined} El ingrediente encontrado o undefined
 */
export function getExtractedIngredientByNameSync(
  nombre: string
): ExtractedIngredient | undefined {
  // Si tenemos cache, usarlo
  if (ingredientsCache) {
    const nombreNormalizado = normalizarNombre(nombre);
    return ingredientsCache.find(
      (ing) => normalizarNombre(ing.nombre) === nombreNormalizado
    );
  }

  // Fallback a datos locales
  const nombreNormalizado = normalizarNombre(nombre);
  return localIngredients.find(
    (ing) => normalizarNombre(ing.nombre) === nombreNormalizado
  );
}

/**
 * Precargar ingredientes en cache para acceso síncrono
 * Se debe llamar al inicio de la aplicación
 * @returns {Promise<void>}
 */
export async function preloadIngredientsCache(): Promise<void> {
  // Evitar múltiples cargas del cache
  if (isCacheLoading || ingredientsCache) {
    if (import.meta.env.DEV && !ingredientsCache) {
      console.log("⏭️ Cache de ingredientes ya se está cargando...");
    }
    return;
  }

  try {
    isCacheLoading = true;
    ingredientsCache = await getExtractedIngredients();
    if (import.meta.env.DEV) {
      console.log("✅ Cache de ingredientes precargado");
    }
  } catch (error) {
    console.error("Error precargando cache de ingredientes:", error);
    ingredientsCache = localIngredients;
  } finally {
    isCacheLoading = false;
  }
}

/**
 * Obtiene las fuentes de recetas
 * Por ahora mantiene datos locales
 * @returns {any} Fuentes de recetas
 */
export function getRecipeSources() {
  return localRecipeSources;
}

/**
 * Función de conveniencia para obtener todos los datos del sistema
 * Realiza cargas en paralelo para optimizar rendimiento
 * @returns {Promise<Object>} Objeto con todos los datos y estadísticas
 */
export async function getAllContentData() {
  const [meals, supplements, tips, ingredients] = await Promise.all([
    getAllMeals(),
    getAllSupplements(),
    getAllTips(),
    getExtractedIngredients(),
  ]);

  return {
    allMeals: meals,
    allSupplements: supplements,
    allTips: tips,
    extractedIngredients: ingredients,
    recipeSources: getRecipeSources(),
    // Estadísticas
    stats: {
      recipes: meals.length,
      supplements: supplements.length,
      tips: tips.length,
      ingredients: ingredients.length,
      source: useSupabase && supabaseAvailable ? "supabase" : "local",
    },
  };
}

/**
 * Refresca todos los datos (útil después de actualizaciones)
 * Limpia caches y fuerza una nueva carga desde el origen
 * @returns {Promise<void>}
 */
export async function refreshAllData(): Promise<void> {
  console.log("🔄 Refrescando datos...");

  // Limpiar cache
  clearContentCache();

  // Resetear verificación de Supabase
  supabaseAvailable = null;

  // Pre-cargar datos nuevos
  await getAllContentData();

  console.log("✅ Datos refrescados");
}

/**
 * Obtiene estadísticas del sistema de datos y estado de conexión
 * @returns {Promise<Object>} Estado de la conexión y origen de datos
 */
export async function getDataStats() {
  const isAvailable = await checkSupabaseAvailability();

  return {
    supabaseAvailable: isAvailable,
    useSupabase,
    currentSource: useSupabase && isAvailable ? "supabase" : "local",
    lastCheck: new Date().toISOString(),
  };
}
