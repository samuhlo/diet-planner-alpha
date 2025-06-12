import type { Recipe } from "../types";

/**
 * Obtiene todas las recetas de un tipo específico
 */
export const getRecipesByType = (
  recipes: Recipe[],
  type: Recipe["tipo"]
): Recipe[] => {
  return recipes.filter((recipe) => recipe.tipo === type);
};

/**
 * Obtiene todas las recetas que contengan un tag específico
 */
export const getRecipesByTag = (recipes: Recipe[], tag: string): Recipe[] => {
  return recipes.filter((recipe) => recipe.tags.includes(tag));
};

/**
 * Busca recetas por nombre o tags
 */
export const searchRecipes = (recipes: Recipe[], query: string): Recipe[] => {
  const lowercaseQuery = query.toLowerCase();
  return recipes.filter(
    (recipe) =>
      recipe.nombre.toLowerCase().includes(lowercaseQuery) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};

/**
 * Obtiene todas las recetas de una fuente específica
 */
export const getRecipesBySource = (
  recipes: Recipe[],
  sourceId: string
): Recipe[] => {
  return recipes.filter((recipe) => recipe.source?.id === sourceId);
};

/**
 * Obtiene todas las fuentes únicas de las recetas
 */
export const getUniqueSources = (recipes: Recipe[]) => {
  const sources = recipes
    .map((recipe) => recipe.source)
    .filter(
      (source): source is NonNullable<typeof source> => source !== undefined
    );

  return Array.from(
    new Map(sources.map((source) => [source.id, source])).values()
  );
};

/**
 * Calcula el total de calorías de una lista de ingredientes
 */
export const calculateTotalCalories = (recipes: Recipe[]): number => {
  return recipes.reduce((total, recipe) => total + recipe.calorias, 0);
};

/**
 * Obtiene todas las recetas ordenadas por calorías
 */
export const sortRecipesByCalories = (
  recipes: Recipe[],
  ascending = true
): Recipe[] => {
  return [...recipes].sort((a, b) => {
    return ascending ? a.calorias - b.calorias : b.calorias - a.calorias;
  });
};

/**
 * Obtiene recetas que coinciden con múltiples criterios
 */
export const filterRecipes = (
  recipes: Recipe[],
  filters: {
    type?: Recipe["tipo"];
    tags?: string[];
    maxCalories?: number;
    minProtein?: number;
    sourceId?: string;
  }
): Recipe[] => {
  return recipes.filter((recipe) => {
    if (filters.type && recipe.tipo !== filters.type) return false;
    if (filters.tags && !filters.tags.some((tag) => recipe.tags.includes(tag)))
      return false;
    if (filters.maxCalories && recipe.calorias > filters.maxCalories)
      return false;
    if (filters.minProtein && recipe.p < filters.minProtein) return false;
    if (filters.sourceId && recipe.source?.id !== filters.sourceId)
      return false;
    return true;
  });
};
