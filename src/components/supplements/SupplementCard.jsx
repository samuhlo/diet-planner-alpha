export default function SupplementCard({ item: supplement }) {
  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div class="p-4 flex-grow">
        <h4 class="text-lg font-bold text-stone-800 mb-2">{supplement.name}</h4>

        {/* Solo mostrar tags si existen */}
        {supplement.tags && supplement.tags.length > 0 && (
          <div class="mb-3 flex flex-wrap gap-1">
            {supplement.tags.map((tag) => (
              <span
                key={tag}
                class="bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p class="text-sm text-stone-600 mb-2">
          {supplement.calories} kcal | P: {supplement.protein}g
          {supplement.carbs !== undefined && ` C: ${supplement.carbs}g`}
          {supplement.fat !== undefined && ` F: ${supplement.fat}g`}
        </p>

        {supplement.serving && (
          <p class="text-xs text-stone-500 mb-2">
            Porción: {supplement.serving}
          </p>
        )}

        {supplement.description && (
          <p class="text-xs text-stone-600 italic">{supplement.description}</p>
        )}
      </div>
    </div>
  );
}
