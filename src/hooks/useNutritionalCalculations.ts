import { useMemo } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $userData, $userGoal } from "../stores/userProfileStore";
import {
  KCAL_PER_KG_FAT,
  ACTIVITY_FACTORS,
  STEPS_THRESHOLDS,
  MIN_DAILY_CALORIES,
  BMR_MALE_CONSTANT,
  BMR_FEMALE_CONSTANT,
  BMR_AGE_COEFFICIENT,
  BMR_WEIGHT_COEFFICIENT,
  BMR_HEIGHT_COEFFICIENT,
} from "../config/nutritionalConstants";

export function useNutritionalCalculations(userData: any, userGoal: any) {
  const calorieGoal = useMemo(() => {
    if (!userData) return 2000;

    const { gender, age, height, weight, steps } = userData;

    // Calcular BMR
    const bmr = Math.round(
      gender === "male"
        ? BMR_WEIGHT_COEFFICIENT * weight +
            BMR_HEIGHT_COEFFICIENT * height -
            BMR_AGE_COEFFICIENT * age +
            BMR_MALE_CONSTANT
        : BMR_WEIGHT_COEFFICIENT * weight +
            BMR_HEIGHT_COEFFICIENT * height -
            BMR_AGE_COEFFICIENT * age +
            BMR_FEMALE_CONSTANT
    );

    // Determinar factor de actividad
    let activityFactor = ACTIVITY_FACTORS.SEDENTARY;
    if (steps >= STEPS_THRESHOLDS.VERY_ACTIVE) {
      activityFactor = ACTIVITY_FACTORS.VERY_ACTIVE;
    } else if (steps >= STEPS_THRESHOLDS.MODERATE) {
      activityFactor = ACTIVITY_FACTORS.MODERATE;
    } else if (steps >= STEPS_THRESHOLDS.LIGHT) {
      activityFactor = ACTIVITY_FACTORS.LIGHT;
    }

    const tdee = Math.round(bmr * activityFactor);

    // Si hay un objetivo de pérdida de peso, calcular déficit
    if (
      userGoal &&
      userGoal.startDate &&
      userGoal.endDate &&
      userGoal.targetWeight
    ) {
      const start = new Date(userGoal.startDate);
      const end = new Date(userGoal.endDate);
      const target = parseFloat(userGoal.targetWeight);
      const weightToChange = weight - target;

      if (weightToChange > 0) {
        const totalKcalDeficit = weightToChange * KCAL_PER_KG_FAT;
        const durationInDays =
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        const dailyKcalDeficit = Math.round(totalKcalDeficit / durationInDays);
        const targetCalories = Math.max(
          tdee - dailyKcalDeficit,
          MIN_DAILY_CALORIES
        );
        return targetCalories;
      }
    }

    return tdee;
  }, [
    userData?.gender,
    userData?.age,
    userData?.height,
    userData?.weight,
    userData?.steps,
    userGoal?.startDate,
    userGoal?.endDate,
    userGoal?.targetWeight,
  ]);

  const proteinGoal = useMemo(() => {
    if (!userData) return 150;

    const { weight, doesStrengthTraining, strengthTrainingDays } = userData;

    // Factor de proteína basado en entrenamiento de fuerza
    let proteinFactor = 1.6; // Factor base para pérdida de peso
    if (doesStrengthTraining && strengthTrainingDays >= 3) {
      proteinFactor = 2.0; // Más proteína si entrena fuerza 3+ días
    } else if (doesStrengthTraining) {
      proteinFactor = 1.8; // Proteína moderada si entrena fuerza
    }

    return Math.round(weight * proteinFactor);
  }, [
    userData?.weight,
    userData?.doesStrengthTraining,
    userData?.strengthTrainingDays,
  ]);

  return { calorieGoal, proteinGoal };
}
