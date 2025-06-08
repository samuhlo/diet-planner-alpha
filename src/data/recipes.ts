// src/data/recipes.ts

// Estructura ingrediente
export interface Ingredient {
  n: string; // n: nombre
  q: number; // q: cantidad
  u: string; // u: unidad
}

// Estructura receta
export interface Recipe {
  nombre: string;
  tipo: "desayuno" | "almuerzo" | "cena" | "snack";
  tags: string[];
  calorias: number;
  p: number; // Proteínas
  c: number; // Carbohidratos
  f: number; // Grasas (Fats)
  ingredientes: Ingredient[];
  preparacion?: string;
}

export const allMeals: Recipe[] = [
  // Existing recipes
  {
    nombre: "Revuelto (3 huevos) con atún y espinacas",
    tipo: "desayuno",
    tags: ["desayuno", "rápida", "fácil"],
    calorias: 340,
    p: 35,
    c: 5,
    f: 20,
    ingredientes: [
      { n: "huevo", q: 3, u: "unidad" },
      { n: "atún al natural", q: 1, u: "lata" },
      { n: "espinaca fresca", q: 1, u: "puñado" },
    ],
  },
  {
    nombre: "Tortilla (3 huevos) con queso",
    tipo: "desayuno",
    tags: ["desayuno", "rápida", "fácil", "vegetariana"],
    calorias: 330,
    p: 25,
    c: 2,
    f: 25,
    ingredientes: [
      { n: "huevo", q: 3, u: "unidad" },
      { n: "queso", q: 1, u: "loncha" },
    ],
  },
  {
    nombre: "Revuelto (2 huevos) con queso fresco",
    tipo: "desayuno",
    tags: ["desayuno", "rápida", "fácil", "vegetariana"],
    calorias: 250,
    p: 28,
    c: 5,
    f: 13,
    ingredientes: [
      { n: "huevo", q: 2, u: "unidad" },
      { n: "queso fresco batido 0%", q: 100, u: "g" },
    ],
  },
  {
    nombre: "Bol de yogur griego con queso y arándanos",
    tipo: "desayuno",
    tags: ["desayuno", "rápida", "fácil", "vegetariana"],
    calorias: 280,
    p: 25,
    c: 15,
    f: 14,
    ingredientes: [
      { n: "yogur griego natural", q: 200, u: "g" },
      { n: "queso curado", q: 30, u: "g" },
      { n: "arándano", q: 1, u: "puñado" },
    ],
  },
  {
    nombre: "Frittata de Espinacas y Feta",
    tipo: "desayuno",
    tags: ["desayuno", "elaborada", "vegetariana"],
    calorias: 280,
    p: 18,
    c: 8,
    f: 20,
    ingredientes: [
      { n: "huevo", q: 2, u: "unidad" },
      { n: "espinaca", q: 70, u: "g" },
      { n: "champiñón", q: 50, u: "g" },
      { n: "queso feta", q: 20, u: "g" },
      { n: "cebolla", q: 0.25, u: "unidad" },
    ],
    preparacion:
      "1. Horno 180°C. 2. Saltear verduras. 3. Batir huevos, añadir feta y salteado. 4. Hornear 20-25 min.",
  },
  {
    nombre: "Crema de lentejas rojas al curry",
    tipo: "cena",
    tags: ["cena", "rápida", "fácil", "vegetariana", "vegana"],
    calorias: 350,
    p: 18,
    c: 45,
    f: 10,
    ingredientes: [
      { n: "lenteja roja", q: 100, u: "g" },
      { n: "cebolla", q: 0.5, u: "unidad" },
      { n: "zanahoria", q: 1, u: "unidad" },
      { n: "leche de coco light", q: 100, u: "ml" },
      { n: "curry en polvo", q: 1, u: "cucharadita" },
    ],
    preparacion:
      "1. Sofreír cebolla y zanahoria. 2. Añadir lentejas, curry y agua/caldo. Cocer 15 min. 3. Añadir leche de coco y triturar.",
  },
  {
    nombre: "Ensalada gigante con atún y huevo",
    tipo: "almuerzo",
    tags: ["almuerzo", "fácil"],
    calorias: 420,
    p: 45,
    c: 15,
    f: 20,
    ingredientes: [
      { n: "hojas verdes variadas", q: 1, u: "bol" },
      { n: "tomate", q: 1, u: "unidad" },
      { n: "pepino", q: 0.5, u: "unidad" },
      { n: "cebolla", q: 0.25, u: "unidad" },
      { n: "atún al natural", q: 2, u: "lata" },
      { n: "huevo duro", q: 1, u: "unidad" },
    ],
  },
  {
    nombre: "Lentejas estofadas con caballa",
    tipo: "almuerzo",
    tags: ["almuerzo", "fácil"],
    calorias: 500,
    p: 40,
    c: 55,
    f: 15,
    ingredientes: [
      { n: "lentejas cocidas", q: 1, u: "bote" },
      { n: "pimiento", q: 0.5, u: "unidad" },
      { n: "cebolla", q: 0.5, u: "unidad" },
      { n: "zanahoria", q: 1, u: "unidad" },
      { n: "caballa en conserva", q: 2, u: "lata" },
    ],
  },
  {
    nombre: "Pollo/Merluza a la plancha con pisto",
    tipo: "almuerzo",
    tags: ["almuerzo", "rápida", "fácil"],
    calorias: 330,
    p: 45,
    c: 15,
    f: 10,
    ingredientes: [
      { n: "pechuga de pollo o merluza", q: 200, u: "g" },
      { n: "pisto de verduras", q: 150, u: "g" },
    ],
  },
  {
    nombre: "Ensalada de quinoa y verduras asadas",
    tipo: "almuerzo",
    tags: ["almuerzo", "fácil", "vegetariana"],
    calorias: 450,
    p: 15,
    c: 50,
    f: 20,
    ingredientes: [
      { n: "quinoa", q: 60, u: "g" },
      { n: "calabacín", q: 0.5, u: "unidad" },
      { n: "pimiento rojo", q: 0.5, u: "unidad" },
      { n: "queso feta", q: 40, u: "g" },
      { n: "limón", q: 0.5, u: "unidad" },
    ],
    preparacion:
      "1. Cocer la quinoa. 2. Asar las verduras en dados. 3. Mezclar todo con el queso feta y aliñar con limón.",
  },
  {
    nombre: "Pescado en Papillote con Verduras",
    tipo: "almuerzo",
    tags: ["almuerzo", "elaborada"],
    calorias: 350,
    p: 40,
    c: 10,
    f: 18,
    ingredientes: [
      { n: "salmón o merluza", q: 180, u: "g" },
      { n: "zanahoria", q: 0.5, u: "unidad" },
      { n: "calabacín", q: 0.5, u: "unidad" },
      { n: "puerro", q: 0.25, u: "unidad" },
    ],
    preparacion:
      "1. Horno 200°C. 2. Poner verduras y pescado en papel de horno. 3. Cerrar y hornear 15-20 min.",
  },
  {
    nombre: "Wok de garbanzos y tofu",
    tipo: "cena",
    tags: ["cena", "rápida", "fácil", "vegetariana", "vegana"],
    calorias: 400,
    p: 25,
    c: 40,
    f: 15,
    ingredientes: [
      { n: "garbanzos cocidos", q: 150, u: "g" },
      { n: "tofu firme", q: 100, u: "g" },
      { n: "brócoli", q: 100, u: "g" },
      { n: "salsa de soja", q: 2, u: "cucharada" },
    ],
    preparacion:
      "1. Saltear el tofu en dados hasta dorar. 2. Añadir brócoli y saltear. 3. Incorporar garbanzos y salsa de soja. Cocinar 2 min más.",
  },
  {
    nombre: "Revuelto con espárragos y jamón",
    tipo: "cena",
    tags: ["cena", "rápida", "fácil"],
    calorias: 300,
    p: 25,
    c: 8,
    f: 19,
    ingredientes: [
      { n: "huevo", q: 2, u: "unidad" },
      { n: "espárrago triguero", q: 100, u: "g" },
      { n: "jamón serrano", q: 30, u: "g" },
    ],
  },
  {
    nombre: "'Lasaña' de Calabacín y Atún",
    tipo: "cena",
    tags: ["cena", "elaborada"],
    calorias: 380,
    p: 35,
    c: 15,
    f: 20,
    ingredientes: [
      { n: "calabacín", q: 1, u: "unidad" },
      { n: "atún", q: 2, u: "lata" },
      { n: "tomate triturado", q: 200, u: "g" },
      { n: "cebolla", q: 0.5, u: "unidad" },
    ],
    preparacion:
      "1. Horno 190°C. 2. Cortar calabacín en láminas. 3. Hacer sofrito. 4. Montar capas y hornear 20-25 min.",
  },

  // New recipes from PDF
  {
    nombre: "Pancakes Frutos Rojos",
    tipo: "desayuno",
    tags: ["desayuno", "elaborada"],
    calorias: 440,
    p: 25,
    c: 60,
    f: 10,
    ingredientes: [
      { n: "claras de huevo", q: 85, u: "ml" },
      { n: "harina de trigo", q: 85, u: "g" },
      { n: "leche desnatada", q: 250, u: "ml" },
      { n: "levadura", q: 6, u: "g" },
      { n: "Mix sabor choco blanco", q: 0.5, u: "sobre" },
      { n: "fresas", q: 60, u: "g" },
      { n: "arándanos", q: 40, u: "g" },
    ],
    preparacion:
      "1. Integra todos los ingredientes de la masa y reposa 20 min. 2. Calienta una sartén con spray de aceite a fuego medio. 3. Vierte la masa y deja 1-2 min por lado. Sirve con los toppings.",
  },
  {
    nombre: "Crepes estilo Caprese",
    tipo: "almuerzo",
    tags: ["almuerzo", "fácil", "vegetariana"],
    calorias: 450,
    p: 30,
    c: 30,
    f: 23,
    ingredientes: [
      { n: "claras de huevo", q: 60, u: "ml" },
      { n: "huevo", q: 1, u: "unidad" },
      { n: "leche de almendras 0%", q: 100, u: "ml" },
      { n: "harina de avena", q: 25, u: "g" },
      { n: "mozzarella light", q: 80, u: "g" },
      { n: "tomate", q: 2, u: "unidad" },
    ],
    preparacion:
      "1. Mezcla los ingredientes de la masa y vierte en una sartén. Da para 3-5 crepes. 2. Lamina el tomate y la mozzarella. 3. Sirve con salsa pesto.",
  },
  {
    nombre: "Boniato Burger",
    tipo: "almuerzo",
    tags: ["almuerzo", "fácil"],
    calorias: 440,
    p: 30,
    c: 45,
    f: 15,
    ingredientes: [
      { n: "carne picada ternera", q: 120, u: "g" },
      { n: "boniato", q: 150, u: "g" },
      { n: "tomate", q: 25, u: "g" },
      { n: "mozzarella light", q: 40, u: "g" },
      { n: "lechuga", q: 1, u: "hoja" },
    ],
    preparacion:
      "1. Mezcla la carne con especias y forma la hamburguesa. 2. Cocina a fuego 6/10 por 5-10 min. 3. Lava el boniato, córtalo como pan y cuécelo al microondas. 4. Monta y sirve.",
  },
  {
    nombre: "Palomitas de pollo",
    tipo: "snack",
    tags: ["snack", "fácil"],
    calorias: 180,
    p: 25,
    c: 15,
    f: 2,
    ingredientes: [
      { n: "pechuga de pollo", q: 133, u: "g" },
      { n: "huevo", q: 0.33, u: "unidad" },
      { n: "clara de huevo", q: 0.33, u: "unidad" },
      { n: "pan rallado", q: 40, u: "g" },
      { n: "copos de maíz 0%", q: 27, u: "g" },
    ],
    preparacion:
      "1. Mezcla claras con huevo en un bol, y pan con copos en otro. 2. Reboza el pollo, primero en huevo y luego en la mezcla de pan. 3. Coloca en una bandeja de horno y hornea a 150°C durante 30 minutos.",
  },
  {
    nombre: "Ensalada Burrito",
    tipo: "almuerzo",
    tags: ["almuerzo", "rápida", "fácil"],
    calorias: 425,
    p: 35,
    c: 30,
    f: 18,
    ingredientes: [
      { n: "lechuga", q: 150, u: "g" },
      { n: "guacamole casero", q: 20, u: "g" },
      { n: "salsa fajitas", q: 40, u: "g" },
      { n: "maíz dulce", q: 30, u: "g" },
      { n: "dip alubias rojas", q: 70, u: "g" },
      { n: "pollo picado BBQ", q: 70, u: "g" },
    ],
    preparacion:
      "1. Lava la lechuga si es necesario. 2. Mezcla todos los ingredientes en un bol.",
  },
  {
    nombre: "Pimientos Rellenos",
    tipo: "almuerzo",
    tags: ["almuerzo", "elaborada"],
    calorias: 400,
    p: 25,
    c: 40,
    f: 15,
    ingredientes: [
      { n: "pimientos tricolor", q: 400, u: "g" },
      { n: "cuscús cocido", q: 80, u: "g" },
      { n: "queso en polvo", q: 10, u: "g" },
      { n: "mozzarella light", q: 60, u: "g" },
      { n: "pollo picado BBQ", q: 80, u: "g" },
      { n: "tomate frito", q: 20, u: "g" },
    ],
    preparacion:
      "1. Hornea los pimientos vacíos a 170°C por 15 min. 2. Saltea los ingredientes del relleno. 3. Rellena los pimientos, añade mozzarella y hornea otros 15 min.",
  },
  {
    nombre: "Lasaña de repollo",
    tipo: "cena",
    tags: ["cena", "elaborada"],
    calorias: 320,
    p: 30,
    c: 20,
    f: 14,
    ingredientes: [
      { n: "repollo chimichurri", q: 210, u: "g" },
      { n: "pollo picado BBQ", q: 100, u: "g" },
      { n: "cuscús cocido", q: 20, u: "g" },
      { n: "tomate triturado", q: 40, u: "g" },
      { n: "mozzarella light", q: 60, u: "g" },
    ],
    preparacion:
      "1. Mezcla los ingredientes del relleno. 2. En una fuente de horno, alterna capas de repollo y relleno. 3. Cubre con toppings y hornea a 200°C por 5 min.",
  },
  {
    nombre: "Pizza Keto",
    tipo: "cena",
    tags: ["cena", "elaborada", "vegetariana"],
    calorias: 400,
    p: 40,
    c: 10,
    f: 22,
    ingredientes: [
      { n: "claras de huevo", q: 240, u: "g" },
      { n: "harina de coco", q: 24, u: "g" },
      { n: "salsa Pizza", q: 40, u: "g" },
      { n: "mozzarella light", q: 80, u: "g" },
      { n: "jamón york", q: 25, u: "g" },
    ],
    preparacion:
      "1. Mezcla los ingredientes de la masa y cocina en una sartén. 2. Añade los toppings y hornea a 200°C por 5 min.",
  },
  {
    nombre: "Pastel de brócoli",
    tipo: "cena",
    tags: ["cena", "fácil"],
    calorias: 410,
    p: 45,
    c: 15,
    f: 20,
    ingredientes: [
      { n: "brócoli cocido", q: 250, u: "g" },
      { n: "salsa carbonara", q: 30, u: "g" },
      { n: "leche de almendras 0%", q: 80, u: "ml" },
      { n: "pollo picado BBQ", q: 100, u: "g" },
      { n: "mozzarella light", q: 70, u: "g" },
    ],
    preparacion:
      "1. Saltea los ingredientes del relleno. 2. Coloca en una bandeja para horno, cubre con queso y hornea a 200°C por 4 min.",
  },
  {
    nombre: "Salmón con patatas alioli",
    tipo: "cena",
    tags: ["cena", "fácil"],
    calorias: 425,
    p: 30,
    c: 30,
    f: 20,
    ingredientes: [
      { n: "patatas", q: 200, u: "g" },
      { n: "salmón", q: 120, u: "g" },
      { n: "salsa Alioli Light", q: 70, u: "g" },
    ],
    preparacion:
      "1. Cocina el salmón. 2. Hornea las patatas. 3. Sirve junto con la salsa.",
  },
];
