import type { VNode } from "preact";
import type { Recipe } from "../../types";

interface RecipeCardProps {
  item: Recipe;
}

export default function RecipeCard({ item: receta }: RecipeCardProps): VNode {
  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div class="p-4 flex-grow">
        <h4 class="text-lg font-bold text-stone-800 mb-2">{receta.nombre}</h4>
        <div class="mb-3 flex flex-wrap gap-1">
          {receta.tags.map((tag) => (
            <span
              key={tag}
              class="bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <p class="text-sm text-stone-600">
          {receta.calorias} kcal | P: {receta.p}g C: {receta.c}g F: {receta.f}g
        </p>
      </div>
    </div>
  );
}
