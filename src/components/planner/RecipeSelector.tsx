import { useMemo } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { $recipes } from "../../stores/recipesStore";
import GenericSelector from "../common/GenericSelector";
import { openRecipeDetailModal } from "../../stores/modalStore";
import type { SelectedItem, SelectorConfig } from "../common/GenericSelector";
import type { Recipe } from "../../types";

// Configuración para los diferentes tipos de selectores
const selectorConfigs: Record<string, SelectorConfig> = {
  breakfast: {
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
    placeholderText: "Buscar desayunos...",
    title: "Desayunos",
    hideQuantitySelector: true,
  },
  lunch: {
    colorScheme: {
      selectedBgColor: "bg-orange-50",
      selectedTextColor: "text-orange-800",
      selectedBorderColor: "border-orange-200",
      hoverBgColor: "hover:bg-orange-50",
      activeButtonColor: "bg-orange-500",
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
    placeholderText: "Buscar almuerzos...",
    title: "Almuerzos",
    hideQuantitySelector: true,
  },
  dinner: {
    colorScheme: {
      selectedBgColor: "bg-red-50",
      selectedTextColor: "text-red-800",
      selectedBorderColor: "border-red-200",
      hoverBgColor: "hover:bg-red-50",
      activeButtonColor: "bg-red-500",
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
    placeholderText: "Buscar cenas...",
    title: "Cenas",
    hideQuantitySelector: true,
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
    modalType: "recipeDetail",
    placeholderText: "Buscar snacks...",
    title: "Snacks",
    hideQuantitySelector: false,
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
    modalType: "recipeDetail",
    placeholderText: "Buscar postres...",
    title: "Postres",
    hideQuantitySelector: false,
  },
};

// Configuración por defecto
const defaultConfig: SelectorConfig = {
  colorScheme: {
    selectedBgColor: "bg-green-100",
    selectedTextColor: "text-green-800",
    selectedBorderColor: "border-green-200",
    hoverBgColor: "hover:bg-green-50",
    activeButtonColor: "bg-green-500",
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
  hideQuantitySelector: true,
};

interface RecipeSelectorProps {
  dayId: string;
  mealType: string;
  selectedItems: SelectedItem[];
  onItemsChange: (items: SelectedItem[]) => void;
  enableMultiple?: boolean;
  onEnableChange?: (enabled: boolean) => void;
  isEnabled?: boolean;
  maxItems?: number; // Número máximo de elementos que se pueden seleccionar
}

export default function RecipeSelector({
  dayId,
  mealType,
  selectedItems,
  onItemsChange,
  enableMultiple = false,
  onEnableChange,
  isEnabled = true,
  maxItems = 5, // Valor por defecto
}: RecipeSelectorProps) {
  // Obtener el store de recetas
  const recipesState = useStore($recipes);

  // Obtener todas las recetas para el tipo de comida
  const allRecipes = useMemo(() => {
    // Si el store no está inicializado, devolver un array vacío
    if (!recipesState.isInitialized) {
      return [];
    }

    // Mapeamos los tipos de comidas en inglés a español
    const mealTypeMapping: Record<string, Recipe["tipo"]> = {
      breakfast: "Desayuno",
      lunch: "Almuerzo",
      dinner: "Cena",
      snack: "Snack",
      dessert: "Postre",
    };

    // Determinar el tipo de comida
    const tipoComida =
      mealTypeMapping[mealType] || (mealType as Recipe["tipo"]);

    // Filtrar las recetas por tipo
    const filteredRecipes = recipesState.allRecipes.filter(
      (meal) => meal.tipo === tipoComida
    );

    // Si es tipo postre, usar los postres del store
    if (tipoComida === "Postre" && mealType === "dessert") {
      return recipesState.desserts;
    }

    // Si es tipo snack, usar los snacks del store
    if (tipoComida === "Snack" && mealType === "snack") {
      return recipesState.snacks as unknown as Recipe[];
    }

    return filteredRecipes;
  }, [mealType, recipesState]);

  // Configuración para el mapeo de recetas a items
  const recipeConfig = {
    getId: (recipe: Recipe) => recipe.id,
    getName: (recipe: Recipe) => recipe.nombre,
    getCalories: (recipe: Recipe) => recipe.calorias,
    getProtein: (recipe: Recipe) => recipe.p,
    getCarbs: (recipe: Recipe) => recipe.c,
    getFats: (recipe: Recipe) => recipe.f,
    getTags: (recipe: Recipe) => recipe.tags || [],
    getDescription: (recipe: Recipe) => recipe.description || "",
  };

  // Obtener la configuración específica para este tipo de comida
  const baseConfig = selectorConfigs[mealType] || defaultConfig;

  // Crear una copia de la configuración y establecer maxItems
  const finalSelectorConfig = {
    ...baseConfig,
    maxItems: maxItems,
  };

  return (
    <GenericSelector
      dayId={dayId}
      allItems={allRecipes}
      selectedItems={selectedItems}
      onItemsChange={onItemsChange}
      itemConfig={recipeConfig}
      selectorConfig={finalSelectorConfig}
      enableMultiple={enableMultiple}
      onEnableChange={onEnableChange}
      isEnabled={isEnabled}
    />
  );
}
