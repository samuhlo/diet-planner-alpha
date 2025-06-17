import type { VNode } from "preact";
import type { Ingredient } from "../../types";
import { formatIngredient } from "../../utils/ingredientFormatter";

interface ShoppingListContentProps {
  data: Ingredient[];
}

export default function ShoppingListContent({
  data: ingredients,
}: ShoppingListContentProps): VNode {
  if (!ingredients || ingredients.length === 0) {
    return (
      <p class="text-center italic text-stone-500">
        No has seleccionado ninguna receta o snack elaborado todavía.
      </p>
    );
  }

  return (
    <div>
      <p class="text-sm text-gray-600 mb-3">
        Lista de ingredientes para comidas principales y snacks elaborados:
      </p>
      <ul class="list-disc list-inside space-y-2">
        {ingredients.map((ing, index) => {
          const formatted = formatIngredient(ing);
          return (
            <li key={`${ing.n}-${index}`} class="text-stone-700">
              {formatted.displayText}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
