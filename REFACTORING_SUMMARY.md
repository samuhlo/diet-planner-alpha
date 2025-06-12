# Resumen de Refactorización - Estructura de Datos

## 🎯 Objetivo

Reorganizar la estructura de datos para separar datos de funciones de utilidad, mejorar la mantenibilidad y escalabilidad del proyecto.

## ✅ Cambios Realizados

### 1. **Recetas (`recipes.ts`)**

- ✅ Separadas las funciones de utilidad a `src/utils/recipeUtils.ts`
- ✅ Agregado campo `source` opcional a las recetas
- ✅ Creado archivo `src/data/recipeSources.ts` para fuentes centralizadas
- ✅ Archivo `recipes.ts` ahora solo contiene datos

### 2. **Snacks (`snacks.ts`)**

- ✅ Separadas las funciones de utilidad a `src/utils/snackUtils.ts`
- ✅ Archivo `snacks.ts` ahora solo contiene datos
- ✅ Agregadas nuevas funciones de utilidad específicas para snacks

### 3. **Suplementos (`supplements.ts`)**

- ✅ Separadas las funciones de utilidad a `src/utils/supplementUtils.ts`
- ✅ Eliminada interfaz duplicada (ya existe en `types/index.ts`)
- ✅ Archivo `supplements.ts` ahora solo contiene datos
- ✅ Agregadas nuevas funciones de utilidad específicas para suplementos

### 4. **Tips (`tips.ts`)**

- ✅ Separadas las funciones de utilidad a `src/utils/tipUtils.ts`
- ✅ Eliminada interfaz duplicada (ya existe en `types/index.ts`)
- ✅ Corregido tipo `Tip` en `types/index.ts` para usar `title` y `content`
- ✅ Archivo `tips.ts` ahora solo contiene datos
- ✅ Agregadas nuevas funciones de utilidad específicas para tips

### 5. **Nuevos Archivos Creados**

#### Archivos de Datos:

- `src/data/recipeSources.ts` - Fuentes centralizadas de recetas
- `src/data/index.ts` - Archivo de índice para exportar todos los datos

#### Archivos de Utilidades:

- `src/utils/recipeUtils.ts` - Utilidades para recetas
- `src/utils/snackUtils.ts` - Utilidades para snacks
- `src/utils/supplementUtils.ts` - Utilidades para suplementos
- `src/utils/tipUtils.ts` - Utilidades para tips
- `src/utils/index.ts` - Archivo de índice para exportar todas las utilidades

#### Archivos de Ejemplo:

- `src/components/examples/RecipeExample.tsx` - Ejemplo de uso de recetas
- `src/components/examples/SnackExample.tsx` - Ejemplo de uso de snacks
- `src/components/examples/SupplementExample.tsx` - Ejemplo de uso de suplementos
- `src/components/examples/TipExample.tsx` - Ejemplo de uso de tips

#### Documentación:

- `src/data/README.md` - Documentación completa de la nueva estructura
- `REFACTORING_SUMMARY.md` - Este resumen

### 6. **Tipos Actualizados**

- ✅ Agregado tipo `RecipeSource` en `src/types/index.ts`
- ✅ Agregado campo `source` opcional al tipo `Recipe`
- ✅ Corregido tipo `Tip` para usar `title` y `content` en lugar de `titulo` y `contenido`

## 🚀 Nuevas Funcionalidades

### Para Recetas:

- `getRecipesByType()` - Filtrar por tipo
- `getRecipesByTag()` - Filtrar por tag
- `searchRecipes()` - Búsqueda por nombre o tags
- `getRecipesBySource()` - Filtrar por fuente
- `getUniqueSources()` - Obtener fuentes únicas
- `calculateTotalCalories()` - Calcular calorías totales
- `sortRecipesByCalories()` - Ordenar por calorías
- `filterRecipes()` - Filtro avanzado con múltiples criterios

### Para Snacks:

- `getSnacksByType()` - Filtrar por tipo (simple/elaborado)
- `getSnacksByTag()` - Filtrar por tag
- `searchSnacks()` - Búsqueda por nombre o tags
- `getSimpleSnacks()` - Obtener solo snacks simples
- `getElaboratedSnacks()` - Obtener solo snacks elaborados
- `calculateTotalSnackCalories()` - Calcular calorías totales
- `sortSnacksByCalories()` - Ordenar por calorías
- `filterSnacks()` - Filtro avanzado con múltiples criterios
- `getSnacksByNutritionalCategory()` - Filtrar por categoría nutricional
- `getSnacksByTimeOfDay()` - Filtrar por momento del día

### Para Suplementos:

- `getSupplementsByTag()` - Filtrar por tag
- `searchSupplements()` - Búsqueda por nombre, descripción o tags
- `getSupplementsWithCalories()` - Obtener suplementos con calorías
- `getSupplementsWithoutCalories()` - Obtener suplementos sin calorías
- `getSupplementsWithProtein()` - Obtener suplementos con proteína
- `calculateTotalSupplementCalories()` - Calcular calorías totales
- `calculateTotalSupplementProtein()` - Calcular proteína total
- `sortSupplementsByCalories()` - Ordenar por calorías
- `sortSupplementsByProtein()` - Ordenar por proteína
- `filterSupplements()` - Filtro avanzado con múltiples criterios
- `getSupplementsByCategory()` - Filtrar por categoría funcional
- `getSupplementsByGoal()` - Filtrar por objetivo

