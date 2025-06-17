// Archivo de índice para exportar todas las utilidades de forma organizada

// Utilidades de recetas
export {
  getRecipesByType,
  searchRecipes,
  filterRecipes,
  getSnacksFromRecipes,
} from "./recipeUtils";

// Utilidades de suplementos
export {
  getSupplementsByTag,
  searchSupplements,
  getSupplementsWithCalories,
  getSupplementsWithoutCalories,
  getSupplementsWithProtein,
  calculateTotalSupplementCalories,
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
  getRandomTips,
  getTipsByCategory,
} from "./tipUtils";
