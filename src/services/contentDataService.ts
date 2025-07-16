import { supabase } from "../lib/supabase";
import type { Recipe, Supplement, Tip } from "../types";
import type { ExtractedIngredient } from "../types/ingredients";

// Cache simple en memoria para optimizar rendimiento
const cache = {
  recipes: null as Recipe[] | null,
  supplements: null as Supplement[] | null,
  tips: null as Tip[] | null,
  ingredients: null as ExtractedIngredient[] | null,
  lastFetch: {
    recipes: 0,
    supplements: 0,
    tips: 0,
    ingredients: 0,
  },
};

// 5 minutos de cache
const CACHE_DURATION = 5 * 60 * 1000;

// ============ RECETAS ============

/**
 * Obtiene todas las recetas desde Supabase
 */
export const getRecipesFromSupabase = async (): Promise<Recipe[]> => {
  const now = Date.now();

  // Verificar cache
  if (cache.recipes && now - cache.lastFetch.recipes < CACHE_DURATION) {
    return cache.recipes;
  }

  try {
    const { data, error } = await supabase
      .from("recipes")
      .select(
        `
        *,
        recipe_sources(*)
      `
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error al obtener recetas:", error);
      return [];
    }

    // Convertir formato de Supabase al formato local
    const recipes: Recipe[] = (data || []).map((recipe) => ({
      id: recipe.id,
      nombre: recipe.nombre,
      name: recipe.name || recipe.nombre,
      tipo: recipe.tipo as Recipe["tipo"],
      tags: recipe.tags || [],
      calorias: recipe.calorias,
      p: recipe.p,
      c: recipe.c,
      f: recipe.f,
      ingredientes: recipe.ingredientes || [],
      preparacion: recipe.preparacion,
      description: recipe.description,
      source: recipe.recipe_sources
        ? {
            id: recipe.recipe_sources.id,
            name: recipe.recipe_sources.name,
            authors: recipe.recipe_sources.authors,
            type: recipe.recipe_sources.type,
            url: recipe.recipe_sources.url,
            year: recipe.recipe_sources.year,
          }
        : undefined,
    }));

    // Actualizar cache
    cache.recipes = recipes;
    cache.lastFetch.recipes = now;

    return recipes;
  } catch (error) {
    console.error("Error al obtener recetas desde Supabase:", error);
    return [];
  }
};

/**
 * Obtiene recetas filtradas por tipo
 */
export const getRecipesByType = async (
  tipo: Recipe["tipo"]
): Promise<Recipe[]> => {
  const allRecipes = await getRecipesFromSupabase();
  return allRecipes.filter((recipe) => recipe.tipo === tipo);
};

// ============ SUPLEMENTOS ============

/**
 * Obtiene todos los suplementos desde Supabase
 */
export const getSupplementsFromSupabase = async (): Promise<Supplement[]> => {
  const now = Date.now();

  // Verificar cache
  if (cache.supplements && now - cache.lastFetch.supplements < CACHE_DURATION) {
    return cache.supplements;
  }

  try {
    const { data, error } = await supabase
      .from("supplements")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error al obtener suplementos:", error);
      return [];
    }

    // Convertir formato de Supabase al formato local
    const supplements: Supplement[] = (data || []).map((supplement) => ({
      id: supplement.id,
      name: supplement.name,
      description: supplement.description,
      type: supplement.type,
      tags: supplement.tags || [],
      dosage: supplement.dosage,
      timing: supplement.timing,
      calories: supplement.calories,
      protein: supplement.protein,
      carbs: supplement.carbs,
      fat: supplement.fat,
      benefits: supplement.benefits || [],
      brand: supplement.brand,
      price: supplement.price,
      nutritionalInfo: {
        calories: supplement.calories,
        protein: supplement.protein,
        carbs: supplement.carbs,
        fat: supplement.fat,
      },
    }));

    // Actualizar cache
    cache.supplements = supplements;
    cache.lastFetch.supplements = now;

    return supplements;
  } catch (error) {
    console.error("Error al obtener suplementos desde Supabase:", error);
    return [];
  }
};

/**
 * Obtiene suplementos filtrados por tipo
 */
