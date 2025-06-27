import type { BaseItem, NutritionalInfo } from "./index";

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
  calorias?: number;
  proteinas?: number;
  carbohidratos?: number;
  grasas?: number;
  nutritionalInfo?: NutritionalInfo;

  // Información de uso
  dosage?: string;
  timing?: string;
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
