// src/constants/appConstants.ts

// Días de la semana
export const DAYS_OF_WEEK = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

// Tipos de comida
export const MEAL_TYPES = ["Desayuno", "Almuerzo", "Cena"] as const;

// Opciones de género
export const GENDER_OPTIONS = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
] as const;

// Opciones de días de entrenamiento
export const TRAINING_DAYS_OPTIONS = [
  { value: 1, label: "1 día" },
  { value: 2, label: "2 días" },
  { value: 3, label: "3 días" },
  { value: 4, label: "4 o más días" },
] as const;

// Colores de estado
export const STATUS_COLORS = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-orange-100 text-orange-800",
  info: "bg-blue-100 text-blue-800",
} as const;

// Configuración de formularios
export const FORM_CONFIG = {
  defaultSteps: 15000,
  defaultAge: 35,
  defaultHeight: 188,
  defaultWeight: 96,
  stepIncrements: 500,
} as const;

// Configuración de validación
export const VALIDATION_LIMITS = {
  minAge: 16,
  maxAge: 100,
  minHeight: 100,
  maxHeight: 250,
  minWeight: 30,
  maxWeight: 300,
  minSteps: 0,
  maxSteps: 50000,
} as const;
