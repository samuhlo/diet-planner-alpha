import { useMemo } from "preact/hooks";
import GenericSelector from "../common/GenericSelector";
import type { SelectedItem, SelectorConfig } from "../common/GenericSelector";
import type { Recipe } from "../../types";
import { allMeals } from "../../data/recipes";
import { assignIdsToRecipes } from "../../utils/recipeUtils";

// Configuración para el selector de recetas
export const recipeSelectorConfig: SelectorConfig = {
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
  hideQuantitySelector: true, // Ocultar el selector de cantidad para las recetas
};

interface RecipeSelectorGenericProps {
  dayId: string;
  mealType: string;
  selectedItems: SelectedItem[];
  onItemsChange: (items: SelectedItem[]) => void;
  enableMultiple?: boolean;
  onEnableChange?: (enabled: boolean) => void;
  isEnabled?: boolean;
  maxItems?: number; // Número máximo de elementos que se pueden seleccionar
}

export default function RecipeSelectorGeneric({
  dayId,
  mealType,
  selectedItems,
  onItemsChange,
  enableMultiple = false,
  onEnableChange,
  isEnabled = true,
  maxItems = 5, // Valor por defecto
}: RecipeSelectorGenericProps) {
  // Obtener todas las recetas para el tipo de comida y asegurarse de que tengan IDs
  const allRecipes = useMemo(() => {
    // Convertir el tipo de comida al formato esperado por las recetas
    let tipoComida: Recipe["tipo"] = "Desayuno";
    if (mealType === "lunch") tipoComida = "Almuerzo";
    if (mealType === "dinner") tipoComida = "Cena";
    if (mealType === "snack") tipoComida = "Snack";
    if (mealType === "dessert") tipoComida = "Postre";

    // Filtrar las recetas por tipo y asignar IDs
    const filteredRecipes = allMeals.filter(
      (recipe) => recipe.tipo === tipoComida
    );
    return assignIdsToRecipes(filteredRecipes);
  }, [mealType]);

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

  // Crear una copia de la configuración y establecer maxItems
  const finalSelectorConfig = {
    ...recipeSelectorConfig,
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
