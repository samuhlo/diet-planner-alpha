// src/types/index.ts

// Tipos de usuario
export interface UserData {
  weight: number;
  height: number;
  age: number;
  gender: "male" | "female";
  steps: number;
  doesStrengthTraining: boolean;
  strengthTrainingDays: number;
}

export interface UserGoal {
  startDate: string;
  endDate: string;
  targetWeight: number;
  goalType: "maintain" | "lose";
}

export interface WeightEntry {
  weight: number;
  date: string;
}

// Tipos de planificación
export interface MealPlan {
  recipeName?: string;
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

export interface DailyPlan {
  Desayuno?: MealPlan;
  Almuerzo?: MealPlan;
  Cena?: MealPlan;
  Postre?: MealPlan;
  supplement?: SupplementPlan;
  snacks?: SnackPlan;
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

export interface Recipe {
  nombre: string;
  tipo: "Desayuno" | "Almuerzo" | "Cena" | "Snack" | "Postre";
  tags: string[];
  calorias: number;
  p: number; // Proteínas
  c: number; // Carbohidratos
  f: number; // Grasas
  ingredientes: Ingredient[];
  preparacion?: string;
  source?: RecipeSource;
}

// Tipos de snacks
export interface Snack {
  id: string;
  nombre: string;
  tipo: "simple" | "elaborado";
  calorias: number;
  p: number; // Proteínas
  c: number; // Carbohidratos
  f: number; // Grasas
  ingredientes?: Ingredient[]; // Solo para snacks elaborados
  preparacion?: string; // Solo para snacks elaborados
  tags: string[];
  porcion: string; // Ej: "1 unidad", "30g", "1 puñado"
}

// Tipos de suplementos
export interface Supplement {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  serving?: string;
  description?: string;
  tags?: string[];
}

// Tipos de modales
export type ModalType = "shopping" | "analysis" | "summary" | null;

export interface WeeklySummaryData {
  day: string;
  meals: Record<string, string>;
}

export interface ModalState {
  isOpen: boolean;
  type: ModalType;
  data: Recipe[] | Ingredient[] | Snack[] | WeeklySummaryData[] | null;
}

// Tipos de consejos
export interface Tip {
  id: string;
  title: string;
  content: string;
  tags: string[];
}
