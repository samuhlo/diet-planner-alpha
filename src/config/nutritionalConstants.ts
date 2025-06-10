/**
 * Constantes fundamentales para los cálculos de la aplicación.
 */

// --- FÓRMULA BMR (Metabolismo Basal) - Ecuación de Mifflin-St Jeor ---
// Esta es una de las fórmulas más utilizadas para estimar las calorías que quema el cuerpo en reposo.
// La fórmula es: (10 * peso en kg) + (6.25 * altura en cm) - (5 * edad en años) + (constante de género)
export const BMR_WEIGHT_COEFFICIENT = 10;
export const BMR_HEIGHT_COEFFICIENT = 6.25;
export const BMR_AGE_COEFFICIENT = 5;
export const BMR_MALE_CONSTANT = 5;
export const BMR_FEMALE_CONSTANT = -161;

// --- CÁLCULOS ENERGÉTICOS ---
// Calorías aproximadas por cada kilogramo de grasa corporal.
export const KCAL_PER_KG_FAT = 7700;
// Déficit calórico por defecto si no hay un objetivo definido.
export const DEFAULT_DAILY_DEFICIT = 500;

// --- MACRONUTRIENTES Y LÍMITES ---
// Gramos de proteína recomendados por kilogramo de peso corporal.
export const PROTEIN_G_PER_KG_WEIGHT = 1.8;
// Límite calórico diario por debajo del cual se considera un consumo muy bajo.
export const MIN_DAILY_CALORIES = 1200;
// Factores para los límites del feedback de proteínas (80% y 150% del objetivo)
export const PROTEIN_INTAKE_LOWER_BOUND_FACTOR = 0.8;
export const PROTEIN_INTAKE_UPPER_BOUND_FACTOR = 1.5;

// --- UMBRALES DE SEGURIDAD ---
// Límite de pérdida de peso semanal (kg) a partir del cual se muestra una advertencia.
export const WARNING_WEEKLY_WEIGHT_LOSS_KG = 1.0;
// Límite de pérdida de peso semanal (kg) a partir del cual se muestra una alerta de peligro.
export const DANGER_WEEKLY_WEIGHT_LOSS_KG = 1.5;

// --- FACTORES DE ACTIVIDAD ---
export const ACTIVITY_FACTORS = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  VERY_ACTIVE: 1.725,
};

export const STEPS_THRESHOLDS = {
  LIGHT: 5000,
  MODERATE: 7500,
  VERY_ACTIVE: 10000,
};
