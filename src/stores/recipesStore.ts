import { map, computed } from "nanostores";
import type { Recipe, Snack } from "../types";
import { getSnacksFromRecipes, assignIdsToRecipes } from "../utils/recipeUtils";
import { generateDessertsFromRecipes } from "../utils/selectorUtils";

// Definimos la estructura de nuestro estado
interface RecipesState {
  allRecipes: Recipe[];
  desserts: Recipe[];
  snacks: Snack[];
  isInitialized: boolean;
}

// Inicializamos con un estado vacío
export const $recipes = map<RecipesState>({
  allRecipes: [],
  desserts: [],
  snacks: [],
  isInitialized: false,
});

/**
 * Inicializa el store con todas las recetas
 */
export function initializeRecipes(rawRecipes: Recipe[]) {
  // Asignar IDs a todas las recetas
  const allRecipes = assignIdsToRecipes(rawRecipes);

  // Generar snacks desde las recetas
  const snacks = getSnacksFromRecipes(allRecipes);

  // Generar postres desde las recetas
  const desserts = generateDessertsFromRecipes(allRecipes);

  // Guardar todo en el store
  $recipes.set({
    allRecipes,
    desserts,
    snacks,
    isInitialized: true,
  });

  console.log("Store de recetas inicializado:", {
    totalRecipes: allRecipes.length,
    totalDesserts: desserts.length,
    totalSnacks: snacks.length,
  });

  // Imprimir IDs de los postres para depuración
  console.log(
    "IDs de los postres:",
    desserts.map((d) => d.id)
  );
}

/**
 * Busca una receta por ID
 */
export function findRecipeById(recipeId: string): Recipe | undefined {
  const { allRecipes } = $recipes.get();
  return allRecipes.find((recipe) => recipe.id === recipeId);
}

/**
 * Busca un postre por ID
 */
export function findDessertById(dessertId: string): Recipe | undefined {
  const { desserts, allRecipes } = $recipes.get();

  console.log(`Buscando postre con ID: ${dessertId}`);
  console.log(`Total de postres en store: ${desserts.length}`);
  console.log(`IDs de postres disponibles: ${desserts.map((d) => d.id)}`);

  // Primero buscar en la lista de postres
  const dessert = desserts.find((d) => d.id === dessertId);
  if (dessert) {
    console.log(`Postre encontrado en la lista de postres: ${dessert.nombre}`);
    return dessert;
  }

  // Si no se encuentra, buscar en todas las recetas
  const dessertRecipe = allRecipes.find((r) => r.id === dessertId);
  if (dessertRecipe) {
    console.log(
      `Postre encontrado en todas las recetas: ${dessertRecipe.nombre}`
    );
  } else {
    console.log(`No se encontró ningún postre con ID: ${dessertId}`);
  }

  return dessertRecipe;
}

/**
 * Busca un snack por ID
 */
export function findSnackById(snackId: string): Snack | undefined {
  const { snacks, allRecipes } = $recipes.get();

  // Primero buscar en la lista de snacks
  const snack = snacks.find((s) => s.id === snackId);
  if (snack) return snack;

  // Si no se encuentra, buscar en todas las recetas de tipo Snack
  const snackRecipe = allRecipes.find(
    (r) => r.id === snackId && r.tipo === "Snack"
  );

  // Si encontramos una receta de tipo Snack, convertirla al formato Snack
  if (snackRecipe) {
    return {
      id: snackRecipe.id,
      nombre: snackRecipe.nombre,
      tipo:
        snackRecipe.ingredientes && snackRecipe.ingredientes.length > 0
          ? "elaborado"
          : "simple",
      calorias: snackRecipe.calorias,
      p: snackRecipe.p,
      c: snackRecipe.c,
      f: snackRecipe.f,
      ingredientes: snackRecipe.ingredientes,
      preparacion: snackRecipe.preparacion,
      tags: snackRecipe.tags,
      porcion: "1 unidad",
    };
  }

  return undefined;
}

/**
 * Imprime el estado actual del store para depuración
 */
export function logStoreState(): void {
  const state = $recipes.get();

  console.log("=== ESTADO ACTUAL DEL STORE DE RECETAS ===");
  console.log(`Total de recetas: ${state.allRecipes.length}`);
  console.log(`Total de postres: ${state.desserts.length}`);
  console.log(`Total de snacks: ${state.snacks.length}`);

  console.log("IDs de los primeros 5 snacks:");
  state.snacks.slice(0, 5).forEach((snack) => {
    console.log(`- ${snack.id}: ${snack.nombre} (${snack.tipo})`);
  });

  console.log("IDs de los primeros 5 postres:");
  state.desserts.slice(0, 5).forEach((dessert) => {
    console.log(`- ${dessert.id}: ${dessert.nombre}`);
  });

  console.log("=== FIN DEL ESTADO ===");
}

// Store computada para recetas por tipo
export const $recipesByType = computed($recipes, (recipesState) => {
  const byType: Record<string, Recipe[]> = {};

  recipesState.allRecipes.forEach((recipe) => {
    if (!byType[recipe.tipo]) {
      byType[recipe.tipo] = [];
    }
    byType[recipe.tipo].push(recipe);
  });

  return byType;
});

