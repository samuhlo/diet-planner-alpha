import type { Snack } from "../types";

/**
 * Obtiene todos los snacks de un tipo específico
 */
export const getSnacksByType = (
  snacks: Snack[],
  type: Snack["tipo"]
): Snack[] => {
  return snacks.filter((snack) => snack.tipo === type);
};

/**
 * Obtiene todos los snacks que contengan un tag específico
 */
export const getSnacksByTag = (snacks: Snack[], tag: string): Snack[] => {
  return snacks.filter((snack) => snack.tags.includes(tag));
};

/**
 * Busca snacks por nombre o tags
 */
export const searchSnacks = (snacks: Snack[], query: string): Snack[] => {
  const lowercaseQuery = query.toLowerCase();
  return snacks.filter(
    (snack) =>
      snack.nombre.toLowerCase().includes(lowercaseQuery) ||
      snack.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};

/**
 * Obtiene solo snacks simples
 */
export const getSimpleSnacks = (snacks: Snack[]): Snack[] => {
  return getSnacksByType(snacks, "simple");
};

/**
 * Obtiene solo snacks elaborados
 */
export const getElaboratedSnacks = (snacks: Snack[]): Snack[] => {
  return getSnacksByType(snacks, "elaborado");
};

/**
 * Calcula el total de calorías de una lista de snacks
 */
export const calculateTotalSnackCalories = (snacks: Snack[]): number => {
  return snacks.reduce((total, snack) => total + snack.calorias, 0);
};

/**
 * Obtiene todos los snacks ordenados por calorías
 */
export const sortSnacksByCalories = (
  snacks: Snack[],
  ascending = true
): Snack[] => {
  return [...snacks].sort((a, b) => {
    return ascending ? a.calorias - b.calorias : b.calorias - a.calorias;
  });
};

/**
 * Obtiene snacks que coinciden con múltiples criterios
 */
export const filterSnacks = (
  snacks: Snack[],
  filters: {
    type?: Snack["tipo"];
    tags?: string[];
    maxCalories?: number;
    minProtein?: number;
    maxCarbs?: number;
    maxFat?: number;
  }
): Snack[] => {
  return snacks.filter((snack) => {
    if (filters.type && snack.tipo !== filters.type) return false;
    if (filters.tags && !filters.tags.some((tag) => snack.tags.includes(tag)))
      return false;
    if (filters.maxCalories && snack.calorias > filters.maxCalories)
      return false;
    if (filters.minProtein && snack.p < filters.minProtein) return false;
    if (filters.maxCarbs && snack.c > filters.maxCarbs) return false;
    if (filters.maxFat && snack.f > filters.maxFat) return false;
    return true;
  });
};

/**
 * Obtiene snacks por categoría nutricional
 */
export const getSnacksByNutritionalCategory = (
  snacks: Snack[],
  category: "protein" | "carbs" | "fat" | "fiber"
): Snack[] => {
  return snacks.filter((snack) => {
    switch (category) {
      case "protein":
        return snack.p > 10; // Alto en proteínas
      case "carbs":
        return snack.c > 15; // Alto en carbohidratos
      case "fat":
        return snack.f > 8; // Alto en grasas
      case "fiber":
        return snack.tags.some((tag) => tag.toLowerCase().includes("fibra"));
      default:
        return false;
    }
  });
};

/**
 * Obtiene snacks recomendados para diferentes momentos del día
 */
export const getSnacksByTimeOfDay = (
  snacks: Snack[],
  timeOfDay: "morning" | "afternoon" | "evening" | "post-workout"
): Snack[] => {
  return snacks.filter((snack) => {
    switch (timeOfDay) {
      case "morning":
        return snack.tags.some((tag) =>
          ["Fruta", "Lácteo", "Natural"].includes(tag)
        );
      case "afternoon":
        return snack.tags.some((tag) =>
          ["Frutos secos", "Proteína", "Fibra"].includes(tag)
        );
      case "evening":
        return (
          snack.calorias < 150 &&
          snack.tags.some((tag) => ["Natural", "Verdura"].includes(tag))
        );
      case "post-workout":
        return snack.tags.some((tag) =>
          ["Proteína", "Post-entrenamiento"].includes(tag)
        );
      default:
        return false;
    }
  });
};
