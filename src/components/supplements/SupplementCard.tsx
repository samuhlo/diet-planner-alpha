import type { VNode } from "preact";
import type { Supplement } from "../../types";

interface SupplementCardProps {
  item: Supplement;
}

export default function SupplementCard({
  item: supplement,
}: SupplementCardProps): VNode {
  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200">
      <div class="p-4 flex-grow">
        <h4 class="text-lg font-bold text-stone-800 mb-2 line-clamp-2">
          {supplement.name}
        </h4>

        {/* Tags */}
        {supplement.tags && supplement.tags.length > 0 && (
          <div class="mb-3 flex flex-wrap gap-1">
            {supplement.tags.map((tag) => (
              <span
                key={tag}
                class="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Información nutricional */}
        <div class="mb-3 p-2 bg-gray-50 rounded-md">
          <p class="text-sm text-stone-600 font-medium">
            {supplement.calories} kcal
          </p>
          <div class="flex justify-between text-xs text-stone-500 mt-1">
            <span>P: {supplement.protein}g</span>
            {supplement.carbs !== undefined && (
              <span>C: {supplement.carbs}g</span>
            )}
            {supplement.fat !== undefined && <span>F: {supplement.fat}g</span>}
          </div>
        </div>

        {/* Porción */}
        {supplement.serving && (
          <div class="mb-3">
            <p class="text-xs text-stone-500 font-medium">
              Porción: <span class="text-stone-700">{supplement.serving}</span>
            </p>
          </div>
        )}

        {/* Descripción */}
        {supplement.description && (
          <div class="mt-auto pt-2 border-t border-gray-100">
            <p class="text-xs text-stone-600 line-clamp-3">
              {supplement.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
