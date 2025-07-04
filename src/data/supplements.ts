import type { Supplement } from "../types/supplements";

// Datos de suplementos simplificados para MVP
export const allSupplements: Supplement[] = [
  // PROTEÍNAS
  {
    id: "whey-protein",
    name: "Proteína Whey (30g)",
    description:
      "Proteína de suero de absorción rápida para post-entrenamiento",
    type: "proteina",
    tags: ["Proteína", "Post-entrenamiento"],
    dosage: "30g (1 scoop)",
    timing: "Después del entrenamiento",
    calories: 120,
    protein: 24,
    carbs: 3,
    fat: 1,
    nutritionalInfo: {
      calories: 120,
      protein: 24,
      carbs: 3,
      fat: 1,
    },
    benefits: ["Crecimiento muscular", "Recuperación"],
    brand: "MyProtein",
    price: 24.99,
  },
  {
    id: "vegan-protein",
    name: "Proteína Vegana (30g)",
    description: "Proteína vegetal completa para dietas veganas",
    type: "proteina",
    tags: ["Proteína", "Vegano"],
    dosage: "30g (1 scoop)",
    timing: "Después del entrenamiento",
    calories: 115,
    protein: 22,
    carbs: 4,
    fat: 1,
    nutritionalInfo: {
      calories: 115,
      protein: 22,
      carbs: 4,
      fat: 1,
    },
    benefits: ["Crecimiento muscular", "Opción vegana"],
    brand: "Vega",
    price: 29.99,
  },
  {
    id: "casein",
    name: "Caseína (30g)",
    description: "Proteína de absorción lenta para antes de dormir",
    type: "proteina",
    tags: ["Proteína", "Noche"],
    dosage: "30g (1 scoop)",
    timing: "Antes de dormir",
    calories: 105,
    protein: 25,
    carbs: 2,
    fat: 1,
    nutritionalInfo: {
      calories: 105,
      protein: 25,
      carbs: 2,
      fat: 1,
    },
    benefits: ["Recuperación nocturna", "Anticatabólico"],
    brand: "Optimum Nutrition",
    price: 27.99,
  },

  // RENDIMIENTO
  {
    id: "creatine",
    name: "Creatina (5g)",
    description: "Aumenta la fuerza y potencia muscular",
    type: "rendimiento",
    tags: ["Fuerza", "Rendimiento"],
    dosage: "5g",
    timing: "Cualquier momento del día",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    benefits: ["Más fuerza", "Mayor potencia"],
    brand: "Optimum Nutrition",
    price: 19.99,
  },
  {
    id: "pre-workout",
    name: "Pre-entreno (10g)",
    description: "Fórmula energética para maximizar el entrenamiento",
    type: "rendimiento",
    tags: ["Energía", "Pre-entrenamiento"],
    dosage: "10g (1 scoop)",
    timing: "30 min antes del entrenamiento",
    calories: 15,
    protein: 0,
    carbs: 4,
    fat: 0,
    nutritionalInfo: {
      calories: 15,
      protein: 0,
      carbs: 4,
      fat: 0,
    },
    benefits: ["Más energía", "Mayor concentración"],
    brand: "C4",
    price: 29.99,
  },

  // RECUPERACIÓN
  {
    id: "bcaa",
    name: "BCAA (5g)",
    description: "Aminoácidos para recuperación muscular",
    type: "recuperacion",
    tags: ["Aminoácidos", "Recuperación"],
    dosage: "5g",
    timing: "Durante o después del entrenamiento",
    calories: 20,
    protein: 5,
    carbs: 0,
    fat: 0,
    nutritionalInfo: {
      calories: 20,
      protein: 5,
      carbs: 0,
      fat: 0,
    },
    benefits: ["Recuperación muscular", "Menos dolor"],
    brand: "Scitec",
    price: 22.5,
  },
  {
    id: "glutamine",
    name: "Glutamina (5g)",
    description: "Aminoácido para recuperación y salud intestinal",
    type: "recuperacion",
    tags: ["Aminoácidos", "Recuperación"],
    dosage: "5g",
    timing: "Después del entrenamiento",
    calories: 20,
    protein: 5,
    carbs: 0,
    fat: 0,
    nutritionalInfo: {
      calories: 20,
      protein: 5,
      carbs: 0,
      fat: 0,
    },
    benefits: ["Recuperación muscular", "Salud intestinal"],
    brand: "NOW Foods",
    price: 18.99,
  },

  // SALUD GENERAL
  {
    id: "multivitamin",
    name: "Multivitamínico",
    description: "Complejo de vitaminas y minerales esenciales",
    type: "salud",
    tags: ["Vitaminas", "Salud general"],
    dosage: "1 cápsula",
    timing: "Con el desayuno",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    benefits: ["Cubre deficiencias", "Mejor inmunidad"],
    brand: "NOW Foods",
    price: 15.99,
  },
  {
    id: "omega3",
    name: "Omega-3 (1000mg)",
    description: "Ácidos grasos para salud cardiovascular",
    type: "salud",
    tags: ["Omega-3", "Salud general"],
    dosage: "1000mg (1 cápsula)",
    timing: "Con las comidas",
    calories: 10,
    protein: 0,
    carbs: 0,
    fat: 1,
    nutritionalInfo: {
      calories: 10,
      protein: 0,
      carbs: 0,
      fat: 1,
    },
    benefits: ["Salud cardiovascular", "Antiinflamatorio"],
    brand: "Life Extension",
    price: 18.99,
  },
  {
    id: "vitamin-d",
    name: "Vitamina D3 (2000 IU)",
    description: "Vitamina D para salud ósea y sistema inmune",
    type: "salud",
    tags: ["Vitaminas", "Salud general"],
    dosage: "2000 IU (1 cápsula)",
    timing: "Con el desayuno",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    benefits: ["Huesos fuertes", "Mejor inmunidad"],
    brand: "NOW Foods",
    price: 12.99,
  },
  {
    id: "magnesium",
    name: "Magnesio (400mg)",
    description: "Magnesio para función muscular y mejor sueño",
    type: "salud",
    tags: ["Minerales", "Sueño"],
    dosage: "400mg (1 cápsula)",
    timing: "Antes de dormir",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
    benefits: ["Mejor sueño", "Relajación muscular"],
    brand: "Thorne",
    price: 16.99,
  },
];

export default allSupplements;
