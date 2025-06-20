import type { VNode } from "preact";
import type { Ingredient } from "../../types";
import { formatIngredient } from "../../utils/ingredientFormatter";
import { getExtractedIngredientByName } from "../../data/ingredients";
import { formatEuro } from "../../utils/ingredientFormatter";
import { useEffect, useState } from "preact/hooks";

interface ShoppingListContentProps {
  data: Ingredient[];
}

interface ShoppingListPersisted {
  list: Ingredient[];
  originalNames: string[];
}

const SHOPPING_LIST_KEY = "customShoppingList";

export default function ShoppingListContent({
  data: ingredients,
}: ShoppingListContentProps): VNode {
  // Estado local de la lista editable
  const [customList, setCustomList] = useState<Ingredient[] | null>(null);
  const [originalNames, setOriginalNames] = useState<string[] | null>(null);

  // Cargar lista personalizada y versión original de localStorage al montar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(SHOPPING_LIST_KEY);
    if (stored) {
      try {
        const parsed: ShoppingListPersisted = JSON.parse(stored);
        setCustomList(parsed.list);
        setOriginalNames(parsed.originalNames);
      } catch {
        setCustomList(null);
        setOriginalNames(null);
      }
    }
  }, []);

  // Guardar lista personalizada y versión original en localStorage cuando cambie
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (customList && originalNames) {
      const toStore: ShoppingListPersisted = {
        list: customList,
        originalNames,
      };
      localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(toStore));
    }
  }, [customList, originalNames]);

  // Si no hay ingredientes ni lista personalizada
  if ((!ingredients || ingredients.length === 0) && !customList) {
    return (
      <p class="text-center italic text-stone-500">
        No has seleccionado ninguna receta o snack elaborado todavía.
      </p>
    );
  }

  // Usar la lista personalizada si existe, si no la original
  const list = customList || ingredients;

  // Eliminar ingrediente
  const handleRemove = (idx: number) => {
    setCustomList(list.filter((_, i) => i !== idx));
    if (!originalNames) {
      // Guardar la versión de la lista original en el momento de la personalización
      setOriginalNames(ingredients.map((ing) => ing.n));
    }
  };

  // Regenerar lista original
  const handleRegenerate = () => {
    setCustomList(null);
    setOriginalNames(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SHOPPING_LIST_KEY);
    }
  };

  const totalPrice = list.reduce((acc, ing) => {
    const extracted = getExtractedIngredientByName(ing.n);
    const packPrice = extracted?.infoCompra?.precioTotal;
    return acc + (packPrice || 0);
  }, 0);

  // Detectar si la lista fue modificada
  const isModified = customList !== null;

  // Detectar si hay ingredientes nuevos en la lista original actual respecto a la versión guardada
  let hasNewIngredients = false;
  if (isModified && originalNames) {
    const currentOriginalNames = ingredients.map((ing) => ing.n);
    hasNewIngredients = currentOriginalNames.some(
      (name) => !originalNames.includes(name)
    );
  }

  return (
    <div class="max-h-[750px] overflow-y-auto">
      <p class="text-sm text-gray-600 mb-3">
        Lista de ingredientes para comidas principales y snacks elaborados:
      </p>
      <ul class="list-disc list-inside space-y-2">
        {list.map((ing, index) => {
          const formatted = formatIngredient(ing);
          const extracted = getExtractedIngredientByName(ing.n);
          const packPrice = extracted?.infoCompra?.precioTotal;
          const packFormat = extracted?.infoCompra?.formato;
          // Ocultar ingredientes sin precio o con precio 0
          if (!packPrice || packPrice === 0) return null;
          return (
            <li
              key={`${ing.n}-${index}`}
              class="text-stone-700 flex items-center gap-2 group"
            >
              {formatted.displayText}
              <span class="ml-2 text-green-700 text-xs font-semibold">
                (Pack: {formatEuro(packPrice)}
                {packFormat ? `, ${packFormat}` : ""})
              </span>
              <button
                class="ml-2 text-red-500 hover:text-red-700 text-m font-bold px-2 py-1 rounded transition-opacity opacity-80 group-hover:opacity-100"
                title="Eliminar ingrediente"
                onClick={() => handleRemove(index)}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
      <p class="text-lg text-gray-600 mt-3 mb-3 flex items-center gap-2 font-semibold">
        Total de la compra aprox. →{" "}
        <span class="text-green-700 font-semibold">
          {formatEuro(totalPrice)}
        </span>
      </p>
      {isModified && (
        <button
          class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 font-semibold text-sm transition flex items-center gap-2"
          onClick={handleRegenerate}
        >
          Regenerar lista original
          {hasNewIngredients && (
            <span class="ml-2 bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              ¡Nuevos ingredientes!
            </span>
          )}
        </button>
      )}
    </div>
  );
}