export const getSupplementsByType = async (
  type: string
): Promise<Supplement[]> => {
  const allSupplements = await getSupplementsFromSupabase();
  return allSupplements.filter((supplement) => supplement.type === type);
};

// ============ TIPS ============

/**
 * Obtiene todos los tips desde Supabase
 */
export const getTipsFromSupabase = async (): Promise<Tip[]> => {
  const now = Date.now();

  // Verificar cache
  if (cache.tips && now - cache.lastFetch.tips < CACHE_DURATION) {
    return cache.tips;
  }

  try {
    const { data, error } = await supabase
      .from("tips")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error al obtener tips:", error);
      return [];
    }

    // Convertir formato de Supabase al formato local
    const tips: Tip[] = (data || []).map((tip) => ({
      id: tip.id,
      title: tip.title,
      content: tip.content,
      tags: tip.tags || [],
    }));

    // Actualizar cache
    cache.tips = tips;
    cache.lastFetch.tips = now;

    return tips;
  } catch (error) {
    console.error("Error al obtener tips desde Supabase:", error);
    return [];
  }
};

/**
 * Obtiene tips filtrados por tag
 */
export const getTipsByTag = async (tag: string): Promise<Tip[]> => {
  const allTips = await getTipsFromSupabase();
  return allTips.filter((tip) => tip.tags?.includes(tag));
};

// ============ INGREDIENTES ============

/**
 * Obtiene todos los ingredientes desde Supabase
 */
export const getIngredientsFromSupabase = async (): Promise<
  ExtractedIngredient[]
> => {
  const now = Date.now();

  // Verificar cache
  if (cache.ingredients && now - cache.lastFetch.ingredients < CACHE_DURATION) {
    return cache.ingredients;
  }

  try {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error al obtener ingredientes:", error);
      return [];
    }

    // Convertir formato de Supabase al formato local
    const ingredients: ExtractedIngredient[] = (data || []).map(
      (ingredient) => ({
        id: ingredient.id,
        nombre: ingredient.nombre,
        categoria: ingredient.categoria,
        unidadBase: ingredient.unidad_base,
        precioPorUnidadBase: ingredient.precio_por_unidad_base,
        infoCompra: ingredient.info_compra,
        equivalencias: ingredient.equivalencias,
      })
    );

    // Actualizar cache
    cache.ingredients = ingredients;
    cache.lastFetch.ingredients = now;

    return ingredients;
  } catch (error) {
    console.error("Error al obtener ingredientes desde Supabase:", error);
    return [];
  }
};

/**
 * Obtiene ingredientes filtrados por categoría
 */
export const getIngredientsByCategory = async (
  categoria: string
): Promise<ExtractedIngredient[]> => {
  const allIngredients = await getIngredientsFromSupabase();
  return allIngredients.filter(
    (ingredient) => ingredient.categoria === categoria
  );
};

// ============ FUNCIONES DE UTILIDAD ============

/**
 * Limpia todo el cache
 */
export const clearContentCache = (): void => {
  cache.recipes = null;
  cache.supplements = null;
  cache.tips = null;
  cache.ingredients = null;
  cache.lastFetch = {
    recipes: 0,
    supplements: 0,
    tips: 0,
    ingredients: 0,
  };
};

/**
 * Obtiene estadísticas del cache
 */
export const getCacheStats = () => {
  const now = Date.now();
  return {
    recipes: {
      cached: !!cache.recipes,
      age: cache.lastFetch.recipes ? now - cache.lastFetch.recipes : null,
      count: cache.recipes?.length || 0,
    },
    supplements: {
      cached: !!cache.supplements,
      age: cache.lastFetch.supplements
        ? now - cache.lastFetch.supplements
        : null,
      count: cache.supplements?.length || 0,
    },
    tips: {
      cached: !!cache.tips,
      age: cache.lastFetch.tips ? now - cache.lastFetch.tips : null,
      count: cache.tips?.length || 0,
    },
    ingredients: {
      cached: !!cache.ingredients,
      age: cache.lastFetch.ingredients
        ? now - cache.lastFetch.ingredients
        : null,
      count: cache.ingredients?.length || 0,
    },
  };
};

/**
 * Verifica si Supabase está disponible y funcionando
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("id")
      .limit(1);

    return !error;
  } catch {
    return false;
  }
};