// Store computada para recetas por tag
export const $recipesByTag = computed($recipes, (recipesState) => {
  const byTag: Record<string, Recipe[]> = {};

  recipesState.allRecipes.forEach((recipe) => {
    recipe.tags.forEach((tag) => {
      if (!byTag[tag]) {
        byTag[tag] = [];
      }
      byTag[tag].push(recipe);
    });
  });

  return byTag;
});

// Store computada para todos los tags únicos
export const $allTags = computed($recipes, (recipesState) => {
  const tags = new Set<string>();

  recipesState.allRecipes.forEach((recipe) => {
    recipe.tags.forEach((tag) => tags.add(tag));
  });

  return Array.from(tags).sort();
});

/**
 * Obtiene todos los tags de recetas disponibles
 */
export function getAllRecipeTags(): string[] {
  return $allTags.get();
}

/**
 * Obtiene todos los tipos de recetas disponibles
 */
export function getAllRecipeTypes(): string[] {
  const { allRecipes } = $recipes.get();
  const types = new Set<string>();

  allRecipes.forEach((recipe) => {
    types.add(recipe.tipo);
  });

  return Array.from(types).sort();
}

/**
 * Filtra recetas según múltiples criterios
 */
export function filterRecipes(criteria: {
  tipo?: string | string[];
  tags?: string[];
  minCalorias?: number;
  maxCalorias?: number;
  minProteina?: number;
  search?: string;
}): Recipe[] {
  const { allRecipes } = $recipes.get();

  return allRecipes.filter((recipe) => {
    // Filtrar por tipo
    if (criteria.tipo) {
      if (Array.isArray(criteria.tipo)) {
        if (!criteria.tipo.includes(recipe.tipo)) {
          return false;
        }
      } else if (recipe.tipo !== criteria.tipo) {
        return false;
      }
    }

    // Filtrar por tags (debe contener todos los tags especificados)
    if (criteria.tags && criteria.tags.length > 0) {
      if (!criteria.tags.every((tag) => recipe.tags.includes(tag))) {
        return false;
      }
    }

    // Filtrar por calorías mínimas
    if (
      criteria.minCalorias !== undefined &&
      recipe.calorias < criteria.minCalorias
    ) {
      return false;
    }

    // Filtrar por calorías máximas
    if (
      criteria.maxCalorias !== undefined &&
      recipe.calorias > criteria.maxCalorias
    ) {
      return false;
    }

    // Filtrar por proteína mínima
    if (criteria.minProteina !== undefined && recipe.p < criteria.minProteina) {
      return false;
    }

    // Filtrar por término de búsqueda
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      const matchesName = recipe.nombre.toLowerCase().includes(searchTerm);
      const matchesTags = recipe.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );

      if (!matchesName && !matchesTags) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Ordena recetas según un criterio específico
 */
export function sortRecipes(
  recipes: Recipe[],
  sortBy: "nombre" | "calorias" | "proteina" | "carbos" | "grasas" = "nombre",
  direction: "asc" | "desc" = "asc"
): Recipe[] {
  return [...recipes].sort((a, b) => {
    let valueA: number | string;
    let valueB: number | string;

    switch (sortBy) {
      case "nombre":
        valueA = a.nombre;
        valueB = b.nombre;
        break;
      case "calorias":
        valueA = a.calorias;
        valueB = b.calorias;
        break;
      case "proteina":
        valueA = a.p;
        valueB = b.p;
        break;
      case "carbos":
        valueA = a.c;
        valueB = b.c;
        break;
      case "grasas":
        valueA = a.f;
        valueB = b.f;
        break;
      default:
        valueA = a.nombre;
        valueB = b.nombre;
    }

    if (valueA < valueB) {
      return direction === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  });
}

/**
 * Obtiene recetas recomendadas basadas en objetivos nutricionales
 */
export function getRecommendedRecipes(
  targetCalories: number,
  targetProtein: number,
  mealType?: string,
  count: number = 5
): Recipe[] {
  const { allRecipes } = $recipes.get();

  // Filtrar por tipo de comida si se especifica
  let candidates = mealType
    ? allRecipes.filter((r) => r.tipo === mealType)
    : allRecipes;

  // Calcular puntuación para cada receta según qué tan bien se ajusta a los objetivos
  const scoredRecipes = candidates.map((recipe) => {
    // Calcular qué porcentaje de las calorías diarias representa esta receta
    const caloriePercentage = recipe.calorias / targetCalories;

    // Calcular qué porcentaje de la proteína diaria aporta esta receta
    const proteinPercentage = recipe.p / targetProtein;

    // Penalizar recetas que se alejan demasiado de los valores ideales
    // Idealmente, una comida principal debería ser ~30% de las calorías diarias
    const idealCaloriePercentage = 0.3;
    const calorieScore =
      1 - Math.abs(caloriePercentage - idealCaloriePercentage);

    // Idealmente, una comida principal debería aportar ~30% de la proteína diaria
    const idealProteinPercentage = 0.3;
    const proteinScore =
      1 - Math.abs(proteinPercentage - idealProteinPercentage);

    // Combinar puntuaciones (se puede ajustar la ponderación)
    const totalScore = calorieScore * 0.5 + proteinScore * 0.5;

    return {
      recipe,
      score: totalScore,
    };
  });

  // Ordenar por puntuación y tomar los N mejores
  return scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((item) => item.recipe);
}
