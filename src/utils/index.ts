/**
 * Utilidades principales de la aplicación
 *
 * Este archivo centraliza las utilidades más utilizadas
 * para facilitar las importaciones y mantener la organización
 */

// Utilidades para recetas
export {
  getSnacksFromRecipes,
  assignIdsToRecipes,
  getCalorieColor,
  getProteinColor,
} from "./recipeUtils";

// Utilidades para ingredientes y formateo
export {
  formatIngredient,
  formatEuro,
  calculateRecipePrice,
  isOptionalIngredient,
  calculateIngredientPrice,
} from "./ingredientFormatter";

// Utilidades para selectores
export {
  generateDessertsFromRecipes,
  SELECTOR_CONFIG,
  ITEM_ACCESSORS,
  getSelectedItems,
  getSelectorEnabled,
  getPlanItems,
  createSupplementPlan,
} from "./selectorUtils";

export type { SelectorType } from "./selectorUtils";
