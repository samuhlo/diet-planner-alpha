import { map } from "nanostores";
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
