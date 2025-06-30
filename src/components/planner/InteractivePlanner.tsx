import { useMemo, useCallback, useEffect, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  $plan,
  updatePlanEntry,
  updateSnackPlan,
  updateSupplementPlan,
  updateDessertPlan,
} from "../../stores/planStore";
import { $recipes } from "../../stores/recipesStore";
import DailyNutritionSummary from "./DailyNutritionSummary";
import WeeklyNutritionSummary from "./WeeklyNutritionSummary";

import DayHeader from "./DayHeader";
import MealSection from "./MealSection";
import SupplementsSection from "./SupplementsSection";
import SnacksDessertsSection from "./SnacksDessertsSection";
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
import { DAYS_OF_WEEK, MAIN_MEAL_TYPES } from "../../config/appConstants";
import {
  SELECTOR_CONFIG,
  ITEM_ACCESSORS,
  getSelectedItems,
  getSelectorEnabled,
  getPlanItems,
  createSupplementPlan,
} from "../../utils/selectorUtils";
import type { SelectorType } from "../../utils/selectorUtils";

interface InteractivePlannerProps {
  allMeals: Recipe[];
  allSupplements: Supplement[];
  snacks: any[]; // Tipos mixtos - pueden ser Recipe o Snack según contexto
}

/**
 * Componente principal del planificador interactivo de comidas
 *
 * Funcionalidades principales:
 * - Navegación entre días de la semana
 * - Planificación de desayuno, almuerzo y cena
 * - Gestión de snacks, postres y suplementos
 * - Cálculo automático de valores nutricionales
 * - Interfaz responsive con vista móvil y desktop
 * - Generación de lista de compra y resumen
 *
 * Estados manejados:
 * - Plan semanal (recetas por día y comida)
 * - Vista actual (desktop/móvil)
 * - Día seleccionado
 * - Filtros de búsqueda
 * - Estados de selectores
 */
