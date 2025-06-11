import type { Snack } from "../types";

export const allSnacks: Snack[] = [
  // SNACKS SIMPLES
  {
    id: "manzana",
    nombre: "Manzana",
    tipo: "simple",
    calorias: 52,
    p: 0.3,
    c: 14,
    f: 0.2,
    tags: ["Fruta", "Fibra", "Natural"],
    porcion: "1 unidad (150g)",
  },
  {
    id: "platano",
    nombre: "Plátano",
    tipo: "simple",
    calorias: 89,
    p: 1.1,
    c: 23,
    f: 0.3,
    tags: ["Fruta", "Potasio", "Natural"],
    porcion: "1 unidad (120g)",
  },
  {
    id: "naranja",
    nombre: "Naranja",
    tipo: "simple",
    calorias: 47,
    p: 0.9,
    c: 12,
    f: 0.1,
    tags: ["Fruta", "Vitamina C", "Natural"],
    porcion: "1 unidad (130g)",
  },
  {
    id: "fresas",
    nombre: "Fresas",
    tipo: "simple",
    calorias: 32,
    p: 0.7,
    c: 8,
    f: 0.3,
    tags: ["Fruta", "Antioxidantes", "Natural"],
    porcion: "1 taza (150g)",
  },
  {
    id: "zanahoria",
    nombre: "Zanahoria",
    tipo: "simple",
    calorias: 41,
    p: 0.9,
    c: 10,
    f: 0.2,
    tags: ["Verdura", "Betacaroteno", "Natural"],
    porcion: "1 unidad (100g)",
  },
  {
    id: "pepino",
    nombre: "Pepino",
    tipo: "simple",
    calorias: 16,
    p: 0.7,
    c: 4,
    f: 0.1,
    tags: ["Verdura", "Hidratación", "Natural"],
    porcion: "1 unidad (100g)",
  },
  {
    id: "tomate-cherry",
    nombre: "Tomate Cherry",
    tipo: "simple",
    calorias: 18,
    p: 0.9,
    c: 4,
    f: 0.2,
    tags: ["Verdura", "Licopeno", "Natural"],
    porcion: "1 taza (150g)",
  },
  {
    id: "nueces",
    nombre: "Nueces",
    tipo: "simple",
    calorias: 185,
    p: 4.3,
    c: 4,
    f: 18.5,
    tags: ["Frutos secos", "Omega-3", "Proteína"],
    porcion: "30g (1 puñado)",
  },
  {
    id: "almendras",
    nombre: "Almendras",
    tipo: "simple",
    calorias: 164,
    p: 6,
    c: 6,
    f: 14,
    tags: ["Frutos secos", "Vitamina E", "Proteína"],
    porcion: "30g (1 puñado)",
  },
  {
    id: "avellanas",
    nombre: "Avellanas",
    tipo: "simple",
    calorias: 178,
    p: 4.2,
    c: 5,
    f: 17,
    tags: ["Frutos secos", "Vitamina E", "Proteína"],
    porcion: "30g (1 puñado)",
  },
  {
    id: "queso-fresco",
    nombre: "Queso Fresco",
    tipo: "simple",
    calorias: 72,
    p: 11,
    c: 3,
    f: 2,
    tags: ["Lácteo", "Proteína", "Calcio"],
    porcion: "100g",
  },
  {
    id: "yogur-griego",
    nombre: "Yogur Griego Natural",
    tipo: "simple",
    calorias: 59,
    p: 10,
    c: 3.6,
    f: 0.4,
    tags: ["Lácteo", "Proteína", "Probióticos"],
    porcion: "100g",
  },
  {
    id: "huevo-duro",
    nombre: "Huevo Duro",
    tipo: "simple",
    calorias: 78,
    p: 6.3,
    c: 0.6,
    f: 5.3,
    tags: ["Proteína", "Colina", "Natural"],
    porcion: "1 unidad (50g)",
  },
  {
    id: "atun-lata",
    nombre: "Atún al Natural",
    tipo: "simple",
    calorias: 116,
    p: 26,
    c: 0,
    f: 1,
    tags: ["Pescado", "Proteína", "Omega-3"],
    porcion: "1 lata (80g)",
  },
  {
    id: "pechuga-pollo",
    nombre: "Pechuga de Pollo",
    tipo: "simple",
    calorias: 165,
    p: 31,
    c: 0,
    f: 3.6,
    tags: ["Carne", "Proteína", "Magra"],
    porcion: "100g",
  },

  // SNACKS ELABORADOS
  {
    id: "batido-proteinas",
    nombre: "Batido de Proteínas",
    tipo: "elaborado",
    calorias: 180,
    p: 25,
    c: 15,
    f: 2,
    ingredientes: [
      { n: "proteína en polvo", q: 30, u: "g" },
      { n: "leche desnatada", q: 200, u: "ml" },
      { n: "plátano", q: 1, u: "unidad" },
    ],
    preparacion:
      "1. Añadir todos los ingredientes a la batidora. 2. Batir hasta que esté suave. 3. Servir inmediatamente.",
    tags: ["Proteína", "Post-entrenamiento", "Elaborado"],
    porcion: "1 batido (250ml)",
  },
  {
    id: "yogur-frutos-secos",
    nombre: "Yogur con Frutos Secos",
    tipo: "elaborado",
    calorias: 200,
    p: 15,
    c: 10,
    f: 12,
    ingredientes: [
      { n: "yogur griego natural", q: 150, u: "g" },
      { n: "nueces", q: 15, u: "g" },
      { n: "miel", q: 1, u: "cucharadita" },
    ],
    preparacion:
      "1. Mezclar el yogur con la miel. 2. Añadir las nueces picadas. 3. Revolver suavemente.",
    tags: ["Lácteo", "Proteína", "Elaborado"],
    porcion: "1 taza (180g)",
  },
  {
    id: "ensalada-frutas",
    nombre: "Ensalada de Frutas",
    tipo: "elaborado",
    calorias: 120,
    p: 2,
    c: 30,
    f: 0.5,
    ingredientes: [
      { n: "manzana", q: 0.5, u: "unidad" },
      { n: "plátano", q: 0.5, u: "unidad" },
      { n: "naranja", q: 0.5, u: "unidad" },
      { n: "fresas", q: 0.5, u: "taza" },
    ],
    preparacion:
      "1. Lavar y cortar todas las frutas. 2. Mezclar en un bol. 3. Servir fresco.",
    tags: ["Fruta", "Vitaminas", "Elaborado"],
    porcion: "1 taza (200g)",
  },
  {
    id: "hummus-zanahorias",
    nombre: "Hummus con Zanahorias",
    tipo: "elaborado",
    calorias: 150,
    p: 6,
    c: 20,
    f: 6,
    ingredientes: [
      { n: "garbanzos cocidos", q: 50, u: "g" },
      { n: "tahini", q: 1, u: "cucharada" },
      { n: "limón", q: 0.25, u: "unidad" },
      { n: "zanahoria", q: 1, u: "unidad" },
    ],
    preparacion:
      "1. Triturar garbanzos, tahini y limón. 2. Cortar zanahoria en palitos. 3. Servir hummus con zanahorias.",
    tags: ["Vegetariano", "Fibra", "Elaborado"],
    porcion: "1 porción (120g)",
  },
  {
    id: "tortilla-espinacas",
    nombre: "Tortilla de Espinacas",
    tipo: "elaborado",
    calorias: 180,
    p: 15,
    c: 3,
    f: 12,
    ingredientes: [
      { n: "huevo", q: 2, u: "unidad" },
      { n: "espinaca", q: 50, u: "g" },
      { n: "queso rallado", q: 20, u: "g" },
    ],
    preparacion:
      "1. Batir los huevos. 2. Añadir espinacas y queso. 3. Cocinar en sartén antiadherente.",
    tags: ["Proteína", "Verdura", "Elaborado"],
    porcion: "1 tortilla (150g)",
  },
  {
    id: "smoothie-verde",
    nombre: "Smoothie Verde",
    tipo: "elaborado",
    calorias: 140,
    p: 8,
    c: 25,
    f: 2,
    ingredientes: [
      { n: "espinaca", q: 30, u: "g" },
      { n: "plátano", q: 1, u: "unidad" },
      { n: "manzana", q: 0.5, u: "unidad" },
      { n: "leche de almendra", q: 150, u: "ml" },
    ],
    preparacion:
      "1. Lavar la espinaca. 2. Añadir todos los ingredientes a la batidora. 3. Batir hasta que esté suave.",
    tags: ["Verdura", "Natural", "Elaborado"],
    porcion: "1 vaso (250ml)",
  },
];

// Funciones de utilidad para trabajar con snacks
export const getSnacksByType = (type: Snack["tipo"]): Snack[] => {
  return allSnacks.filter((snack) => snack.tipo === type);
};

export const getSnacksByTag = (tag: string): Snack[] => {
  return allSnacks.filter((snack) => snack.tags.includes(tag));
};

export const searchSnacks = (query: string): Snack[] => {
  const lowercaseQuery = query.toLowerCase();
  return allSnacks.filter(
    (snack) =>
      snack.nombre.toLowerCase().includes(lowercaseQuery) ||
      snack.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getSimpleSnacks = (): Snack[] => {
  return getSnacksByType("simple");
};

export const getElaboratedSnacks = (): Snack[] => {
  return getSnacksByType("elaborado");
};
