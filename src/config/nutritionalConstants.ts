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

// --- MATRIZ DE CÁLCULO DE PROTEÍNAS (g/kg) ---
// Basada en la frecuencia de entrenamiento de fuerza y el nivel de actividad (pasos).
// Usamos el valor medio del rango proporcionado en la tabla.
export const PROTEIN_MATRIX = {
  // Nivel de Actividad: Sedentario (Poca Actividad)
  sedentary: {
    "0": 1.1, // 0 días de fuerza (sedentario) -> 1.0-1.2 g/kg
    "1": 1.35, // 1 día de fuerza -> 1.2-1.5 g/kg
    "2": 1.5, // 2 días de fuerza -> 1.4-1.6 g/kg
    "3": 1.6, // 3 días de fuerza -> 1.5-1.7 g/kg
    "4": 1.7, // 4+ días de fuerza -> 1.6-1.8 g/kg
  },
  // Nivel de Actividad: Ligero
  light: {
    "0": 1.3, // 0 días de fuerza -> 1.2-1.4 g/kg
    "1": 1.5, // 1 día de fuerza -> 1.4-1.6 g/kg
    "2": 1.6, // 2 días de fuerza -> 1.5-1.7 g/kg
    "3": 1.7, // 3 días de fuerza -> 1.6-1.8 g/kg
    "4": 1.85, // 4+ días de fuerza -> 1.7-2.0 g/kg
  },
  // Nivel de Actividad: Moderado
  moderate: {
    "0": 1.4, // 0 días de fuerza -> 1.3-1.5 g/kg
    "1": 1.6, // 1 día de fuerza -> 1.5-1.7 g/kg
    "2": 1.7, // 2 días de fuerza -> 1.6-1.8 g/kg
    "3": 1.85, // 3 días de fuerza -> 1.7-2.0 g/kg
    "4": 1.95, // 4+ días de fuerza -> 1.8-2.2 g/kg
  },
  // Nivel de Actividad: Muy Activo
  very_active: {
    "0": 1.4, // Asumimos el mismo que moderado para 0 días
    "1": 1.6,
    "2": 1.7,
    "3": 1.85,
    "4": 2.0,
  },
};
