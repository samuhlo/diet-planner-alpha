export default function SnackCard({ item: snack }) {
  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div class="p-4 flex-grow">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-lg font-bold text-stone-800">{snack.nombre}</h4>
          <span
            class={`text-xs px-2 py-1 rounded-full ${
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
              class="bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <p class="text-sm text-stone-600 mb-2">
          {snack.calorias} kcal | P: {snack.p}g C: {snack.c}g F: {snack.f}g
        </p>

        <p class="text-xs text-stone-500">Porción: {snack.porcion}</p>

        {snack.tipo === "elaborado" && snack.ingredientes && (
          <div class="mt-3 pt-3 border-t border-gray-200">
            <p class="text-xs font-semibold text-stone-700 mb-1">
              Ingredientes:
            </p>
            <ul class="text-xs text-stone-600 space-y-1">
              {snack.ingredientes.slice(0, 3).map((ing, index) => (
                <li key={index}>
                  • {ing.q}
                  {ing.u} {ing.n}
                </li>
              ))}
              {snack.ingredientes.length > 3 && (
                <li class="text-stone-500">
                  ... y {snack.ingredientes.length - 3} más
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
