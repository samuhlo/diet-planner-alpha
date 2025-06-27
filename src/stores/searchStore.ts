import { map, computed } from "nanostores";
import { $recipes } from "./recipesStore";
import { $supplements } from "./supplementsStore";
import type { Recipe, Supplement } from "../types";

// Definimos la estructura del estado de búsqueda
interface SearchState {
  query: string;
  filters: {
    type: string[];
    tags: string[];
    ingredients: string[];
    maxCalories: number | null;
    maxCarbs: number | null;
    minProtein: number | null;
    maxFat: number | null;
  };
  sortBy: "name" | "calories" | "protein" | "carbs" | "fat" | "relevance";
  sortDirection: "asc" | "desc";
  activeSearchType: "recipes" | "supplements" | "all";
}

// Inicializamos con un estado por defecto
export const $search = map<SearchState>({
  query: "",
  filters: {
    type: [],
    tags: [],
    ingredients: [],
    maxCalories: null,
    maxCarbs: null,
    minProtein: null,
    maxFat: null,
  },
  sortBy: "relevance",
  sortDirection: "desc",
  activeSearchType: "recipes",
});

/**
 * Actualiza la consulta de búsqueda
 * @param query - La consulta de búsqueda
 */
export function setSearchQuery(query: string) {
  $search.setKey("query", query);
}

/**
 * Actualiza los filtros de búsqueda
 * @param filters - Los filtros a aplicar
 */
export function updateFilters(filters: Partial<SearchState["filters"]>) {
  const currentFilters = $search.get().filters;
  $search.setKey("filters", { ...currentFilters, ...filters });
}

/**
 * Limpia todos los filtros
 */
export function clearFilters() {
  $search.setKey("filters", {
    type: [],
    tags: [],
    ingredients: [],
    maxCalories: null,
    maxCarbs: null,
    minProtein: null,
    maxFat: null,
  });
}

/**
 * Actualiza el criterio de ordenación
 * @param sortBy - El criterio de ordenación
 * @param direction - La dirección de ordenación
 */
export function setSorting(
  sortBy: SearchState["sortBy"],
  direction: "asc" | "desc" = "asc"
) {
  $search.setKey("sortBy", sortBy);
  $search.setKey("sortDirection", direction);
}

/**
 * Establece el tipo de búsqueda activa
 * @param type - El tipo de búsqueda
 */
export function setSearchType(type: "recipes" | "supplements" | "all") {
  $search.setKey("activeSearchType", type);
}

// Store computada para recetas filtradas
export const $filteredRecipes = computed(
  [$recipes, $search],
  (recipes, searchState) => {
    let filtered = [...recipes];

    // Aplicar filtro de búsqueda por texto
    if (searchState.query) {
      const query = searchState.query.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(query) ||
          recipe.description?.toLowerCase().includes(query) ||
          recipe.ingredients.some((ing: any) =>
            ing.name.toLowerCase().includes(query)
          )
      );
    }

    // Aplicar filtros de tipo
    if (searchState.filters.type.length > 0) {
      filtered = filtered.filter((recipe) =>
        searchState.filters.type.includes(recipe.type)
      );
    }

    // Aplicar filtros de etiquetas
    if (searchState.filters.tags.length > 0) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.tags &&
          searchState.filters.tags.some((tag: string) =>
            recipe.tags?.includes(tag)
          )
      );
    }

    // Aplicar filtros de ingredientes
    if (searchState.filters.ingredients.length > 0) {
      filtered = filtered.filter((recipe) =>
        searchState.filters.ingredients.some((ingredientName: string) =>
          recipe.ingredients.some((recipeIng: any) =>
            recipeIng.name.toLowerCase().includes(ingredientName.toLowerCase())
          )
        )
      );
    }

    // Aplicar filtros nutricionales
    if (searchState.filters.maxCalories) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.nutritionalInfo.calories <=
          (searchState.filters.maxCalories || Infinity)
      );
    }

    if (searchState.filters.maxCarbs) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.nutritionalInfo.carbs <=
          (searchState.filters.maxCarbs || Infinity)
      );
    }

    if (searchState.filters.minProtein) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.nutritionalInfo.protein >=
          (searchState.filters.minProtein || 0)
      );
    }

    if (searchState.filters.maxFat) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.nutritionalInfo.fat <= (searchState.filters.maxFat || Infinity)
      );
    }

    // Aplicar ordenación
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (searchState.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "calories":
          comparison = a.nutritionalInfo.calories - b.nutritionalInfo.calories;
          break;
        case "protein":
          comparison = a.nutritionalInfo.protein - b.nutritionalInfo.protein;
          break;
        case "carbs":
          comparison = a.nutritionalInfo.carbs - b.nutritionalInfo.carbs;
          break;
        case "fat":
          comparison = a.nutritionalInfo.fat - b.nutritionalInfo.fat;
          break;
        case "relevance":
        default:
          // Para relevancia, priorizamos coincidencias en el nombre
          if (searchState.query) {
            const queryLower = searchState.query.toLowerCase();
            const aNameMatch = a.name.toLowerCase().includes(queryLower);
            const bNameMatch = b.name.toLowerCase().includes(queryLower);

            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
          }
          break;
      }

      return searchState.sortDirection === "asc" ? comparison : -comparison;
    });

    return filtered;
  }
);

