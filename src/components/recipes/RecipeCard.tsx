import type { VNode } from "preact";
import type { Recipe } from "../../types";
import {
  getCalorieColor,
  getProteinColor,
  getTipoColor,
} from "../../utils/recipeUtils";

interface RecipeCardProps {
  item: Recipe;
  onViewRecipe?: (recipe: Recipe) => void;
}

export default function RecipeCard({
  item: receta,
  onViewRecipe,
}: RecipeCardProps): VNode {
  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div class="p-4 flex flex-col gap-1 justify-around">
        <h4 class="text-lg font-bold text-stone-800 mb-1 line-clamp-2 h-[60px] ">
          {receta.nombre}
        </h4>
        <div class="flex flex-col gap-1">
          {/* Tipo de comida destacado */}
          <div
            class={`inline-block  mb-3 px-4 py-1 rounded-full font-semibold text-base w-fit ${getTipoColor(
              receta.tipo
            )}`}
          >
            {receta.tipo}
          </div>
          {/* Tags */}
          <div class="mb-1 flex flex-wrap gap-1">
            {receta.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                class="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          {receta.tags.length > 3 && (
            <span class="bg-gray-200 text-gray-500 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              +{receta.tags.length - 3}
            </span>
          )}
        </div>
        {/* Información nutricional mejorada */}
        <div class="mb-4">
          <div class="grid grid-cols-2 gap-2 mb-2">
            <div class="text-center p-2 bg-gray-50 rounded-lg">
              <div
                class={`text-lg font-bold ${getCalorieColor(receta.calorias)}`}
              >
                {receta.calorias}
              </div>
              <div class="text-xs text-gray-600">kcal</div>
            </div>
            <div class="text-center p-2 bg-gray-50 rounded-lg">
              <div class={`text-lg font-bold ${getProteinColor(receta.p)}`}>
                {receta.p}g
              </div>
              <div class="text-xs text-gray-600">proteína</div>
            </div>
          </div>
          <div class="flex justify-between text-sm text-gray-600">
            <span>Carbos: {receta.c}g</span>
            <span>Grasas: {receta.f}g</span>
          </div>
        </div>
        {/* Botón para ver receta */}
      </div>
      <button
        onClick={() => onViewRecipe?.(receta)}
        class="w-3/4 self-center mb-5
         bg-[#6B8A7A] text-white font-semibold py-1  rounded-lg hover:bg-[#5a7a6a] transition-colors duration-200 mt-[-1em] "
      >
        <span class="flex items-center justify-center space-x-2">
          <span>Ver Receta</span>
        </span>
      </button>
    </div>
  );
}
