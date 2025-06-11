export interface Supplement {
  id: string; // Un identificador único
  name: string; // El nombre que verá el usuario
  calories: number; // Calorías por toma
  protein: number; // Proteína por toma
  carbs?: number; // Carbohidratos por toma
  fat?: number; // Grasas por toma
  serving?: string; // Descripción de la porción
  description?: string; // Descripción del suplemento
  tags?: string[]; // Tags para categorización
}

export const allSupplements: Supplement[] = [
  {
    id: "default-whey",
    name: "Proteína Whey (30g)",
    calories: 109,
    protein: 24,
    carbs: 3,
    fat: 1,
    serving: "30g (1 scoop)",
    description:
      "Proteína de suero de leche de rápida absorción, ideal para post-entrenamiento",
    tags: ["Proteína", "Post-entrenamiento", "Rápida absorción"],
  },
  {
    id: "vegan-blend",
    name: "Mezcla Vegana (30g)",
    calories: 115,
    protein: 22,
    carbs: 4,
    fat: 1,
    serving: "30g (1 scoop)",
    description: "Proteína vegetal completa, perfecta para dietas veganas",
    tags: ["Proteína", "Vegano", "Vegetal", "Completa"],
  },
  {
    id: "casein",
    name: "Caseína (30g)",
    calories: 105,
    protein: 25,
    carbs: 2,
    fat: 1,
    serving: "30g (1 scoop)",
    description: "Proteína de lenta absorción, ideal para antes de dormir",
    tags: ["Proteína", "Lenta absorción", "Antes de dormir"],
  },
  {
    id: "creatine",
    name: "Creatina Monohidrato (5g)",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    serving: "5g (1 cucharadita)",
    description: "Suplemento para mejorar fuerza y potencia muscular",
    tags: ["Creatina", "Fuerza", "Potencia", "Sin calorías"],
  },
  {
    id: "bcaa",
    name: "BCAA (5g)",
    calories: 20,
    protein: 5,
    carbs: 0,
    fat: 0,
    serving: "5g (1 scoop)",
    description: "Aminoácidos ramificados para recuperación muscular",
    tags: ["Aminoácidos", "Recuperación", "Muscular"],
  },
  {
    id: "multivitamin",
    name: "Multivitamínico",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    serving: "1 cápsula",
    description: "Complejo vitamínico y mineral para salud general",
    tags: ["Vitaminas", "Minerales", "Salud general", "Sin calorías"],
  },
  {
    id: "omega3",
    name: "Omega-3 (1000mg)",
    calories: 10,
    protein: 0,
    carbs: 0,
    fat: 1,
    serving: "1000mg (1 cápsula)",
    description: "Ácidos grasos esenciales para salud cardiovascular",
    tags: ["Omega-3", "Cardiovascular", "Antiinflamatorio"],
  },
  {
    id: "vitamin-d",
    name: "Vitamina D3 (2000 IU)",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    serving: "2000 IU (1 cápsula)",
    description: "Vitamina D para salud ósea y sistema inmune",
    tags: ["Vitamina D", "Huesos", "Sistema inmune", "Sin calorías"],
  },
];