export default function InteractivePlanner({
  allMeals,
  allSupplements,
  snacks,
}: InteractivePlannerProps) {
  const plan = useStore($plan);
  const recipesState = useStore($recipes);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Organizar recetas por tipo
  const mealsByType = useMemo(() => {
    return {
      Desayuno: allMeals.filter((meal: Recipe) => meal.tipo === "Desayuno"),
      Almuerzo: allMeals.filter((meal: Recipe) => meal.tipo === "Almuerzo"),
      Cena: allMeals.filter((meal: Recipe) => meal.tipo === "Cena"),
    };
  }, [allMeals]);

  // Handlers para actualizar el plan - memoizados para evitar recreaciones
  const planHandlers = useMemo(() => {
    const handlePlanChange = (
      dayId: string,
      section: keyof DailyPlan,
      field: string,
      value: string | number
    ) => {
      updatePlanEntry(dayId, section, field, value);
    };

    const handleSnackPlanChange = (dayId: string, snackPlan: SnackPlan) => {
      updateSnackPlan(dayId, snackPlan);
    };

    const handleSupplementPlanChange = (
      dayId: string,
      supplementPlan: SupplementPlan
    ) => {
      updateSupplementPlan(dayId, supplementPlan);
    };

    const handleDessertPlanChange = (
      dayId: string,
      dessertPlan: DessertPlan
    ) => {
      updateDessertPlan(dayId, dessertPlan);
    };

    return {
      handlePlanChange,
      handleSnackPlanChange,
      handleSupplementPlanChange,
      handleDessertPlanChange,
    };
  }, []);

  const {
    handlePlanChange,
    handleSnackPlanChange,
    handleSupplementPlanChange,
    handleDessertPlanChange,
  } = planHandlers;

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
          const snackItems = items.map((item) => ({
            snackId: item.id,
            quantity: item.quantity,
          }));

          handleSnackPlanChange(dayId, {
            enabled: true,
            snacks: snackItems,
          });
          break;
        }
        case "dessert": {
          // Convertir los IDs de las recetas a IDs de postres
          // Aquí es importante asegurarse de que estamos guardando el ID exacto
          const dessertItems = items.map((item) => ({
            dessertId: item.id,
            quantity: item.quantity,
          }));

          handleDessertPlanChange(dayId, {
            enabled: true,
            desserts: dessertItems,
          });
          break;
        }
      }
    },
    [handleSupplementPlanChange, handleSnackPlanChange, handleDessertPlanChange]
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
          handleSupplementPlanChange(dayId, {
            enabled,
            supplements: enabled
              ? (items as { supplementId: string; quantity: number }[])
              : [],
          });
          break;
        case "snack":
          handleSnackPlanChange(dayId, {
            enabled,
            snacks: enabled
              ? (items as { snackId: string; quantity: number }[])
              : [],
          });
          break;
        case "dessert":
          handleDessertPlanChange(dayId, {
            enabled,
            desserts: enabled
              ? (items as { dessertId: string; quantity: number }[])
              : [],
          });
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

  // Código para manejar la selección de recetas
  const handleRecipeSelection = useCallback(
    (dayId: string, mealType: keyof DailyPlan, items: SelectedItem[]) => {
      if (items.length === 0) {
        handlePlanChange(dayId, mealType, "recipeName", "");
        return;
      }

      // Obtener la receta seleccionada
      const selectedRecipeId = items[0].id;
      const selectedRecipe = allMeals.find(
        (meal) => meal.id === selectedRecipeId
      );

      if (selectedRecipe) {
        handlePlanChange(dayId, mealType, "recipeName", selectedRecipe.nombre);

        // Asegurarse de que haya al menos 1 comensal
        const dailyPlan = plan[dayId] || {};
        const mealPlan = dailyPlan[mealType] as MealPlan | undefined;
        if (!mealPlan?.diners) {
          handlePlanChange(dayId, mealType, "diners", 1);
        }
      }
    },
    [allMeals, handlePlanChange, plan]
  );

  // Convertir recetas a formato compatible con RecipeSelector
  const mapRecipesToItems = useCallback(
    (mealType: string, mealPlan: MealPlan | undefined): SelectedItem[] => {
      if (!mealPlan?.recipeName) return [];

      const recipeName = mealPlan.recipeName;
      const recipes = mealsByType[mealType as keyof typeof mealsByType] || [];

      // Buscar la receta por nombre (con fallbacks)
      let recipe =
        recipes.find((r) => r.nombre === recipeName) ||
        recipes.find(
          (r) => r.nombre.toLowerCase() === recipeName.toLowerCase()
        ) ||
        recipes.find((r) =>
          r.nombre.toLowerCase().includes(recipeName.toLowerCase())
        );

      if (!recipe) {
        console.warn(
          `Receta no encontrada: ${recipeName} para tipo ${mealType}`
        );
        return [];
      }

      return [{ id: recipe.id, quantity: 1 }];
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

          return dailyPlan.snacks.snacks
            .map((snackItem) => {
              return { id: snackItem.snackId, quantity: snackItem.quantity };
            })
            .filter((item) => item.id) as SelectedItem[];

        case "dessert":
          if (
            !dailyPlan.desserts?.enabled ||
            !dailyPlan.desserts.desserts.length
          ) {
            return [];
          }

          return dailyPlan.desserts.desserts
            .map((dessertItem) => {
              return {
                id: dessertItem.dessertId,
                quantity: dessertItem.quantity,
              };
            })
            .filter((item) => item.id) as SelectedItem[];

        default:
          return [];
      }
    },
    []
  );

  // Renderizado de días - memoizado para evitar recálculos innecesarios
  const renderedDays = useMemo(() => {
    return DAYS_OF_WEEK.map((day) => {
      const dayId = day.toLowerCase();
      const dailyPlan = plan[dayId] || {};
      const isExpanded = expandedDays.has(dayId);

      // Extraer el renderizado del contenido del día a un componente separado
      // para evitar re-renderizados innecesarios
      return (
        <div key={dayId} class="bg-white rounded-lg shadow-md overflow-hidden">
          <DayHeader
            day={day}
            dayId={dayId}
            dailyPlan={dailyPlan}
            isExpanded={isExpanded}
            toggleExpansion={toggleDayExpansion}
          />

          {isExpanded && (
            <div class="p-6">
              {/* Comidas principales */}
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {MAIN_MEAL_TYPES.map((mealType) => {
                  const mealTypeKey = mealType as keyof DailyPlan;
                  const mealPlan = dailyPlan[mealTypeKey] as
                    | MealPlan
                    | undefined;
                  const mealTypeMapping: Record<string, string> = {
                    Desayuno: "breakfast",
                    Almuerzo: "lunch",
                    Cena: "dinner",
                  };
                  const mappedMealType =
                    mealTypeMapping[mealType] || "breakfast";
                  const selectedItems = mapRecipesToItems(mealType, mealPlan);

                  return (
                    <MealSection
                      key={mealType}
                      dayId={dayId}
                      mealType={mealType}
                      mealTypeKey={mealTypeKey}
                      mappedMealType={mappedMealType}
                      mealPlan={mealPlan}
                      selectedItems={selectedItems}
                      handlePlanChange={handlePlanChange}
                      handleRecipeSelection={handleRecipeSelection}
                    />
                  );
                })}
              </div>

              {/* Suplementos, Snacks y Postres */}
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SnacksDessertsSection
                  dayId={dayId}
                  dailyPlan={dailyPlan}
                  getSelectedItemsForSelector={getSelectedItemsForSelector}
                  handleSelectorItemsChange={handleSelectorItemsChange}
                  handleSelectorEnableChange={handleSelectorEnableChange}
                  getSelectorEnabled={getSelectorEnabled}
                  getPlanItems={getPlanItems}
                />

                <SupplementsSection
                  dayId={dayId}
                  dailyPlan={dailyPlan}
                  allSupplements={allSupplements}
                  getSelectedItemsForSelector={getSelectedItemsForSelector}
                  handleSelectorItemsChange={handleSelectorItemsChange}
                  handleSelectorEnableChange={handleSelectorEnableChange}
                  getSelectorEnabled={getSelectorEnabled}
                  getPlanItems={getPlanItems}
                  ITEM_ACCESSORS={ITEM_ACCESSORS}
                  SELECTOR_CONFIG={SELECTOR_CONFIG}
                />
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
    expandedDays,
    toggleDayExpansion,
    mapRecipesToItems,
    handlePlanChange,
    handleRecipeSelection,
    getSelectedItemsForSelector,
    handleSelectorItemsChange,
    handleSelectorEnableChange,
    allSupplements,
  ]);

  return (
    <div id="weekly-planner-container">
      <div class="space-y-4">{renderedDays}</div>
      {/* Resumen Semanal */}
      <div class="mt-8">
        <WeeklyNutritionSummary allSnacks={snacks} />
      </div>
    </div>
  );
}
