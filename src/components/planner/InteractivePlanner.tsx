import { useMemo, useCallback, useEffect, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  $plan,
  updatePlanEntry,
  updateSnackPlan,
  updateSupplementPlan,
  updateDessertPlan,
} from "../../stores/planStore";
import RecipeSelectorGeneric from "./RecipeSelectorGeneric";
import DailyNutritionSummary from "./DailyNutritionSummary";
import WeeklyNutritionSummary from "./WeeklyNutritionSummary";
import GenericSelector from "../common/GenericSelector";
import type {
  Recipe,
  Supplement,
  DailyPlan,
  SnackPlan,
  SupplementPlan,
  DessertPlan,
  SelectedItem,
  MealPlan,
} from "../../types";
import {
  getSnacksFromRecipes,
  assignIdsToRecipes,
} from "../../utils/recipeUtils";
import { DAYS_OF_WEEK, MAIN_MEAL_TYPES } from "../../config/appConstants";
import {
  SELECTOR_CONFIG,
  ITEM_ACCESSORS,
  getSelectedItems,
  getSelectorEnabled,
  getPlanItems,
  createSupplementPlan,
  createSnackPlan,
  createDessertPlan,
  generateDessertsFromRecipes,
} from "../../utils/selectorUtils";
import type { SelectorType } from "../../utils/selectorUtils";

interface InteractivePlannerProps {
  allMeals: Recipe[];
  allSupplements: Supplement[];
  targetCalories: number;
  targetProtein: number;
}

