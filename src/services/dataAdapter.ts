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
 * Verifica si Supabase está disponible
 */
async function checkSupabaseAvailability(): Promise<boolean> {
  if (supabaseAvailable !== null) {
    return supabaseAvailable;
  }

  try {
    supabaseAvailable = await testSupabaseConnection();
    console.log(
      `🔗 Supabase ${
        supabaseAvailable ? "disponible" : "no disponible"
      } - usando datos ${supabaseAvailable ? "remotos" : "locales"}`
    );
    return supabaseAvailable;
  } catch (error) {
    console.warn("Error verificando conexión a Supabase:", error);
    supabaseAvailable = false;
    return false;
  }
}

/**
 * Fuerza el uso de datos locales (útil para desarrollo/testing)
 */
export function forceLocalData(force = true): void {
  useSupabase = !force;
  console.log(
    `🔧 Modo de datos cambiado a: ${useSupabase ? "Supabase" : "Local"}`
  );
}

/**
 * Obtiene las recetas - misma interfaz que allMeals
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
 * Obtiene los suplementos - misma interfaz que allSupplements
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
 * Obtiene los tips - misma interfaz que allTips
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
 * Obtiene los ingredientes - misma interfaz que extractedIngredients
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

/**
 * Obtiene un ingrediente por nombre - misma interfaz que getExtractedIngredientByName
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
 */
export async function preloadIngredientsCache(): Promise<void> {
  try {
    ingredientsCache = await getExtractedIngredients();
    console.log("✅ Cache de ingredientes precargado");
  } catch (error) {
    console.error("Error precargando cache de ingredientes:", error);
    ingredientsCache = localIngredients;
  }
}

/**
 * Obtiene las fuentes de recetas - por ahora mantiene datos locales
 * TODO: Migrar cuando sea necesario
 */
export function getRecipeSources() {
  return localRecipeSources;
}

/**
 * Función de conveniencia para obtener todos los datos
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
 * Obtiene estadísticas del sistema de datos
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
