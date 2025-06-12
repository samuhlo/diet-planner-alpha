// Archivo de índice para exportar todas las utilidades de forma organizada

// Utilidades de recetas
export {
  getRecipesByType,
  getRecipesByTag,
  searchRecipes,
  getRecipesBySource,
  getUniqueSources,
  calculateTotalCalories,
  sortRecipesByCalories,
  filterRecipes,
} from "./recipeUtils";

// Utilidades de snacks
export {
  getSnacksByType,
  getSnacksByTag,
  searchSnacks,
  getSimpleSnacks,
  getElaboratedSnacks,
  calculateTotalSnackCalories,
  sortSnacksByCalories,
  filterSnacks,
  getSnacksByNutritionalCategory,
  getSnacksByTimeOfDay,
} from "./snackUtils";

// Utilidades de suplementos
export {
  getSupplementsByTag,
  searchSupplements,
  getSupplementsWithCalories,
  getSupplementsWithoutCalories,
  getSupplementsWithProtein,
  calculateTotalSupplementCalories,
  calculateTotalSupplementProtein,
  sortSupplementsByCalories,
  sortSupplementsByProtein,
  filterSupplements,
  getSupplementsByCategory,
  getSupplementsByGoal,
} from "./supplementUtils";

// Utilidades de tips
export {
  getTipsByTag,
  searchTips,
  getTipsByCategory,
  getRandomTips,
  getTipsByRelevance,
  getTipsByTimeOfDay,
  getTipsByGoal,
  getUniqueTipTags,
  getTipsByKeywords,
} from "./tipUtils";

// Otras utilidades (si las hay)
// export { ... } from "./otherUtils";
