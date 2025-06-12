import type { VNode } from "preact";
import type { Recipe } from "../../types";

interface RecipeCardProps {
  item: Recipe;
}

export default function RecipeCard({ item: receta }: RecipeCardProps): VNode {
  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      <div class="p-4 flex-grow">
        <h4 class="text-lg font-bold text-stone-800 mb-2 line-clamp-2">
          {receta.nombre}
        </h4>

        {/* Tags */}
        <div class="mb-3 flex flex-wrap gap-1">
          {receta.tags.map((tag) => (
            <span
              key={tag}
              class="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Información nutricional */}
        <div class="mb-3 p-2 bg-gray-50 rounded-md">
          <p class="text-sm text-stone-600 font-medium">
            {receta.calorias} kcal
          </p>
          <div class="flex justify-between text-xs text-stone-500 mt-1">
            <span>P: {receta.p}g</span>
            <span>C: {receta.c}g</span>
            <span>F: {receta.f}g</span>
          </div>
        </div>

        {/* Tipo de comida */}
        <div class="mb-3">
          <span
            class={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
              receta.tipo === "Desayuno"
                ? "bg-yellow-100 text-yellow-800"
                : receta.tipo === "Almuerzo"
                ? "bg-orange-100 text-orange-800"
                : receta.tipo === "Cena"
                ? "bg-purple-100 text-purple-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {receta.tipo}
          </span>
        </div>

        {/* Fuente (si existe) */}
        {receta.source && (
          <div class="mt-auto pt-2 border-t border-gray-100">
            <p class="text-xs text-gray-500">
              Fuente: <span class="font-medium">{receta.source.name}</span>
              {receta.source.authors && (
                <span class="block text-xs text-gray-400">
                  por {receta.source.authors}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
