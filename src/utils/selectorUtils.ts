import type { SelectedItem } from "../components/common/GenericSelector";
import type {
  Recipe,
  Supplement,
  Snack,
  SnackPlan,
  SupplementPlan,
  DessertPlan,
  DailyPlan,
} from "../types";
import type { SelectorConfig } from "../components/common/GenericSelector";

// Tipos extendidos para usar con ItemSelector
export interface BaseRecipe extends Recipe {
  id: string;
}

// Tipos de selectores disponibles
export type SelectorType = "supplement" | "snack" | "dessert";

// Configuraciones de los selectores
export const SELECTOR_CONFIG: Record<SelectorType, SelectorConfig> = {
  supplement: {
    colorScheme: {
      selectedBgColor: "bg-blue-50",
      selectedTextColor: "text-blue-800",
      selectedBorderColor: "border-blue-200",
      hoverBgColor: "hover:bg-blue-50",
      activeButtonColor: "bg-blue-500",
      activeTextColor: "text-white",
    },
    itemProperties: {
      showCalories: true,
      showProtein: true,
      showCarbs: false,
      showFat: false,
    },
    modalType: null,
    placeholderText: "Buscar suplementos...",
    title: "Suplementos",
    maxItems: 5,
  },
  snack: {
    colorScheme: {
      selectedBgColor: "bg-violet-50",
      selectedTextColor: "text-violet-800",
      selectedBorderColor: "border-violet-200",
      hoverBgColor: "hover:bg-violet-50",
      activeButtonColor: "bg-violet-500",
      activeTextColor: "text-white",
    },
    itemProperties: {
      showCalories: true,
      showProtein: true,
      showCarbs: true,
      showFat: true,
      showTags: true,
    },
    modalType: null,
    placeholderText: "Buscar snacks...",
    title: "Snacks",
    maxItems: 6,
  },
  dessert: {
    colorScheme: {
      selectedBgColor: "bg-fuchsia-50",
      selectedTextColor: "text-fuchsia-800",
      selectedBorderColor: "border-fuchsia-200",
      hoverBgColor: "hover:bg-fuchsia-50",
      activeButtonColor: "bg-fuchsia-500",
      activeTextColor: "text-white",
    },
    itemProperties: {
      showCalories: true,
      showProtein: true,
      showCarbs: true,
      showFat: true,
      showTags: true,
    },
    modalType: null,
    placeholderText: "Buscar postres...",
    title: "Postres",
    maxItems: 2,
  },
};

// Configuración para el selector de recetas (usado directamente por RecipeSelectorGeneric)
export const RECIPE_SELECTOR_CONFIG: SelectorConfig = {
  colorScheme: {
    selectedBgColor: "bg-amber-50",
    selectedTextColor: "text-amber-800",
    selectedBorderColor: "border-amber-200",
    hoverBgColor: "hover:bg-amber-50",
    activeButtonColor: "bg-amber-500",
    activeTextColor: "text-white",
  },
  itemProperties: {
    showCalories: true,
    showProtein: true,
    showCarbs: true,
    showFat: true,
    showTags: true,
  },
  modalType: "recipeDetail",
  placeholderText: "Buscar recetas...",
  title: "Recetas",
  maxItems: 1,
};

// Accesores para cada tipo de elemento
export const ITEM_ACCESSORS = {
  supplement: {
    getId: (supplement: Supplement) => supplement.id,
    getName: (supplement: Supplement) => supplement.name,
    getCalories: (supplement: Supplement) => supplement.calories || 0,
    getProtein: (supplement: Supplement) => supplement.protein || 0,
    getCarbs: (supplement: Supplement) => supplement.carbs || 0,
    getFats: (supplement: Supplement) => supplement.fat || 0,
    getDescription: (supplement: Supplement) => supplement.description || "",
    getTags: (supplement: Supplement) => supplement.tags || [],
  },
  snack: {
    getId: (snack: Snack) => snack.id,
    getName: (snack: Snack) => snack.nombre,
    getCalories: (snack: Snack) => snack.calorias,
    getProtein: (snack: Snack) => snack.p,
    getCarbs: (snack: Snack) => snack.c,
    getFats: (snack: Snack) => snack.f,
    getDescription: (snack: Snack) => snack.porcion || "",
    getTags: (snack: Snack) => snack.tags,
  },
  dessert: {
    getId: (dessert: Recipe) => dessert.id,
    getName: (dessert: Recipe) => dessert.nombre,
    getCalories: (dessert: Recipe) => dessert.calorias,
    getProtein: (dessert: Recipe) => dessert.p,
    getCarbs: (dessert: Recipe) => dessert.c,
    getFats: (dessert: Recipe) => dessert.f,
    getDescription: (dessert: Recipe) => "",
    getTags: (dessert: Recipe) => dessert.tags,
  },
};

