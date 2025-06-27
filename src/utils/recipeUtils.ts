import type { Recipe, Snack } from "../types";
import { allMeals } from "../data/recipes";

/**
 * Obtiene todas las recetas de tipo Snack y las convierte al formato Snack
 */
export const getSnacksFromRecipes = (recipes: Recipe[]): Snack[] => {
  const snackRecipes = recipes.filter((recipe) => recipe.tipo === "Snack");

  console.log(
    `Generando snacks desde ${snackRecipes.length} recetas de tipo Snack`
  );

  return snackRecipes.map((recipe) => {
    // Determinar si es un snack elaborado o simple basado en si tiene ingredientes
    const tipoSnack =
      recipe.ingredientes && recipe.ingredientes.length > 0
        ? "elaborado"
        : "simple";

    console.log(`Snack ${recipe.nombre} (${recipe.id}) - Tipo: ${tipoSnack}`);

    return {
      id: recipe.id || recipe.nombre.toLowerCase().replace(/\s+/g, "-"),
      nombre: recipe.nombre,
      tipo: tipoSnack,
      calorias: recipe.calorias,
      p: recipe.p,
      c: recipe.c,
      f: recipe.f,
      ingredientes: recipe.ingredientes,
      preparacion: recipe.preparacion,
      tags: recipe.tags,
      porcion: "1 unidad",
    };
  });
};

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
export function getRecipesByTag(recipes: Recipe[], tag: string): Recipe[] {
  return recipes.filter((recipe) => recipe.tags.includes(tag));
}

/**
 * Busca recetas por nombre o tags
 */
export const searchRecipes = (recipes: Recipe[], query: string): Recipe[] => {
  const term = query.toLowerCase();
  return recipes.filter(
    (recipe) =>
      recipe.nombre.toLowerCase().includes(term) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(term))
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
export const getUniqueSources = (recipes: Recipe[]): string[] => {
  const sources = recipes
    .filter((recipe) => recipe.source)
    .map((recipe) => recipe.source!.id);
  return [...new Set(sources)];
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
    tipo?: string;
    tags?: string[];
    minCalorias?: number;
    maxCalorias?: number;
    sourceId?: string;
  }
): Recipe[] => {
  return recipes.filter((recipe) => {
    // Filtrar por tipo
    if (filters.tipo && recipe.tipo !== filters.tipo) {
      return false;
    }

    // Filtrar por tags (debe contener todos los tags especificados)
    if (
      filters.tags &&
      filters.tags.length > 0 &&
      !filters.tags.every((tag) => recipe.tags.includes(tag))
    ) {
      return false;
    }

    // Filtrar por calorías mínimas
    if (
      filters.minCalorias !== undefined &&
      recipe.calorias < filters.minCalorias
    ) {
      return false;
    }

    // Filtrar por calorías máximas
    if (
      filters.maxCalorias !== undefined &&
      recipe.calorias > filters.maxCalorias
    ) {
      return false;
    }

    // Filtrar por fuente
    if (
      filters.sourceId &&
      (!recipe.source || recipe.source.id !== filters.sourceId)
    ) {
      return false;
    }

    return true;
  });
};

/**
 * Obtiene todos los tags únicos de todas las recetas
 */
export function getAllUniqueTags(recipes: Recipe[]): string[] {
  const allTags = recipes.flatMap((recipe) => recipe.tags);
  return [...new Set(allTags)].sort();
}

/**
 * Obtiene todos los tipos únicos de todas las recetas
 */
export function getAllUniqueTypes(recipes: Recipe[]): string[] {
  const allTypes = recipes.map((recipe) => recipe.tipo);
  return [...new Set(allTypes)].sort();
}

/**
 * Obtiene el color de la etiqueta de calorías
 */
export const getCalorieColor = (calories: number) => {
  if (calories < 300) return "text-green-600";
  if (calories < 500) return "text-yellow-600";
  return "text-red-600";
};

/**
 * Obtiene el color de la etiqueta de proteínas
 */
export const getProteinColor = (protein: number) => {
  if (protein >= 30) return "text-green-600";
  if (protein >= 20) return "text-yellow-600";
  return "text-red-600";
};

/**
 * Obtiene el color de la etiqueta de tipo
 */
export const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case "Desayuno":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Almuerzo":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Cena":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Función para asignar IDs a las recetas si no los tienen
export function assignIdsToRecipes(recipes: Recipe[]): Recipe[] {
  const recipesWithIds = recipes.map((recipe) => {
    if (!recipe.id) {
      const newId = recipe.nombre.toLowerCase().replace(/\s+/g, "-");
      return {
        ...recipe,
        id: newId,
      };
    }
    return recipe;
  });

  // Verificar que todas las recetas tienen IDs únicos
  const idCounts: Record<string, number> = {};
  recipesWithIds.forEach((recipe) => {
    idCounts[recipe.id] = (idCounts[recipe.id] || 0) + 1;
  });

  // Identificar IDs duplicados
  const duplicateIds = Object.entries(idCounts)
    .filter(([_, count]) => count > 1)
    .map(([id]) => id);

  if (duplicateIds.length > 0) {
    console.warn("¡Atención! Se encontraron IDs duplicados:", duplicateIds);

    // Corregir IDs duplicados añadiendo un número al final
    let fixedRecipes = [...recipesWithIds];
    duplicateIds.forEach((duplicateId) => {
      let counter = 1;
      fixedRecipes = fixedRecipes.map((recipe) => {
        if (recipe.id === duplicateId) {
          if (counter > 1) {
            const newId = `${duplicateId}-${counter}`;
            return { ...recipe, id: newId };
          }
          counter++;
        }
        return recipe;
      });
    });

    return fixedRecipes;
  }

  return recipesWithIds;
}
