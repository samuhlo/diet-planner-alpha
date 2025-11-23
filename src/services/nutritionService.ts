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
   * @param {UserData} userData - Datos del usuario (peso, altura, edad, género)
   * @returns {number} Tasa metabólica basal (BMR) en kcal/día
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
   * @param {number} steps - Número promedio de pasos diarios
   * @returns {number} Factor de actividad (1.2 a 1.9)
   */
  static getActivityFactor(steps: number): number {
    if (steps >= STEPS_THRESHOLDS.VERY_ACTIVE)
      return ACTIVITY_FACTORS.VERY_ACTIVE;
    if (steps >= STEPS_THRESHOLDS.MODERATE) return ACTIVITY_FACTORS.MODERATE;
    if (steps >= STEPS_THRESHOLDS.LIGHT) return ACTIVITY_FACTORS.LIGHT;
    return ACTIVITY_FACTORS.SEDENTARY;
  }

  /**
   * Calcula el gasto energético total diario (TDEE)
   * Multiplica el BMR por el factor de actividad
   * @param {UserData} userData - Datos del usuario
   * @returns {number} Gasto energético total diario en kcal
   */
  static calculateTDEE(userData: UserData): number {
    const bmr = this.calculateBMR(userData);
    const activityFactor = this.getActivityFactor(userData.steps);
    return Math.round(bmr * activityFactor);
  }

  /**
   * Calcula la ingesta de proteínas recomendada
   * Basado en nivel de actividad y entrenamiento de fuerza
   * @param {UserData} userData - Datos del usuario
   * @returns {number} Gramos de proteína recomendados por día
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
   * @param {UserData} userData - Datos del usuario
   * @param {number} [weeklyWeightLossKg] - Objetivo de pérdida de peso semanal en kg
   * @returns {number} Calorías objetivo diarias
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
   * Calcula el resumen nutricional de una receta según las porciones
   * @param {Recipe} recipe - Receta a calcular
   * @param {number} [servings=1] - Número de porciones
   * @returns {Object} Objeto con calorías y macronutrientes totales
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
   * Calcula el resumen nutricional de un suplemento
   * @param {Supplement} supplement - Suplemento a calcular
   * @param {number} shakes - Número de batidos/tomas
   * @returns {Object} Objeto con calorías y proteínas totales
   */
  static calculateSupplementNutrition(supplement: Supplement, shakes: number) {
    return {
      calories: (supplement.calories || 0) * shakes,
      protein: (supplement.protein || 0) * shakes,
    };
  }

  /**
   * Calcula el resumen nutricional acumulado de múltiples suplementos
   * @param {Array<{ supplement: Supplement; quantity: number }>} supplements - Lista de suplementos y cantidades
   * @returns {Object} Objeto con calorías y macronutrientes totales
   */
  static calculateSupplementsNutrition(
    supplements: Array<{ supplement: Supplement; quantity: number }>
  ) {
    return supplements.reduce(
      (total, { supplement, quantity }) => ({
        calories: total.calories + (supplement.calories || 0) * quantity,
        protein: total.protein + (supplement.protein || 0) * quantity,
        carbs: total.carbs + (supplement.carbs || 0) * quantity,
        fats: total.fats + (supplement.fat || 0) * quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }

  /**
   * Calcula el resumen nutricional de un snack
   * @param {Snack} snack - Snack a calcular
   * @param {number} [quantity=1] - Cantidad de snacks
   * @returns {Object} Objeto con calorías y macronutrientes totales
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
   * Calcula el resumen nutricional acumulado de múltiples snacks
   * @param {Array<{ snack: Snack; quantity: number }>} snacks - Lista de snacks y cantidades
   * @returns {Object} Objeto con calorías y macronutrientes totales
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
   * Valida si las calorías diarias están dentro de rangos seguros y del objetivo
   * @param {number} calories - Calorías consumidas/planificadas
   * @param {number} targetCalories - Objetivo calórico
   * @returns {{isValid: boolean, message: string}} Resultado de la validación
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
   * @param {number} protein - Proteínas consumidas/planificadas
   * @param {number} targetProtein - Objetivo de proteínas
   * @returns {{isValid: boolean, message: string}} Resultado de la validación
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