// Accesores para recetas (usado directamente por RecipeSelectorGeneric)
export const RECIPE_ACCESSORS = {
  getId: (recipe: Recipe) => recipe.id,
  getName: (recipe: Recipe) => recipe.nombre,
  getCalories: (recipe: Recipe) => recipe.calorias,
  getProtein: (recipe: Recipe) => recipe.p,
  getCarbs: (recipe: Recipe) => recipe.c,
  getFats: (recipe: Recipe) => recipe.f,
  getDescription: (recipe: Recipe) => recipe.description || "",
  getTags: (recipe: Recipe) => recipe.tags,
};

/**
 * Convierte los elementos seleccionados del formato interno al formato del plan
 * según el tipo específico de selector
 */
export function convertSelectedItemsToPlanItems(
  items: SelectedItem[],
  type: SelectorType
) {
  switch (type) {
    case "supplement":
      return items.map((item) => ({
        supplementId: item.id,
        quantity: item.quantity,
      }));
    case "snack":
      return items.map((item) => ({
        snackId: item.id,
        quantity: item.quantity,
      }));
    case "dessert":
      return items.map((item) => ({
        dessertId: item.id,
        quantity: item.quantity,
      }));
    default:
      return [];
  }
}

/**
 * Convierte elementos del plan al formato de items seleccionados
 */
export function convertPlanItemsToSelectedItems(
  planItems: any[] | undefined,
  fieldName: string
): SelectedItem[] {
  if (!planItems) return [];
  return planItems
    .map((item) => ({
      id: item[`${fieldName}Id`],
      quantity: item.quantity,
    }))
    .filter((item) => item.id); // Filtrar elementos vacíos
}

/**
 * Obtiene los items seleccionados para un tipo específico
 */
export function getSelectedItems(
  type: SelectorType,
  dailyPlan: DailyPlan
): SelectedItem[] {
  switch (type) {
    case "supplement":
      if (!dailyPlan.supplement?.enabled) return [];
      return dailyPlan.supplement.supplements.map((s: any) => ({
        id: s.supplementId,
        quantity: s.quantity,
      }));
    case "snack":
      if (!dailyPlan.snacks?.enabled) return [];
      return dailyPlan.snacks.snacks.map((s: any) => ({
        id: s.snackId,
        quantity: s.quantity,
      }));
    case "dessert":
      if (!dailyPlan.desserts?.enabled) return [];
      return dailyPlan.desserts.desserts.map((d: any) => ({
        id: d.dessertId,
        quantity: d.quantity,
      }));
    default:
      return [];
  }
}

/**
 * Obtiene el estado de habilitación para un tipo
 */
export function getSelectorEnabled(
  type: SelectorType,
  dailyPlan: DailyPlan
): boolean {
  switch (type) {
    case "supplement":
      return !!dailyPlan.supplement?.enabled;
    case "snack":
      return !!dailyPlan.snacks?.enabled;
    case "dessert":
      return !!dailyPlan.desserts?.enabled;
    default:
      return false;
  }
}

/**
 * Obtiene los items del plan para un tipo
 */
export function getPlanItems(
  type: SelectorType,
  dailyPlan: DailyPlan
): any[] | undefined {
  switch (type) {
    case "supplement":
      return dailyPlan.supplement?.supplements;
    case "snack":
      return dailyPlan.snacks?.snacks;
    case "dessert":
      return dailyPlan.desserts?.desserts;
    default:
      return undefined;
  }
}

/**
 * Crea un plan de suplementos a partir de los items seleccionados
 */
export function createSupplementPlan(items: SelectedItem[]): SupplementPlan {
  return {
    enabled: true,
    supplements: convertSelectedItemsToPlanItems(items, "supplement") as {
      supplementId: string;
      quantity: number;
    }[],
  };
}

/**
 * Crea un plan de snacks a partir de los items seleccionados
 */
export function createSnackPlan(items: SelectedItem[]): SnackPlan {
  return {
    enabled: true,
    snacks: convertSelectedItemsToPlanItems(items, "snack") as {
      snackId: string;
      quantity: number;
    }[],
  };
}

/**
 * Crea un plan de postres a partir de los items seleccionados
 */
export function createDessertPlan(items: SelectedItem[]): DessertPlan {
  return {
    enabled: true,
    desserts: convertSelectedItemsToPlanItems(items, "dessert") as {
      dessertId: string;
      quantity: number;
    }[],
  };
}

/**
 * Procesa los items del plan para un tipo específico cuando cambia la habilitación
 */
export function processEnabledChange(
  type: SelectorType,
  enabled: boolean,
  currentItems: any[] | undefined
): any[] {
  const items = currentItems || [];
  return enabled ? items : [];
}

/**
 * Genera postres desde las recetas añadiendo un ID basado en el nombre
 */
export function generateDessertsFromRecipes(recipes: Recipe[]): Recipe[] {
  return recipes.filter((recipe) => recipe.tipo === "Postre");
}
