import type { Tip } from "../types";

/**
 * Obtiene tips por tag específico
 */
export const getTipsByTag = (tips: Tip[], tag: string): Tip[] => {
  return tips.filter((tip) => tip.tags.includes(tag));
};

/**
 * Busca tips por título o contenido
 */
export const searchTips = (tips: Tip[], query: string): Tip[] => {
  const lowercaseQuery = query.toLowerCase();
  return tips.filter(
    (tip) =>
      tip.title.toLowerCase().includes(lowercaseQuery) ||
      tip.content.toLowerCase().includes(lowercaseQuery) ||
      tip.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};

/**
 * Obtiene tips por categoría
 */
export const getTipsByCategory = (
  tips: Tip[],
  category: "nutrition" | "cooking" | "planning" | "lifestyle" | "tips"
): Tip[] => {
  return tips.filter((tip) => {
    switch (category) {
      case "nutrition":
        return tip.tags.some((tag) =>
          ["Nutrición", "Proteína", "Control Calórico"].includes(tag)
        );
      case "cooking":
        return tip.tags.some((tag) =>
          ["Batidos", "Cocina Práctica", "Batch Cooking"].includes(tag)
        );
      case "planning":
        return tip.tags.some((tag) =>
          ["Compra", "Planificación"].includes(tag)
        );
      case "lifestyle":
        return tip.tags.some((tag) => ["Tentempiés", "Ahorro"].includes(tag));
      case "tips":
        return tip.tags.some((tag) => ["Consejos", "Práctico"].includes(tag));
      default:
        return false;
    }
  });
};

/**
 * Obtiene tips aleatorios
 */
export const getRandomTips = (tips: Tip[], count: number): Tip[] => {
  const shuffled = [...tips].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, tips.length));
};

/**
 * Obtiene tips por relevancia (basado en tags)
 */
export const getTipsByRelevance = (
  tips: Tip[],
  relevantTags: string[]
): Tip[] => {
  return tips
    .filter((tip) => tip.tags.some((tag) => relevantTags.includes(tag)))
    .sort((a, b) => {
      const aRelevance = a.tags.filter((tag) =>
        relevantTags.includes(tag)
      ).length;
      const bRelevance = b.tags.filter((tag) =>
        relevantTags.includes(tag)
      ).length;
      return bRelevance - aRelevance;
    });
};

/**
 * Obtiene tips para diferentes momentos del día
 */
export const getTipsByTimeOfDay = (
  tips: Tip[],
  timeOfDay: "morning" | "afternoon" | "evening" | "planning"
): Tip[] => {
  return tips.filter((tip) => {
    switch (timeOfDay) {
      case "morning":
        return tip.tags.some((tag) => ["Batidos", "Desayuno"].includes(tag));
      case "afternoon":
        return tip.tags.some((tag) => ["Tentempiés", "Snacks"].includes(tag));
      case "evening":
        return tip.tags.some((tag) => ["Cena", "Preparación"].includes(tag));
      case "planning":
        return tip.tags.some((tag) =>
          ["Compra", "Batch Cooking", "Planificación"].includes(tag)
        );
      default:
        return false;
    }
  });
};

/**
 * Obtiene tips para diferentes objetivos
 */
export const getTipsByGoal = (
  tips: Tip[],
  goal:
    | "weight-loss"
    | "muscle-gain"
    | "general-health"
    | "meal-prep"
    | "budget"
): Tip[] => {
  return tips.filter((tip) => {
    switch (goal) {
      case "weight-loss":
        return tip.tags.some((tag) =>
          ["Control Calórico", "Ahorro", "Porciones"].includes(tag)
        );
      case "muscle-gain":
        return tip.tags.some((tag) => ["Proteína", "Nutrición"].includes(tag));
      case "general-health":
        return tip.tags.some((tag) => ["Nutrición", "Salud"].includes(tag));
      case "meal-prep":
        return tip.tags.some((tag) =>
          ["Batch Cooking", "Cocina Práctica", "Planificación"].includes(tag)
        );
      case "budget":
        return tip.tags.some((tag) =>
          ["Ahorro", "Compra", "Económico"].includes(tag)
        );
      default:
        return false;
    }
  });
};

/**
 * Obtiene todos los tags únicos de los tips
 */
export const getUniqueTipTags = (tips: Tip[]): string[] => {
  const allTags = tips.flatMap((tip) => tip.tags);
  return Array.from(new Set(allTags)).sort();
};

/**
 * Obtiene tips que contienen palabras clave específicas
 */
export const getTipsByKeywords = (tips: Tip[], keywords: string[]): Tip[] => {
  return tips.filter((tip) => {
    const tipText = `${tip.title} ${tip.content}`.toLowerCase();
    return keywords.some((keyword) => tipText.includes(keyword.toLowerCase()));
  });
};
