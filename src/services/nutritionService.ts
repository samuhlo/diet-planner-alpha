import type { UserData, Recipe, Supplement, Snack } from "../types";
import {
  BMR_WEIGHT_COEFFICIENT,
  BMR_HEIGHT_COEFFICIENT,
  BMR_AGE_COEFFICIENT,
  BMR_MALE_CONSTANT,
  BMR_FEMALE_CONSTANT,
  ACTIVITY_FACTORS,
  STEPS_THRESHOLDS,
  PROTEIN_MATRIX,
  KCAL_PER_KG_FAT,
  DEFAULT_DAILY_DEFICIT,
} from "../config/nutritionalConstants";

export class NutritionService {
  /**
   * Calcula el metabolismo basal usando la ecuación de Mifflin-St Jeor
   */
  static calculateBMR(userData: UserData): number {
    const { weight, height, age, gender } = userData;
    const genderConstant =
      gender === "male" ? BMR_MALE_CONSTANT : BMR_FEMALE_CONSTANT;

    return (
      BMR_WEIGHT_COEFFICIENT * weight +
      BMR_HEIGHT_COEFFICIENT * height -
      BMR_AGE_COEFFICIENT * age +
      genderConstant
    );
  }

  /**
   * Determina el factor de actividad basado en los pasos diarios
   */
  static getActivityFactor(steps: number): number {
    if (steps >= STEPS_THRESHOLDS.VERY_ACTIVE)
      return ACTIVITY_FACTORS.VERY_ACTIVE;
    if (steps >= STEPS_THRESHOLDS.MODERATE) return ACTIVITY_FACTORS.MODERATE;
    if (steps >= STEPS_THRESHOLDS.LIGHT) return ACTIVITY_FACTORS.LIGHT;
    return ACTIVITY_FACTORS.SEDENTARY;
  }

  /**
   * Calcula el gasto energético total diario
   */
  static calculateTDEE(userData: UserData): number {
    const bmr = this.calculateBMR(userData);
    const activityFactor = this.getActivityFactor(userData.steps);
    return Math.round(bmr * activityFactor);
  }

  /**
   * Calcula la ingesta de proteínas recomendada
   */
  static calculateProteinIntake(userData: UserData): number {
    const { weight, steps, doesStrengthTraining, strengthTrainingDays } =
      userData;

    // Determinar nivel de actividad
    let activityLevel: keyof typeof PROTEIN_MATRIX;
    if (steps >= STEPS_THRESHOLDS.VERY_ACTIVE) activityLevel = "very_active";
    else if (steps >= STEPS_THRESHOLDS.MODERATE) activityLevel = "moderate";
    else if (steps >= STEPS_THRESHOLDS.LIGHT) activityLevel = "light";
    else activityLevel = "sedentary";

    // Determinar días de entrenamiento
    const trainingDays = doesStrengthTraining
      ? Math.min(strengthTrainingDays, 4)
      : 0;
    const trainingKey =
      trainingDays.toString() as keyof (typeof PROTEIN_MATRIX)[typeof activityLevel];

    const proteinPerKg = PROTEIN_MATRIX[activityLevel][trainingKey];
    return Math.round(weight * proteinPerKg);
  }

  /**
   * Calcula las calorías objetivo para pérdida de peso
   */
  static calculateTargetCalories(
    userData: UserData,
    weeklyWeightLossKg?: number
  ): number {
    const tdee = this.calculateTDEE(userData);
    const deficit = weeklyWeightLossKg
      ? (weeklyWeightLossKg * KCAL_PER_KG_FAT) / 7
      : DEFAULT_DAILY_DEFICIT;

    return Math.round(tdee - deficit);
  }

  /**
   * Calcula el resumen nutricional de una receta
   */
  static calculateRecipeNutrition(recipe: Recipe, servings: number = 1) {
    return {
      calories: recipe.calorias * servings,
      protein: recipe.p * servings,
      carbs: recipe.c * servings,
      fats: recipe.f * servings,
    };
  }

  /**
   * Calcula el resumen nutricional de suplementos
   */
  static calculateSupplementNutrition(supplement: Supplement, shakes: number) {
    return {
      calories: supplement.calories * shakes,
      protein: supplement.protein * shakes,
    };
  }

  /**
   * Calcula el resumen nutricional de un snack
   */
  static calculateSnackNutrition(snack: Snack, quantity: number = 1) {
    return {
      calories: snack.calorias * quantity,
      protein: snack.p * quantity,
      carbs: snack.c * quantity,
      fats: snack.f * quantity,
    };
  }

  /**
   * Calcula el resumen nutricional de múltiples snacks
   */
  static calculateSnacksNutrition(
    snacks: Array<{ snack: Snack; quantity: number }>
  ) {
    return snacks.reduce(
      (total, { snack, quantity }) => ({
        calories: total.calories + snack.calorias * quantity,
        protein: total.protein + snack.p * quantity,
        carbs: total.carbs + snack.c * quantity,
        fats: total.fats + snack.f * quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }

  /**
   * Valida si las calorías diarias están dentro de rangos seguros
   */
  static validateDailyCalories(calories: number, targetCalories: number) {
    const minCalories = 1200;
    const tolerance = 100;

    if (calories < minCalories) {
      return {
        isValid: false,
        message: `Cuidado: ${calories} kcal es un consumo muy bajo.`,
      };
    }

    if (calories > targetCalories + tolerance) {
      return {
        isValid: false,
        message: `Aviso: Has superado tu objetivo de ${targetCalories} kcal.`,
      };
    }

    return {
      isValid: true,
      message: "¡Correcto! Estás dentro de tu objetivo.",
    };
  }

  /**
   * Valida si la ingesta de proteínas está dentro del rango recomendado
   */
  static validateProteinIntake(protein: number, targetProtein: number) {
    const lowerBound = targetProtein * 0.8;
    const upperBound = targetProtein * 1.5;

    if (protein < lowerBound) {
      return {
        isValid: false,
        message: `Proteína baja. Objetivo: ${targetProtein}g.`,
      };
    }

    if (protein > upperBound) {
      return {
        isValid: false,
        message: `Proteína alta. Objetivo: ${targetProtein}g.`,
      };
    }

    return {
      isValid: true,
      message: `Proteína correcta. Objetivo: ${targetProtein}g.`,
    };
  }
}