export default function InteractivePlanner({
  allMeals: rawMeals,
  allSupplements,
}: InteractivePlannerProps) {
  const plan = useStore($plan);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Asegurarse de que todas las recetas tienen ID
  const allMeals = useMemo(() => assignIdsToRecipes(rawMeals), [rawMeals]);

  const mealsByType = useMemo(
    () => ({
      Desayuno: allMeals.filter((m) => m.tipo === "Desayuno"),
      Almuerzo: allMeals.filter((m) => m.tipo === "Almuerzo"),
      Cena: allMeals.filter((m) => m.tipo === "Cena"),
    }),
    [allMeals]
  );

  // Generar snacks desde las recetas
  const allSnacks = useMemo(() => getSnacksFromRecipes(allMeals), [allMeals]);

  // Obtener postres desde las recetas
  const allDesserts = useMemo(
    () => generateDessertsFromRecipes(allMeals),
    [allMeals]
  );

  const handlePlanChange = useCallback(
    (
      dayId: string,
      section: keyof DailyPlan,
      field: string,
      value: string | number
    ) => {
      updatePlanEntry(dayId, section, field, value);
    },
    []
  );

  const handleSnackPlanChange = useCallback(
    (dayId: string, snackPlan: SnackPlan) => {
      updateSnackPlan(dayId, snackPlan);
    },
    []
  );

  const handleSupplementPlanChange = useCallback(
    (dayId: string, supplementPlan: SupplementPlan) => {
      updateSupplementPlan(dayId, supplementPlan);
    },
    []
  );

  const handleDessertPlanChange = useCallback(
    (dayId: string, dessertPlan: DessertPlan) => {
      updateDessertPlan(dayId, dessertPlan);
    },
    []
  );

  /**
   * Maneja los cambios en cualquiera de los selectores genéricos
   */
  const handleSelectorItemsChange = useCallback(
    (type: SelectorType, dayId: string, items: SelectedItem[]) => {
      switch (type) {
        case "supplement":
          handleSupplementPlanChange(dayId, createSupplementPlan(items));
          break;
        case "snack": {
          // Convertir los IDs de las recetas a IDs de snacks
          const snackItems = items
            .map((item) => {
              // Buscar la receta correspondiente
              const snack = allSnacks.find((s) => s.id === item.id);
              if (snack) {
                return {
                  snackId: snack.id,
                  quantity: item.quantity,
                };
              }
              return null;
            })
            .filter(Boolean);

          handleSnackPlanChange(dayId, {
            enabled: true,
            snacks: snackItems as { snackId: string; quantity: number }[],
          });
          break;
        }
        case "dessert": {
          // Convertir los IDs de las recetas a IDs de postres
          const dessertItems = items
            .map((item) => {
              // Buscar la receta correspondiente
              const dessert = allDesserts.find((d) => d.id === item.id);
              if (dessert) {
                return {
                  dessertId: dessert.id,
                  quantity: item.quantity,
                };
              }
              return null;
            })
            .filter(Boolean);

          handleDessertPlanChange(dayId, {
            enabled: true,
            desserts: dessertItems as { dessertId: string; quantity: number }[],
          });
          break;
        }
      }
    },
    [
      handleSupplementPlanChange,
      handleSnackPlanChange,
      handleDessertPlanChange,
      allSnacks,
      allDesserts,
    ]
  );

  /**
   * Maneja los cambios de habilitación en los selectores
   */
  const handleSelectorEnableChange = useCallback(
    (
      type: SelectorType,
      dayId: string,
      enabled: boolean,
      currentItems: any[] | undefined
    ) => {
      const items = currentItems || [];

      switch (type) {
        case "supplement":
          const supplementPlan: SupplementPlan = {
            enabled,
            supplements: enabled
              ? (items as { supplementId: string; quantity: number }[])
              : [],
          };
          handleSupplementPlanChange(dayId, supplementPlan);
          break;
        case "snack":
          const snackPlan: SnackPlan = {
            enabled,
            snacks: enabled
              ? (items as { snackId: string; quantity: number }[])
              : [],
          };
          handleSnackPlanChange(dayId, snackPlan);
          break;
        case "dessert":
          const dessertPlan: DessertPlan = {
            enabled,
            desserts: enabled
              ? (items as { dessertId: string; quantity: number }[])
              : [],
          };
          handleDessertPlanChange(dayId, dessertPlan);
          break;
      }
    },
    [handleSupplementPlanChange, handleSnackPlanChange, handleDessertPlanChange]
  );

  const toggleDayExpansion = useCallback((dayId: string) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dayId)) {
        newSet.delete(dayId);
      } else {
        newSet.add(dayId);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    return () => {
      console.log("InteractivePlanner cleanup");
    };
  }, []);

  const getSelectedItemsSummary = (dailyPlan: DailyPlan) => {
    const items = [];

    // Comidas principales
    MAIN_MEAL_TYPES.forEach((mealType) => {
      const mealPlan = dailyPlan[mealType as keyof DailyPlan] as
        | MealPlan
        | undefined;
      if (mealPlan?.recipeName) {
        const dinersText =
          mealPlan.diners && mealPlan.diners > 1
            ? ` (${mealPlan.diners} comensales)`
            : "";
        items.push(`${mealType}${dinersText}: ${mealPlan.recipeName}`);
      }
    });

    // Suplementos
    if (
      dailyPlan.supplement?.enabled &&
      dailyPlan.supplement.supplements.length > 0
    ) {
      const supplementCount = dailyPlan.supplement.supplements.filter(
        (s) => s.supplementId
      ).length;
      if (supplementCount > 0) {
        items.push(
          `${supplementCount} suplemento${supplementCount > 1 ? "s" : ""}`
        );
      }
    }

    // Snacks
    if (dailyPlan.snacks?.enabled && dailyPlan.snacks.snacks.length > 0) {
      const snackCount = dailyPlan.snacks.snacks.filter(
        (s) => s.snackId
      ).length;
      if (snackCount > 0) {
        items.push(`${snackCount} snack${snackCount > 1 ? "s" : ""}`);
      }
    }

    // Postres
    if (dailyPlan.desserts?.enabled && dailyPlan.desserts.desserts.length > 0) {
      const dessertCount = dailyPlan.desserts.desserts.filter(
        (d) => d.dessertId
      ).length;
      if (dessertCount > 0) {
        items.push(`${dessertCount} postre${dessertCount > 1 ? "s" : ""}`);
      }
    }

    return items.length > 0 ? items.join(", ") : "Sin selecciones";
  };

  // Código para manejar la selección de recetas
  const handleRecipeSelection = useCallback(
    (dayId: string, mealType: keyof DailyPlan, items: SelectedItem[]) => {
      if (items.length === 0) {
        handlePlanChange(dayId, mealType, "recipeName", "");
      } else {
        // Obtener la receta seleccionada de allMeals
        const selectedRecipeId = items[0].id;
        const selectedRecipe = allMeals.find(
          (meal) => meal.id === selectedRecipeId
        );

        if (selectedRecipe) {
          handlePlanChange(
            dayId,
            mealType,
            "recipeName",
            selectedRecipe.nombre
          );

          // Asegurarse de que haya al menos 1 comensal
          const dailyPlan = plan[dayId] || {};
          const mealPlan = dailyPlan[mealType] as MealPlan | undefined;
          if (!mealPlan?.diners) {
            handlePlanChange(dayId, mealType, "diners", 1);
          }
        }
      }
    },
    [allMeals, handlePlanChange, plan]
  );

  // Convertir recetas a formato compatible con RecipeSelectorGeneric
  const mapRecipesToItems = useCallback(
    (mealType: string, mealPlan: MealPlan | undefined): SelectedItem[] => {
      if (!mealPlan?.recipeName) return [];

      const recipeName = mealPlan.recipeName;
      const recipes =
        mealType === "Desayuno"
          ? mealsByType.Desayuno
          : mealType === "Almuerzo"
          ? mealsByType.Almuerzo
          : mealsByType.Cena;

      // Buscar primero por nombre exacto
      let recipe = recipes.find((r) => r.nombre === recipeName);

      // Si no se encuentra, buscar ignorando mayúsculas/minúsculas
      if (!recipe) {
        recipe = recipes.find(
          (r) => r.nombre.toLowerCase() === recipeName.toLowerCase()
        );
      }

      // Si aún no se encuentra, buscar con coincidencia parcial
      if (!recipe) {
        recipe = recipes.find((r) =>
          r.nombre.toLowerCase().includes(recipeName.toLowerCase())
        );
      }

      if (!recipe) {
        console.warn(
          `Receta no encontrada: ${recipeName} para tipo ${mealType}`
        );
        return [];
      }

      return [
        {
          id: recipe.id,
          quantity: 1,
        },
      ];
    },
    [mealsByType]
  );

  // Obtener los elementos seleccionados para un selector específico
  const getSelectedItemsForSelector = useCallback(
    (type: SelectorType, dailyPlan: DailyPlan): SelectedItem[] => {
      switch (type) {
        case "supplement":
          return getSelectedItems("supplement", dailyPlan);
        case "snack":
          if (!dailyPlan.snacks?.enabled || !dailyPlan.snacks.snacks.length) {
            return [];
          }

          // Convertir los IDs de snacks a IDs de recetas
          return dailyPlan.snacks.snacks
            .map((snackItem) => {
              const snack = allSnacks.find((s) => s.id === snackItem.snackId);
              if (snack) {
                return {
                  id: snack.id,
                  quantity: snackItem.quantity,
                };
              }
              return null;
            })
            .filter(Boolean) as SelectedItem[];

        case "dessert":
          if (
            !dailyPlan.desserts?.enabled ||
            !dailyPlan.desserts.desserts.length
          ) {
            return [];
          }

          // Convertir los IDs de postres a IDs de recetas
          return dailyPlan.desserts.desserts
            .map((dessertItem) => {
              const dessert = allDesserts.find(
                (d) => d.id === dessertItem.dessertId
              );
              if (dessert) {
                return {
                  id: dessert.id,
                  quantity: dessertItem.quantity,
                };
              }
              return null;
            })
            .filter(Boolean) as SelectedItem[];

        default:
          return [];
      }
    },
    [allSnacks, allDesserts]
  );

  const renderedDays = useMemo(() => {
    return DAYS_OF_WEEK.map((day) => {
      const dayId = day.toLowerCase();
      const dailyPlan = plan[dayId] || {};
      const isExpanded = expandedDays.has(dayId);
      const selectedItemsSummary = getSelectedItemsSummary(dailyPlan);

      return (
        <div key={dayId} class="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header del accordion */}
          <button
            onClick={() => toggleDayExpansion(dayId)}
            class="w-full p-4 flex items-center justify-between bg-white text-[#6B8A7A] hover:bg-[#6B8A7A] hover:text-white transition-all duration-200 cursor-pointer"
          >
            <div class="flex items-center space-x-3">
              <h3 class="text-xl font-bold uppercase">{day}</h3>
              <div class="text-sm opacity-90">{selectedItemsSummary}</div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm sm:block hidden ml-2">
                {isExpanded ? "Contraer" : "Expandir"}
              </span>
              <svg
                class={`w-5 h-5 transform transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {/* Contenido expandible */}
          {isExpanded && (
            <div class="p-6 ">
              {/* Comidas principales */}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {MAIN_MEAL_TYPES.map((mealType) => {
                  const mealTypeKey = mealType as keyof DailyPlan;
                  const mealPlan = dailyPlan[mealTypeKey] as
                    | MealPlan
                    | undefined;
                  const servingsCount = mealPlan?.diners || 1;
                  const mealTypeMapping: Record<string, string> = {
                    Desayuno: "breakfast",
                    Almuerzo: "lunch",
                    Cena: "dinner",
                  };
                  const mappedMealType =
                    mealTypeMapping[mealType] || "breakfast";
                  const selectedItems = mapRecipesToItems(mealType, mealPlan);
                  const hasSelectedRecipe = selectedItems.length > 0;

                  return (
                    <div key={mealType} class="meal-slot lg:col-span-1">
                      <div class="flex justify-between items-center mb-2">
                        <span class="block text-lg font-bold text-stone-700 capitalize">
                          {mealType}
                        </span>

                        {/* Selector de comensales por comida */}
                        {hasSelectedRecipe && (
                          <div class="flex items-center">
                            <span class="text-sm text-gray-600 mr-2">
                              Comensales:
                            </span>
                            <div class="flex items-center">
                              <button
                                onClick={() => {
                                  handlePlanChange(
                                    dayId,
                                    mealTypeKey,
                                    "diners",
                                    Math.max(1, servingsCount - 1)
                                  );
                                }}
                                class="w-5 h-5 flex items-center justify-center text-xs bg-gray-200 rounded-l-md hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span class="px-2 py-0.5 bg-gray-100 text-center text-xs">
                                {servingsCount}
                              </span>
                              <button
                                onClick={() => {
                                  handlePlanChange(
                                    dayId,
                                    mealTypeKey,
                                    "diners",
                                    Math.min(10, servingsCount + 1)
                                  );
                                }}
                                class="w-5 h-5 flex items-center justify-center text-xs bg-gray-200 rounded-r-md hover:bg-gray-300"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Selector de Recetas */}
                      <RecipeSelectorGeneric
                        dayId={dayId}
                        mealType={mappedMealType}
                        selectedItems={selectedItems}
                        onItemsChange={(items) => {
                          handleRecipeSelection(dayId, mealTypeKey, items);
                        }}
                        enableMultiple={false}
                        maxItems={1}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Suplementos, Snacks y Postres */}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Suplementos */}
                <GenericSelector
                  dayId={dayId}
                  allItems={allSupplements}
                  selectedItems={getSelectedItemsForSelector(
                    "supplement",
                    dailyPlan
                  )}
                  onItemsChange={(items) =>
                    handleSelectorItemsChange("supplement", dayId, items)
                  }
                  itemConfig={ITEM_ACCESSORS.supplement}
                  selectorConfig={SELECTOR_CONFIG.supplement}
                  enableMultiple={true}
                  isEnabled={getSelectorEnabled("supplement", dailyPlan)}
                  onEnableChange={(enabled) =>
                    handleSelectorEnableChange(
                      "supplement",
                      dayId,
                      enabled,
                      getPlanItems("supplement", dailyPlan)
                    )
                  }
                />

                {/* Snacks */}
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="block text-lg font-bold text-stone-700">
                      Snacks
                    </span>
                  </div>
                  <RecipeSelectorGeneric
                    dayId={dayId}
                    mealType="snack"
                    selectedItems={getSelectedItemsForSelector(
                      "snack",
                      dailyPlan
                    )}
                    onItemsChange={(items) =>
                      handleSelectorItemsChange("snack", dayId, items)
                    }
                    enableMultiple={true}
                    isEnabled={getSelectorEnabled("snack", dailyPlan)}
                    onEnableChange={(enabled) =>
                      handleSelectorEnableChange(
                        "snack",
                        dayId,
                        enabled,
                        getPlanItems("snack", dailyPlan)
                      )
                    }
                    maxItems={3}
                  />
                </div>

                {/* Postres */}
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="block text-lg font-bold text-stone-700">
                      Postres
                    </span>
                  </div>
                  <RecipeSelectorGeneric
                    dayId={dayId}
                    mealType="dessert"
                    selectedItems={getSelectedItemsForSelector(
                      "dessert",
                      dailyPlan
                    )}
                    onItemsChange={(items) =>
                      handleSelectorItemsChange("dessert", dayId, items)
                    }
                    enableMultiple={true}
                    isEnabled={getSelectorEnabled("dessert", dailyPlan)}
                    onEnableChange={(enabled) =>
                      handleSelectorEnableChange(
                        "dessert",
                        dayId,
                        enabled,
                        getPlanItems("dessert", dailyPlan)
                      )
                    }
                    maxItems={2}
                  />
                </div>
              </div>

              {/* Resumen Nutricional Integrado */}
              <div class="mt-6">
                <DailyNutritionSummary dayId={dayId} dayName={day} />
              </div>
            </div>
          )}
        </div>
      );
    });
  }, [
    plan,
    mealsByType,
    expandedDays,
    handlePlanChange,
    handleSnackPlanChange,
    handleSupplementPlanChange,
    handleDessertPlanChange,
    toggleDayExpansion,
    allMeals,
    allSnacks,
    allDesserts,
    allSupplements,
    handleSelectorItemsChange,
    handleSelectorEnableChange,
    mapRecipesToItems,
    handleRecipeSelection,
    getSelectedItemsForSelector,
  ]);

  return (
    <div id="weekly-planner-container">
      <div class="space-y-4">{renderedDays}</div>
      {/* Resumen Semanal */}
      <div class="mt-8">
        <WeeklyNutritionSummary allSnacks={allSnacks} />
      </div>
    </div>
  );
}
