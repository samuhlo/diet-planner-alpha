# Estructura de Datos - Planificador de Dieta

## Organización

La estructura de datos ha sido reorganizada para ser más eficiente y mantenible:

### 📁 Archivos de Datos (`src/data/`)

- **`recipes.ts`** - Solo contiene los datos de recetas (sin funciones de utilidad)
- **`recipeSources.ts`** - Fuentes centralizadas de recetas
- **`snacks.ts`** - Solo contiene los datos de snacks (sin funciones de utilidad)
- **`supplements.ts`** - Solo contiene los datos de suplementos (sin funciones de utilidad)
- **`tips.ts`** - Solo contiene los datos de tips (sin funciones de utilidad)
- **`index.ts`** - Archivo de índice que exporta todo

### 📁 Utilidades (`src/utils/`)

- **`recipeUtils.ts`** - Funciones de utilidad para trabajar con recetas
- **`snackUtils.ts`** - Funciones de utilidad para trabajar con snacks
- **`supplementUtils.ts`** - Funciones de utilidad para trabajar con suplementos
- **`tipUtils.ts`** - Funciones de utilidad para trabajar con tips
- **`index.ts`** - Archivo de índice para exportar todas las utilidades

## Uso de la Nueva Estructura

### Importar Datos

```typescript
// Importar desde el archivo de índice principal
import {
  allMeals,
  allSnacks,
  allSupplements,
  allTips,
  recipeSources,
} from "../data";

// O importar desde archivos específicos
import { allMeals } from "../data/recipes";
import { allSnacks } from "../data/snacks";
import { allSupplements } from "../data/supplements";
import { allTips } from "../data/tips";
import { recipeSources } from "../data/recipeSources";
```

### Importar Utilidades

```typescript
// Importar desde el archivo de índice de utilidades
import {
  getRecipesByType,
  searchRecipes,
  filterRecipes,
  getSnacksByType,
  searchSnacks,
  filterSnacks,
  getSupplementsByTag,
  searchSupplements,
  filterSupplements,
  getTipsByTag,
  searchTips,
  getRandomTips,
} from "../utils";

// O importar desde archivos específicos
import { getRecipesByType } from "../utils/recipeUtils";
import { getSnacksByType } from "../utils/snackUtils";
import { getSupplementsByTag } from "../utils/supplementUtils";
import { getTipsByTag } from "../utils/tipUtils";
```

## Campo `source` en Recetas

Cada receta ahora puede incluir información sobre su fuente:

```typescript
{
  nombre: "Frittata de Espinacas y Feta",
  tipo: "Desayuno",
  // ... otros campos
  source: {
    id: "squatFit",
    name: "La Cocina Squat Fit",
    authors: "Maria Casas & Hamlet Sosa",
    type: "book",
    year: 2023,
  }
}
```

### Tipos de Fuente

- `"book"` - Libro
- `"website"` - Sitio web
- `"magazine"` - Revista
- `"personal"` - Recetas personales
- `"other"` - Otras fuentes

## Funciones de Utilidad Disponibles

### Para Recetas

- `getRecipesByType(recipes, type)` - Filtrar por tipo de comida
- `getRecipesByTag(recipes, tag)` - Filtrar por tag
- `searchRecipes(recipes, query)` - Buscar por nombre o tags
- `getRecipesBySource(recipes, sourceId)` - Filtrar por fuente
- `getUniqueSources(recipes)` - Obtener fuentes únicas
- `calculateTotalCalories(recipes)` - Calcular calorías totales
- `sortRecipesByCalories(recipes, ascending)` - Ordenar por calorías
- `filterRecipes(recipes, filters)` - Filtro avanzado con múltiples criterios

### Para Snacks

- `getSnacksByType(snacks, type)` - Filtrar por tipo (simple/elaborado)
- `getSnacksByTag(snacks, tag)` - Filtrar por tag
- `searchSnacks(snacks, query)` - Buscar por nombre o tags
- `getSimpleSnacks(snacks)` - Obtener solo snacks simples
- `getElaboratedSnacks(snacks)` - Obtener solo snacks elaborados
- `calculateTotalSnackCalories(snacks)` - Calcular calorías totales
- `sortSnacksByCalories(snacks, ascending)` - Ordenar por calorías
- `filterSnacks(snacks, filters)` - Filtro avanzado con múltiples criterios
- `getSnacksByNutritionalCategory(snacks, category)` - Filtrar por categoría nutricional
- `getSnacksByTimeOfDay(snacks, timeOfDay)` - Filtrar por momento del día

