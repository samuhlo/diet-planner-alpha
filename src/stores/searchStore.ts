import { map, computed } from "nanostores";
import { $recipes } from "./recipesStore";
import type { Recipe } from "../types";
import type { Supplement } from "../types/supplements";

// Tipos para los filtros
export interface SearchFilters {
  searchTerm: string;
  categories: string[];
  tags: string[];
  minCalories: number | null;
  maxCalories: number | null;
  minProtein: number | null;
  maxProtein: number | null;
  sortBy: "name" | "calories" | "protein" | "carbs" | "fat";
  sortDirection: "asc" | "desc";
}

// Tipos para los resultados de búsqueda
export interface SearchResults<T> {
  items: T[];
  totalCount: number;
  filteredCount: number;
}

// Estado inicial para los filtros
const initialFilters: SearchFilters = {
  searchTerm: "",
  categories: [],
  tags: [],
  minCalories: null,
  maxCalories: null,
  minProtein: null,
  maxProtein: null,
  sortBy: "name",
  sortDirection: "asc",
};

// Estado principal de búsqueda
export const $searchFilters = map<SearchFilters>(initialFilters);

// Store para el historial de búsquedas
export const $searchHistory = map<string[]>([]);

// Función para actualizar el término de búsqueda
export function setSearchQuery(query: string) {
  updateFilters({ searchTerm: query });
  if (query.trim()) {
    addToSearchHistory(query);
  }
}

// Función para actualizar los filtros
export function updateFilters(filters: Partial<SearchFilters>) {
  $searchFilters.set({ ...$searchFilters.get(), ...filters });
}

// Función para resetear los filtros
export function resetFilters() {
  $searchFilters.set(initialFilters);
}

// Función para añadir una búsqueda al historial
export function addToSearchHistory(term: string) {
  if (!term.trim()) return;

  const history = $searchHistory.get();

  // Eliminar duplicados y añadir al principio
  const newHistory = [
    term,
    ...history.filter((item) => item.toLowerCase() !== term.toLowerCase()),
  ].slice(0, 10); // Mantener solo las 10 últimas búsquedas

  $searchHistory.set(newHistory);
}

// Función para limpiar el historial de búsquedas
export function clearSearchHistory() {
  $searchHistory.set([]);
}

// Función genérica para filtrar elementos
function filterItems<T>(
  items: T[],
  filters: SearchFilters,
  getters: {
    getName: (item: T) => string;
    getCalories: (item: T) => number;
    getProtein: (item: T) => number;
    getCarbs?: (item: T) => number;
    getFat?: (item: T) => number;
    getCategories?: (item: T) => string[];
    getTags?: (item: T) => string[];
    getDescription?: (item: T) => string;
  }
): T[] {
  return items.filter((item) => {
    // Filtrar por término de búsqueda
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const name = getters.getName(item).toLowerCase();
      const description = getters.getDescription
        ? getters.getDescription(item).toLowerCase()
        : "";
      const tags = getters.getTags
        ? getters.getTags(item).map((tag) => tag.toLowerCase())
        : [];

      const matchesSearch =
        name.includes(searchTerm) ||
        description.includes(searchTerm) ||
        tags.some((tag) => tag.includes(searchTerm));

      if (!matchesSearch) return false;
    }

    // Filtrar por categorías
    if (filters.categories.length > 0 && getters.getCategories) {
      const categories = getters.getCategories(item);
      if (
        !categories.some((category) => filters.categories.includes(category))
      ) {
        return false;
      }
    }

    // Filtrar por tags
    if (filters.tags.length > 0 && getters.getTags) {
      const tags = getters.getTags(item);
      if (!tags.some((tag) => filters.tags.includes(tag))) {
        return false;
      }
    }

    // Filtrar por calorías
    if (
      filters.minCalories !== null &&
      getters.getCalories(item) < filters.minCalories
    ) {
      return false;
    }
    if (
      filters.maxCalories !== null &&
      getters.getCalories(item) > filters.maxCalories
    ) {
      return false;
    }

    // Filtrar por proteínas
    if (
      filters.minProtein !== null &&
      getters.getProtein(item) < filters.minProtein
    ) {
      return false;
    }
    if (
      filters.maxProtein !== null &&
      getters.getProtein(item) > filters.maxProtein
    ) {
      return false;
    }

    return true;
  });
}

