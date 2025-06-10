// src/hooks/useNutritionalCalculations.js
import { useMemo } from "preact/hooks";
import {
  ACTIVITY_FACTORS,
  STEPS_THRESHOLDS,
  BMR_MALE_CONSTANT,
  BMR_FEMALE_CONSTANT,
  BMR_AGE_COEFFICIENT,
  BMR_WEIGHT_COEFFICIENT,
  BMR_HEIGHT_COEFFICIENT,
  KCAL_PER_KG_FAT,
  MIN_DAILY_CALORIES,
  DEFAULT_DAILY_DEFICIT,
} from "../config/nutritionalConstants";
import ProteinCalculator from "../components/ProteinCalculator";

export function useNutritionalCalculations(userData, userGoal) {
  return useMemo(() => {
    if (!userData) {
      return {
        bmr: 0,
        tdee: 0,
        proteinFactor: 0,
        proteinGoal: 0,
        calorieGoal: 0,
      };
    }

    // 1. Calcular BMR (Tasa Metabólica Basal)
    const bmr =
      userData.gender === "male"
        ? BMR_WEIGHT_COEFFICIENT * userData.weight +
          BMR_HEIGHT_COEFFICIENT * userData.height -
          BMR_AGE_COEFFICIENT * userData.age +
          BMR_MALE_CONSTANT
        : BMR_WEIGHT_COEFFICIENT * userData.weight +
          BMR_HEIGHT_COEFFICIENT * userData.height -
          BMR_AGE_COEFFICIENT * userData.age +
          BMR_FEMALE_CONSTANT;

    // 2. Determinar factor de actividad
    let activityFactor = ACTIVITY_FACTORS.SEDENTARY;
    if (userData.steps >= STEPS_THRESHOLDS.VERY_ACTIVE) {
      activityFactor = ACTIVITY_FACTORS.VERY_ACTIVE;
    } else if (userData.steps >= STEPS_THRESHOLDS.MODERATE) {
      activityFactor = ACTIVITY_FACTORS.MODERATE;
    } else if (userData.steps >= STEPS_THRESHOLDS.LIGHT) {
      activityFactor = ACTIVITY_FACTORS.LIGHT;
    }

    // 3. Calcular TDEE
    const tdee = Math.round(bmr * activityFactor);

    // 4. Calcular proteínas
    const proteinFactor = ProteinCalculator(userData);
    const proteinGoal = Math.round(userData.weight * proteinFactor);

    // 5. Calcular objetivo calórico
    let calorieGoal = tdee; // Por defecto, mantenimiento

    if (userGoal?.targetWeight && userGoal?.startDate && userGoal?.endDate) {
      const weightToLose = userData.weight - parseFloat(userGoal.targetWeight);
      if (weightToLose > 0) {
        const durationInDays =
          (new Date(userGoal.endDate) - new Date(userGoal.startDate)) /
          (1000 * 60 * 60 * 24);
        if (durationInDays > 0) {
          const dailyDeficit = Math.round(
            (weightToLose * KCAL_PER_KG_FAT) / durationInDays
          );
          calorieGoal = Math.max(MIN_DAILY_CALORIES, tdee - dailyDeficit);
        }
      }
    } else {
      // Si no hay meta definida, usar déficit por defecto
      calorieGoal = Math.max(MIN_DAILY_CALORIES, tdee - DEFAULT_DAILY_DEFICIT);
    }

    return {
      bmr: Math.round(bmr),
      tdee,
      proteinFactor,
      proteinGoal,
      calorieGoal,
    };
  }, [userData, userGoal]);
}