### Para Suplementos

- `getSupplementsByTag(supplements, tag)` - Filtrar por tag
- `searchSupplements(supplements, query)` - Buscar por nombre, descripción o tags
- `getSupplementsWithCalories(supplements)` - Obtener suplementos con calorías
- `getSupplementsWithoutCalories(supplements)` - Obtener suplementos sin calorías
- `getSupplementsWithProtein(supplements)` - Obtener suplementos con proteína
- `calculateTotalSupplementCalories(supplements)` - Calcular calorías totales
- `calculateTotalSupplementProtein(supplements)` - Calcular proteína total
- `sortSupplementsByCalories(supplements, ascending)` - Ordenar por calorías
- `sortSupplementsByProtein(supplements, ascending)` - Ordenar por proteína
- `filterSupplements(supplements, filters)` - Filtro avanzado con múltiples criterios
- `getSupplementsByCategory(supplements, category)` - Filtrar por categoría funcional
- `getSupplementsByGoal(supplements, goal)` - Filtrar por objetivo

### Para Tips

- `getTipsByTag(tips, tag)` - Filtrar por tag
- `searchTips(tips, query)` - Buscar por título, contenido o tags
- `getTipsByCategory(tips, category)` - Filtrar por categoría
- `getRandomTips(tips, count)` - Obtener tips aleatorios
- `getTipsByRelevance(tips, relevantTags)` - Filtrar por relevancia
- `getTipsByTimeOfDay(tips, timeOfDay)` - Filtrar por momento del día
- `getTipsByGoal(tips, goal)` - Filtrar por objetivo
- `getUniqueTipTags(tips)` - Obtener tags únicos
- `getTipsByKeywords(tips, keywords)` - Filtrar por palabras clave

## Ejemplos de Uso

### Filtro Avanzado para Recetas

```typescript
const recetasFiltradas = filterRecipes(allMeals, {
  type: "Cena",
  tags: ["Fácil", "Rápida"],
  maxCalories: 400,
  minProtein: 20,
  sourceId: "squatFit",
});
```

### Filtro Avanzado para Snacks

```typescript
const snacksFiltrados = filterSnacks(allSnacks, {
  type: "simple",
  tags: ["Natural"],
  maxCalories: 100,
  minProtein: 5,
  maxCarbs: 20,
  maxFat: 5,
});
```

### Filtro Avanzado para Suplementos

```typescript
const suplementosFiltrados = filterSupplements(allSupplements, {
  tags: ["Proteína"],
  maxCalories: 120,
  minProtein: 20,
  hasCalories: true,
});
```

### Categorías Nutricionales para Snacks

```typescript
const snacksProteinas = getSnacksByNutritionalCategory(allSnacks, "protein");
const snacksCarbohidratos = getSnacksByNutritionalCategory(allSnacks, "carbs");
const snacksGrasas = getSnacksByNutritionalCategory(allSnacks, "fat");
const snacksFibra = getSnacksByNutritionalCategory(allSnacks, "fiber");
```

### Momentos del Día para Snacks

```typescript
const snacksMañana = getSnacksByTimeOfDay(allSnacks, "morning");
const snacksTarde = getSnacksByTimeOfDay(allSnacks, "afternoon");
const snacksNoche = getSnacksByTimeOfDay(allSnacks, "evening");
const snacksPostEntrenamiento = getSnacksByTimeOfDay(allSnacks, "post-workout");
```

### Categorías Funcionales para Suplementos

```typescript
const suplementosProteinas = getSupplementsByCategory(
  allSupplements,
  "protein"
);
const suplementosVitaminas = getSupplementsByCategory(
  allSupplements,
  "vitamins"
);
const suplementosMinerales = getSupplementsByCategory(
  allSupplements,
  "minerals"
);
const suplementosPerformance = getSupplementsByCategory(
  allSupplements,
  "performance"
);
const suplementosSalud = getSupplementsByCategory(allSupplements, "health");
```

### Objetivos para Suplementos

```typescript
const suplementosMusculo = getSupplementsByGoal(allSupplements, "muscle-gain");
const suplementosPerdidaPeso = getSupplementsByGoal(
  allSupplements,
  "weight-loss"
);
const suplementosSaludGeneral = getSupplementsByGoal(
  allSupplements,
  "general-health"
);
const suplementosPerformance = getSupplementsByGoal(
  allSupplements,
  "performance"
);
const suplementosRecuperacion = getSupplementsByGoal(
  allSupplements,
  "recovery"
);
```

