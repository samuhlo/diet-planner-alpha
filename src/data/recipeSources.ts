import type { RecipeSource } from "../types";

/**
 * Fuentes de recetas centralizadas
 * Aquí puedes agregar todas las fuentes de tus recetas
 */
export const recipeSources: Record<string, RecipeSource> = {
  squatFit: {
    id: "squatFit",
    name: "La Cocina Squat Fit",
    authors: "Maria Casas & Hamlet Sosa",
    type: "book",
    year: 2023,
  },
  personal: {
    id: "personal",
    name: "Recetas Personales",
    type: "personal",
  },
  gobierno: {
    id: "gobierno",
    name: "Comida Rápida, Barata y Saludable",
    authors: "Boticaria García",
    type: "website",
    url: "https://www.consumo.gob.es/",
    year: 2024,
  },
  internet: {
    id: "internet",
    name: "Recetas de Internet",
    type: "website",
  },
  magazine: {
    id: "magazine",
    name: "Revista de Cocina",
    type: "magazine",
  },
  other: {
    id: "other",
    name: "Otras Fuentes",
    type: "other",
  },
};

/**
 * Función helper para obtener una fuente por ID
 */
export const getSourceById = (id: string): RecipeSource | undefined => {
  return recipeSources[id];
};

/**
 * Función helper para obtener todas las fuentes
 */
export const getAllSources = (): RecipeSource[] => {
  return Object.values(recipeSources);
};
