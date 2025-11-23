// src/types/index.ts

// Tipos base
export interface BaseItem {
  id: string;
}

// Re-exportar tipos de suplementos desde su módulo específico
export type { Supplement } from "./supplements";

// Tipos de usuario
/**
 * Datos físicos y de actividad del usuario
 */
export interface UserData {
  /** Peso actual en kg */
  weight: number;
  /** Altura en cm */
  height: number;
  /** Edad en años */
  age: number;
  /** Género biológico */
  gender: "male" | "female";
  /** Pasos diarios promedio */
  steps: number;
  /** Si realiza entrenamiento de fuerza */
  doesStrengthTraining: boolean;
  /** Días de entrenamiento de fuerza por semana */
  strengthTrainingDays: number;
}

/**
 * Objetivo del usuario para el plan
 */
export interface UserGoal {
  /** Fecha de inicio del plan (ISO string) */
  startDate: string;
  /** Fecha de fin del plan (ISO string) */
  endDate: string;
  /** Peso objetivo en kg */
  targetWeight: number;
  /** Tipo de objetivo: mantener o perder peso */
  goalType: "maintain" | "lose";
}

/**
 * Registro de peso en el historial
 */
export interface WeightEntry {
  /** Peso registrado en kg */
  weight: number;
  /** Fecha del registro (ISO string) */
  date: string;
}

// Tipos para selectores
export interface SelectedItem {
  id: string;
  quantity: number;
}

// Tipos de planificación
/**
 * Planificación de una comida específica
 */
export interface MealPlan {
  /** Nombre de la receta seleccionada */
  recipeName?: string;
  /** Número de comensales */
  diners?: number;
}

export interface SupplementPlan {
  enabled: boolean;
  supplements: Array<{
    supplementId: string;
    quantity: number;
  }>;
}

export interface SnackPlan {
  enabled: boolean;
  snacks: Array<{
    snackId: string;
    quantity: number;
  }>;
}

export interface DessertPlan {
  enabled: boolean;
  desserts: Array<{
    dessertId: string;
    quantity: number;
  }>;
}

/**
 * Planificación diaria completa
 */
export interface DailyPlan {
  Desayuno?: MealPlan;
  Almuerzo?: MealPlan;
  Cena?: MealPlan;
  supplement?: SupplementPlan;
  snacks?: SnackPlan;
  desserts?: DessertPlan;
}

export interface WeeklyPlan {
  [dayId: string]: DailyPlan;
}

// Tipos de fuentes
export interface RecipeSource {
  id: string;
  name: string;
  authors?: string;
  url?: string;
  year?: number;
  type: "book" | "website" | "magazine" | "personal" | "other";
}

// Tipos de recetas
export interface Ingredient {
  n: string; // nombre
  q: number; // cantidad
  u: string; // unidad
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Definición completa de una receta
 */
export interface Recipe {
  id: string;
  name: string;
  nombre: string;
  tipo: "Desayuno" | "Almuerzo" | "Cena" | "Snack" | "Postre";
  tags: string[];
  /** Calorías por porción */
  calorias: number;
  /** Proteínas en gramos */
  p: number;
  /** Carbohidratos en gramos */
  c: number;
  /** Grasas en gramos */
  f: number;
  ingredientes: Ingredient[];
  preparacion?: string;
  source?: RecipeSource;
  description?: string;
  nutritionalInfo?: NutritionalInfo;
}

// Tipos de snacks
/**
 * Definición de un snack
 */
export interface Snack {
  id: string;
  nombre: string;
  tipo: "simple" | "elaborado";
  calorias: number;
  /** Proteínas en gramos */
  p: number;
  /** Carbohidratos en gramos */
  c: number;
  /** Grasas en gramos */
  f: number;
  ingredientes?: Ingredient[]; // Solo para snacks elaborados
  preparacion?: string; // Solo para snacks elaborados
  tags: string[];
  /** Tamaño de la porción (ej: "1 unidad", "30g") */
  porcion: string;
}

// Tipos de modales
export type ModalType =
  | "shopping"
  | "analysis"
  | "summary"
  | "recipeDetail"
  | null;

export interface WeeklySummaryData {
  day: string;
  meals: Record<string, string>;
}

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data: Recipe | Recipe[] | Ingredient[] | Snack[] | WeeklySummaryData[] | null;
}

// Tipos de consejos
export interface Tip {
  id: string;
  title: string;
  content: string;
  tags: string[];
}