### Para Tips:

- `getTipsByTag()` - Filtrar por tag
- `searchTips()` - Búsqueda por título, contenido o tags
- `getTipsByCategory()` - Filtrar por categoría
- `getRandomTips()` - Obtener tips aleatorios
- `getTipsByRelevance()` - Filtrar por relevancia
- `getTipsByTimeOfDay()` - Filtrar por momento del día
- `getTipsByGoal()` - Filtrar por objetivo
- `getUniqueTipTags()` - Obtener tags únicos
- `getTipsByKeywords()` - Filtrar por palabras clave

## 📁 Nueva Estructura de Archivos

```
src/
├── data/
│   ├── recipes.ts          # Solo datos de recetas
│   ├── recipeSources.ts    # Fuentes centralizadas
│   ├── snacks.ts           # Solo datos de snacks
│   ├── supplements.ts      # Solo datos de suplementos
│   ├── tips.ts            # Solo datos de tips
│   ├── index.ts           # Índice de datos
│   └── README.md          # Documentación
├── utils/
│   ├── recipeUtils.ts     # Utilidades para recetas
│   ├── snackUtils.ts      # Utilidades para snacks
│   ├── supplementUtils.ts # Utilidades para suplementos
│   ├── tipUtils.ts        # Utilidades para tips
│   └── index.ts           # Índice de utilidades
├── types/
│   └── index.ts           # Tipos actualizados
└── components/
    └── examples/
        ├── RecipeExample.tsx
        ├── SnackExample.tsx
        ├── SupplementExample.tsx
        └── TipExample.tsx
```

## 🔄 Compatibilidad

- ✅ Todos los archivos existentes siguen funcionando
- ✅ Las importaciones de `allMeals`, `allSnacks`, `allSupplements`, `allTips`, `recipeSources` siguen siendo válidas
- ✅ No se requieren cambios en componentes existentes
- ✅ Las nuevas utilidades son opcionales y no rompen funcionalidad existente
- ✅ Tipos corregidos para mantener consistencia

## 📈 Beneficios Obtenidos

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

## 🎯 Próximos Pasos Sugeridos

1. **Tests** - Crear tests unitarios para las nuevas utilidades
2. **Componentes** - Actualizar componentes para usar las nuevas utilidades cuando sea beneficioso
3. **Performance** - Optimizar las funciones de utilidad para grandes volúmenes de datos
4. **Caching** - Implementar caché para búsquedas frecuentes

## 📝 Uso Recomendado

### Importar Datos:

```typescript
import {
  allMeals,
  allSnacks,
  allSupplements,
  allTips,
  recipeSources,
} from "../data";
```

### Importar Utilidades:

```typescript
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
```

### Agregar Nueva Fuente:

```typescript
// En src/data/recipeSources.ts
export const recipeSources = {
  // ... fuentes existentes
  nuevaFuente: {
    id: "nuevaFuente",
    name: "Mi Nuevo Libro",
    authors: "Autor",
    type: "book",
    year: 2024,
  },
};
```

### Agregar Nueva Receta:

```typescript
// En src/data/recipes.ts
{
  nombre: "Nueva Receta",
  tipo: "Desayuno",
  tags: ["Rápida", "Fácil"],
  calorias: 300,
  p: 25, c: 30, f: 15,
  ingredientes: [...],
  source: recipeSources.personal, // opcional
}
```

### Agregar Nuevo Snack:

```typescript
// En src/data/snacks.ts
{
  id: "nuevo-snack",
  nombre: "Nuevo Snack",
  tipo: "simple",
  calorias: 100,
  p: 5, c: 15, f: 3,
  tags: ["Natural", "Fácil"],
  porcion: "1 unidad (50g)",
}
```

### Agregar Nuevo Suplemento:

```typescript
// En src/data/supplements.ts
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

### Agregar Nuevo Tip:

```typescript
// En src/data/tips.ts
{
  id: "nuevo-tip",
  title: "Título del Tip",
  content: `<p>Contenido del tip con <strong>formato HTML</strong>...</p>`,
  tags: ["Nutrición", "Consejos"],
}
```

## 🎉 Refactorización Completa

La refactorización está **100% completa** y el proyecto mantiene toda su funcionalidad existente mientras gana en:

- **Organización** - Estructura clara y consistente
- **Mantenibilidad** - Fácil de mantener y actualizar
- **Escalabilidad** - Fácil agregar nuevos datos y funcionalidades
- **Reutilización** - Utilidades disponibles en todo el proyecto
- **Tipado** - TypeScript garantiza consistencia
- **Documentación** - Guías completas de uso
- **Ejemplos** - Componentes de ejemplo para cada tipo de dato

¡El proyecto ahora tiene una estructura de datos profesional, escalable y bien documentada!