// Store computada para suplementos filtrados
export const $filteredSupplements = computed(
  [$supplements, $search],
  (supplements, searchState) => {
    let filtered = [...supplements];

    // Aplicar filtro de búsqueda por texto
    if (searchState.query) {
      const query = searchState.query.toLowerCase();
      filtered = filtered.filter(
        (supplement) =>
          supplement.name.toLowerCase().includes(query) ||
          supplement.description?.toLowerCase().includes(query)
      );
    }

    // Aplicar filtros de etiquetas si existen
    if (searchState.filters.tags.length > 0) {
      filtered = filtered.filter(
        (supplement) =>
          supplement.tags &&
          searchState.filters.tags.some((tagName: string) =>
            supplement.tags?.includes(tagName)
          )
      );
    }

    // Ordenar por nombre o relevancia
    filtered.sort((a, b) => {
      if (searchState.sortBy === "name") {
        const comparison = a.name.localeCompare(b.name);
        return searchState.sortDirection === "asc" ? comparison : -comparison;
      }

      // Para relevancia, priorizamos coincidencias en el nombre
      if (searchState.query) {
        const queryLower = searchState.query.toLowerCase();
        const aNameMatch = a.name.toLowerCase().includes(queryLower);
        const bNameMatch = b.name.toLowerCase().includes(queryLower);

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
      }

      return 0;
    });

    return filtered;
  }
);

// Store computada para resultados combinados (recetas y suplementos)
export const $searchResults = computed(
  [$filteredRecipes, $filteredSupplements, $search],
  (recipes, supplements, searchState) => {
    switch (searchState.activeSearchType) {
      case "recipes":
        return { recipes, supplements: [] };
      case "supplements":
        return { recipes: [], supplements };
      case "all":
      default:
        return { recipes, supplements };
    }
  }
);

/**
 * Obtiene el número total de resultados de búsqueda
 */
export function getTotalResultsCount(): number {
  const results = $searchResults.get();
  return results.recipes.length + results.supplements.length;
}

/**
 * Obtiene los resultados de búsqueda paginados
 * @param page - Número de página
 * @param pageSize - Tamaño de página
 */
export function getPaginatedResults(
  page: number = 1,
  pageSize: number = 10
): {
  recipes: Recipe[];
  supplements: Supplement[];
  totalPages: number;
  currentPage: number;
} {
  const results = $searchResults.get();
  const totalItems = results.recipes.length + results.supplements.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;

  // Si solo tenemos un tipo de resultados, es simple
  if (results.recipes.length === 0) {
    return {
      recipes: [],
      supplements: results.supplements.slice(startIdx, endIdx),
      totalPages,
      currentPage: page,
    };
  }

  if (results.supplements.length === 0) {
    return {
      recipes: results.recipes.slice(startIdx, endIdx),
      supplements: [],
      totalPages,
      currentPage: page,
    };
  }

  // Si tenemos ambos tipos, necesitamos mezclarlos manteniendo el orden de relevancia
  const allItems = [
    ...results.recipes.map((r) => ({ type: "recipe" as const, item: r })),
    ...results.supplements.map((s) => ({
      type: "supplement" as const,
      item: s,
    })),
  ];

  // Ordenar por relevancia (esto es simplificado, puedes ajustarlo según tus necesidades)
  const sortBy = $search.get().sortBy;
  const sortDir = $search.get().sortDirection;

  if (sortBy === "name") {
    allItems.sort((a, b) => {
      const comparison = a.item.name.localeCompare(b.item.name);
      return sortDir === "asc" ? comparison : -comparison;
    });
  }

  const paginatedItems = allItems.slice(startIdx, endIdx);

  return {
    recipes: paginatedItems
      .filter((item) => item.type === "recipe")
      .map((item) => item.item as Recipe),
    supplements: paginatedItems
      .filter((item) => item.type === "supplement")
      .map((item) => item.item as Supplement),
    totalPages,
    currentPage: page,
  };
}
