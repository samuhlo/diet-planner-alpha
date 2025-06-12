import type { VNode } from "preact";
import type { Snack } from "../../types";

interface SnackCardProps {
  item: Snack;
}

export default function SnackCard({ item: snack }: SnackCardProps): VNode {
  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      <div class="p-4 flex-grow">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-lg font-bold text-stone-800 line-clamp-2">
            {snack.nombre}
          </h4>
          <span
            class={`text-xs px-2 py-1 rounded-full font-medium ${
              snack.tipo === "simple"
                ? "bg-green-100 text-green-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {snack.tipo === "simple" ? "Simple" : "Elaborado"}
          </span>
        </div>

        <div class="mb-3 flex flex-wrap gap-1">
          {snack.tags.map((tag) => (
            <span
              key={tag}
              class="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div class="mb-3 p-2 bg-gray-50 rounded-md">
          <p class="text-sm text-stone-600 font-medium">
            {snack.calorias} kcal
          </p>
          <div class="flex justify-between text-xs text-stone-500 mt-1">
            <span>P: {snack.p}g</span>
            <span>C: {snack.c}g</span>
            <span>F: {snack.f}g</span>
          </div>
        </div>

        <div class="mb-3">
          <p class="text-xs text-stone-500 font-medium">
            Porción: <span class="text-stone-700">{snack.porcion}</span>
          </p>
        </div>

        {snack.tipo === "elaborado" && snack.ingredientes && (
          <div class="mt-auto pt-3 border-t border-gray-100">
            <p class="text-xs font-semibold text-stone-700 mb-2">
              Ingredientes:
            </p>
            <ul class="text-xs text-stone-600 space-y-1">
              {snack.ingredientes.slice(0, 3).map((ing, index) => (
                <li key={index} class="flex items-center">
                  <span class="w-1 h-1 bg-stone-400 rounded-full mr-2"></span>
                  {ing.q} {ing.u} {ing.n}
                </li>
              ))}
              {snack.ingredientes.length > 3 && (
                <li class="text-stone-500 italic">
                  ... y {snack.ingredientes.length - 3} más
                </li>
              )}
            </ul>
          </div>
        )}

        {snack.tipo === "elaborado" && snack.preparacion && (
          <div class="mt-2 pt-2 border-t border-gray-100">
            <p class="text-xs font-semibold text-stone-700 mb-1">
              Preparación:
            </p>
            <p class="text-xs text-stone-600 line-clamp-2">
              {snack.preparacion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
