import type { Supplement } from "../types";

/**
 * Obtiene suplementos por tag específico
 */
export const getSupplementsByTag = (
  supplements: Supplement[],
  tag: string
): Supplement[] => {
  return supplements.filter(
    (supplement) => supplement.tags?.includes(tag) || false
  );
};

/**
 * Busca suplementos por nombre o tags
 */
export const searchSupplements = (
  supplements: Supplement[],
  query: string
): Supplement[] => {
  const lowercaseQuery = query.toLowerCase();
  return supplements.filter(
    (supplement) =>
      supplement.name.toLowerCase().includes(lowercaseQuery) ||
      supplement.description?.toLowerCase().includes(lowercaseQuery) ||
      supplement.tags?.some((tag) =>
        tag.toLowerCase().includes(lowercaseQuery)
      ) ||
      false
  );
};

/**
 * Obtiene suplementos con calorías
 */
export const getSupplementsWithCalories = (
  supplements: Supplement[]
): Supplement[] => {
  return supplements.filter((supplement) => supplement.calories > 0);
};

/**
 * Obtiene suplementos sin calorías
 */
export const getSupplementsWithoutCalories = (
  supplements: Supplement[]
): Supplement[] => {
  return supplements.filter((supplement) => supplement.calories === 0);
};

/**
 * Obtiene suplementos con proteína
 */
export const getSupplementsWithProtein = (
  supplements: Supplement[]
): Supplement[] => {
  return supplements.filter((supplement) => supplement.protein > 0);
};

/**
 * Calcula el total de calorías de una lista de suplementos
 */
export const calculateTotalSupplementCalories = (
  supplements: Supplement[]
): number => {
  return supplements.reduce(
    (total, supplement) => total + supplement.calories,
    0
  );
};

/**
 * Calcula el total de proteína de una lista de suplementos
 */
export const calculateTotalSupplementProtein = (
  supplements: Supplement[]
): number => {
  return supplements.reduce(
    (total, supplement) => total + supplement.protein,
    0
  );
};

/**
 * Obtiene suplementos ordenados por calorías
 */
export const sortSupplementsByCalories = (
  supplements: Supplement[],
  ascending = true
): Supplement[] => {
  return [...supplements].sort((a, b) => {
    return ascending ? a.calories - b.calories : b.calories - a.calories;
  });
};

/**
 * Obtiene suplementos ordenados por proteína
 */
export const sortSupplementsByProtein = (
  supplements: Supplement[],
  ascending = true
): Supplement[] => {
  return [...supplements].sort((a, b) => {
    return ascending ? a.protein - b.protein : b.protein - a.protein;
  });
};

/**
 * Obtiene suplementos que coinciden con múltiples criterios
 */
export const filterSupplements = (
  supplements: Supplement[],
  filters: {
    tags?: string[];
    maxCalories?: number;
    minProtein?: number;
    hasCalories?: boolean;
    hasProtein?: boolean;
  }
): Supplement[] => {
  return supplements.filter((supplement) => {
    if (
      filters.tags &&
      !filters.tags.some((tag) => supplement.tags?.includes(tag))
    )
      return false;
    if (filters.maxCalories && supplement.calories > filters.maxCalories)
      return false;
    if (filters.minProtein && supplement.protein < filters.minProtein)
      return false;
    if (
      filters.hasCalories !== undefined &&
      supplement.calories > 0 !== filters.hasCalories
    )
      return false;
    if (
      filters.hasProtein !== undefined &&
      supplement.protein > 0 !== filters.hasProtein
    )
      return false;
    return true;
  });
};

/**
 * Obtiene suplementos por categoría funcional
 */
export const getSupplementsByCategory = (
  supplements: Supplement[],
  category: "protein" | "vitamins" | "minerals" | "performance" | "health"
): Supplement[] => {
  return supplements.filter((supplement) => {
    switch (category) {
      case "protein":
        return (
          supplement.tags?.some((tag) =>
            ["Proteína", "Aminoácidos"].includes(tag)
          ) || false
        );
      case "vitamins":
        return (
          supplement.tags?.some((tag) =>
            ["Vitaminas", "Vitamina D", "Multivitamínico"].includes(tag)
          ) || false
        );
      case "minerals":
        return (
          supplement.tags?.some((tag) =>
            ["Minerales", "Creatina"].includes(tag)
          ) || false
        );
      case "performance":
        return (
          supplement.tags?.some((tag) =>
            [
              "Fuerza",
              "Potencia",
              "Recuperación",
              "Post-entrenamiento",
            ].includes(tag)
          ) || false
        );
      case "health":
        return (
          supplement.tags?.some((tag) =>
            [
              "Salud general",
              "Cardiovascular",
              "Antiinflamatorio",
              "Sistema inmune",
            ].includes(tag)
          ) || false
        );
      default:
        return false;
    }
  });
};

/**
 * Obtiene suplementos recomendados para diferentes objetivos
 */
export const getSupplementsByGoal = (
  supplements: Supplement[],
  goal:
    | "muscle-gain"
    | "weight-loss"
    | "general-health"
    | "performance"
    | "recovery"
): Supplement[] => {
  return supplements.filter((supplement) => {
    switch (goal) {
      case "muscle-gain":
        return (
          supplement.tags?.some((tag) =>
            ["Proteína", "Aminoácidos", "Creatina"].includes(tag)
          ) || false
        );
      case "weight-loss":
        return (
          supplement.tags?.some((tag) =>
            ["Proteína", "Sin calorías"].includes(tag)
          ) || false
        );
      case "general-health":
        return (
          supplement.tags?.some((tag) =>
            ["Vitaminas", "Minerales", "Omega-3", "Salud general"].includes(tag)
          ) || false
        );
      case "performance":
        return (
          supplement.tags?.some((tag) =>
            ["Creatina", "BCAA", "Fuerza", "Potencia"].includes(tag)
          ) || false
        );
      case "recovery":
        return (
          supplement.tags?.some((tag) =>
            ["Recuperación", "Aminoácidos", "Post-entrenamiento"].includes(tag)
          ) || false
        );
      default:
        return false;
    }
  });
};