### Categorías para Tips

```typescript
const tipsNutricion = getTipsByCategory(allTips, "nutrition");
const tipsCocina = getTipsByCategory(allTips, "cooking");
const tipsPlanificacion = getTipsByCategory(allTips, "planning");
const tipsEstiloVida = getTipsByCategory(allTips, "lifestyle");
const tipsConsejos = getTipsByCategory(allTips, "tips");
```

### Objetivos para Tips

```typescript
const tipsPerdidaPeso = getTipsByGoal(allTips, "weight-loss");
const tipsGanarMusculo = getTipsByGoal(allTips, "muscle-gain");
const tipsSaludGeneral = getTipsByGoal(allTips, "general-health");
const tipsPreparacionComidas = getTipsByGoal(allTips, "meal-prep");
const tipsPresupuesto = getTipsByGoal(allTips, "budget");
```

## Agregar Nuevas Fuentes

Para agregar una nueva fuente, edita `src/data/recipeSources.ts`:

```typescript
export const recipeSources: Record<string, RecipeSource> = {
  // ... fuentes existentes
  nuevaFuente: {
    id: "nuevaFuente",
    name: "Mi Nuevo Libro de Cocina",
    authors: "Autor Apellido",
    type: "book",
    year: 2024,
    url: "https://ejemplo.com", // opcional
  },
};
```

## Agregar Nuevas Recetas

Para agregar una nueva receta, edita `src/data/recipes.ts`:

```typescript
{
  nombre: "Nueva Receta",
  tipo: "Desayuno", // "Desayuno" | "Almuerzo" | "Cena" | "Snack"
  tags: ["Rápida", "Fácil"],
  calorias: 300,
  p: 25, // proteínas
  c: 30, // carbohidratos
  f: 15, // grasas
  ingredientes: [
    { n: "ingrediente", q: 100, u: "g" },
  ],
  preparacion: "Instrucciones de preparación...", // opcional
  source: recipeSources.personal, // opcional
}
```

## Agregar Nuevos Snacks

Para agregar un nuevo snack, edita `src/data/snacks.ts`:

```typescript
{
  id: "nuevo-snack",
  nombre: "Nuevo Snack",
  tipo: "simple", // "simple" | "elaborado"
  calorias: 100,
  p: 5, // proteínas
  c: 15, // carbohidratos
  f: 3, // grasas
  tags: ["Natural", "Fácil"],
  porcion: "1 unidad (50g)",
  // Solo para snacks elaborados:
  ingredientes: [
    { n: "ingrediente", q: 50, u: "g" },
  ],
  preparacion: "Instrucciones de preparación...", // opcional
}
```

## Agregar Nuevos Suplementos

Para agregar un nuevo suplemento, edita `src/data/supplements.ts`:

```typescript
{
  id: "nuevo-suplemento",
  name: "Nuevo Suplemento",
  calories: 50,
  protein: 10,
  carbs: 5, // opcional
  fat: 2, // opcional
  serving: "30g (1 scoop)",
  description: "Descripción del suplemento...",
  tags: ["Proteína", "Post-entrenamiento"],
}
```

## Agregar Nuevos Tips

Para agregar un nuevo tip, edita `src/data/tips.ts`:

```typescript
{
  id: "nuevo-tip",
  title: "Título del Tip",
  content: `<p>Contenido del tip con <strong>formato HTML</strong>...</p>`,
  tags: ["Nutrición", "Consejos"],
}
```

## Ventajas de la Nueva Estructura

1. **Separación de responsabilidades** - Datos y lógica claramente separados
2. **Reutilización** - Las utilidades se pueden usar en cualquier parte del proyecto
3. **Mantenibilidad** - Más fácil de mantener y actualizar
4. **Escalabilidad** - Fácil agregar nuevas fuentes, recetas, snacks, suplementos y tips
5. **Tipado fuerte** - TypeScript garantiza consistencia
6. **Organización clara** - Estructura de archivos intuitiva
7. **Funcionalidades específicas** - Utilidades especializadas para cada tipo de dato
8. **Documentación completa** - Guías de uso y ejemplos incluidos
9. **Consistencia** - Misma estructura para todos los tipos de datos
10. **Flexibilidad** - Filtros y búsquedas avanzadas para cada tipo
