import type { BaseItem, NutritionalInfo } from "./index";

/**
 * Definición de un suplemento nutricional
 */
export interface Supplement extends BaseItem {
  // Propiedades básicas
  name: string;
  nombre?: string;
  description?: string;

  // Categorización
  type?: string;
  categoria?: string;
  tags?: string[];

  // Información nutricional
  /** Calorías por porción */
  calorias?: number;
  /** Proteínas por porción en gramos */
  proteinas?: number;
  /** Carbohidratos por porción en gramos */
  carbohidratos?: number;
  /** Grasas por porción en gramos */
  grasas?: number;
  nutritionalInfo?: NutritionalInfo;

  // Información de uso
  /** Dosis recomendada */
  dosage?: string;
  /** Momento recomendado de consumo */
  timing?: string;
  /** Tamaño de la porción */
  serving?: string;

  // Beneficios y características
  benefits?: string[];

  // Información comercial
  imageUrl?: string;
  brand?: string;
  price?: number;
  link?: string;

  // Campos para retrocompatibilidad
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}