// Función genérica para ordenar elementos
function sortItems<T>(
  items: T[],
  sortBy: SearchFilters["sortBy"],
  sortDirection: SearchFilters["sortDirection"],
  getters: {
    getName: (item: T) => string;
    getCalories: (item: T) => number;
    getProtein: (item: T) => number;
    getCarbs?: (item: T) => number;
    getFat?: (item: T) => number;
  }
): T[] {
  return [...items].sort((a, b) => {
    let valueA: string | number;
    let valueB: string | number;

    switch (sortBy) {
      case "calories":
        valueA = getters.getCalories(a);
        valueB = getters.getCalories(b);
        break;
      case "protein":
        valueA = getters.getProtein(a);
        valueB = getters.getProtein(b);
        break;
      case "carbs":
        valueA = getters.getCarbs ? getters.getCarbs(a) : 0;
        valueB = getters.getCarbs ? getters.getCarbs(b) : 0;
        break;
      case "fat":
        valueA = getters.getFat ? getters.getFat(a) : 0;
        valueB = getters.getFat ? getters.getFat(b) : 0;
        break;
      case "name":
      default:
        valueA = getters.getName(a).toLowerCase();
        valueB = getters.getName(b).toLowerCase();
        break;
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}

// Store computado para resultados de búsqueda de recetas
export const $filteredRecipes = computed(
  [$recipes, $searchFilters],
  (recipes, filters): SearchResults<Recipe> => {
    if (!recipes.isInitialized) {
      return { items: [], totalCount: 0, filteredCount: 0 };
    }

    const allRecipes = recipes.allRecipes;

    // Aplicar filtros
    const filtered = filterItems(allRecipes, filters, {
      getName: (recipe) => recipe.nombre,
      getCalories: (recipe) => recipe.calorias,
      getProtein: (recipe) => recipe.p,
      getCarbs: (recipe) => recipe.c,
      getFat: (recipe) => recipe.f,
      getCategories: (recipe) => [recipe.tipo],
      getTags: (recipe) => recipe.tags || [],
      getDescription: (recipe) => recipe.description || "",
    });

    // Aplicar ordenamiento
    const sorted = sortItems(filtered, filters.sortBy, filters.sortDirection, {
      getName: (recipe) => recipe.nombre,
      getCalories: (recipe) => recipe.calorias,
      getProtein: (recipe) => recipe.p,
      getCarbs: (recipe) => recipe.c,
      getFat: (recipe) => recipe.f,
    });

    return {
      items: sorted,
      totalCount: allRecipes.length,
      filteredCount: sorted.length,
    };
  }
);

// Valor predeterminado para filteredSupplements - simplificado
export const $filteredSupplements = computed(
  [],
  (): SearchResults<Supplement> => {
    return { items: [], totalCount: 0, filteredCount: 0 };
  }
);

// Obtener todas las categorías disponibles de recetas
export const $availableRecipeCategories = computed($recipes, (recipes) => {
  if (!recipes.isInitialized) return [];

  const categories = new Set<string>();
  recipes.allRecipes.forEach((recipe) => {
    categories.add(recipe.tipo);
  });

  return Array.from(categories).sort();
});

// Obtener todos los tags disponibles de recetas
export const $availableRecipeTags = computed($recipes, (recipes) => {
  if (!recipes.isInitialized) return [];

  const tags = new Set<string>();
  recipes.allRecipes.forEach((recipe) => {
    if (recipe.tags) {
      recipe.tags.forEach((tag) => tags.add(tag));
    }
  });

  return Array.from(tags).sort();
});

// Estadísticas de búsqueda - simplificado
export const $searchStats = computed([$filteredRecipes], (recipes) => {
  return {
    totalResults: recipes.filteredCount,
    recipeResults: recipes.filteredCount,
  };
});
