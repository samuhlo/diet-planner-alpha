import {
  PROTEIN_MATRIX,
  STEPS_THRESHOLDS,
  PROTEIN_INTAKE_LOWER_BOUND_FACTOR,
} from "../config/nutritionalConstants";

export default function ProteinCalculator(userData) {
  const { steps, doesStrengthTraining, strengthTrainingDays } = userData;

  // Determinar el nivel de actividad basado en los pasos diarios
  let activityLevel = "sedentary";
  if (steps >= STEPS_THRESHOLDS.VERY_ACTIVE) activityLevel = "very_active";
  else if (steps >= STEPS_THRESHOLDS.MODERATE) activityLevel = "moderate";
  else if (steps >= STEPS_THRESHOLDS.LIGHT) activityLevel = "light";

  // Obtener la clave de días de entrenamiento (máx 4+)
  const trainingDaysKey = Math.min(
    4,
    Math.max(0, doesStrengthTraining ? strengthTrainingDays : 0)
  );

  // Obtener el factor de proteína de la matriz
  const proteinFactor =
    PROTEIN_MATRIX[activityLevel]?.[trainingDaysKey] ||
    PROTEIN_INTAKE_LOWER_BOUND_FACTOR;

  return proteinFactor;
}
