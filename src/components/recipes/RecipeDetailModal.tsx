import type { Recipe } from "../../types";

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeDetailModal({
  recipe,
  isOpen,
  onClose,
}: RecipeDetailModalProps) {
  if (!isOpen || !recipe) return null;

  const getMealTypeColor = (tipo: string) => {
    switch (tipo) {
      case "Desayuno":
        return "bg-yellow-100 text-yellow-800";
      case "Almuerzo":
        return "bg-orange-100 text-orange-800";
      case "Cena":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getMealTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "Desayuno":
        return "🌅";
      case "Almuerzo":
        return "🌞";
      case "Cena":
        return "🌙";
      default:
        return "🍽️";
    }
  };

  const getCalorieColor = (calories: number) => {
    if (calories < 300) return "text-green-600";
    if (calories < 500) return "text-yellow-600";
    return "text-red-600";
  };

  const getProteinColor = (protein: number) => {
    if (protein >= 30) return "text-green-600";
    if (protein >= 20) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div class="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3"></div>
              <button
                onClick={onClose}
                class="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div class="p-6">
            {/* Nombre de la receta */}
            <h2 class="text-2xl font-bold text-gray-900 mb-4 leading-tight">
              {recipe.nombre}
            </h2>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div class="flex flex-wrap gap-2 mb-6">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Información nutricional */}
            <div class="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Información Nutricional
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">
                    {recipe.calorias}
                  </div>
                  <div class="text-sm text-gray-600">Calorías</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">
                    {recipe.p}g
                  </div>
                  <div class="text-sm text-gray-600">Proteína</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">
                    {recipe.c}g
                  </div>
                  <div class="text-sm text-gray-600">Carbohidratos</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">
                    {recipe.f}g
                  </div>
                  <div class="text-sm text-gray-600">Grasas</div>
                </div>
              </div>
            </div>

            {/* Ingredientes */}
            {recipe.ingredientes && recipe.ingredientes.length > 0 && (
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Ingredientes
                </h3>
                <div class="bg-gray-50 rounded-xl p-4">
                  <ul class="space-y-2">
                    {recipe.ingredientes.map((ingrediente, index) => (
                      <li
                        key={index}
                        class="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm"
                      >
                        <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span class="font-medium text-gray-900">
                          {ingrediente.q} {ingrediente.u}
                        </span>
                        <span class="text-gray-700">{ingrediente.n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Preparación */}
            {recipe.preparacion && (
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">
                  Preparación
                </h3>
                <div class="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-400">
                  <p class="text-gray-800 leading-relaxed whitespace-pre-line">
                    {recipe.preparacion}
                  </p>
                </div>
              </div>
            )}

            {/* Fuente */}
            {recipe.source && (
              <div class="bg-gray-50 rounded-xl p-4">
                <h3 class="text-sm font-semibold text-gray-700 mb-2">Fuente</h3>
                <div class="text-gray-600">
                  <div class="font-medium">{recipe.source.name}</div>
                  {recipe.source.authors && (
                    <div class="text-sm">por {recipe.source.authors}</div>
                  )}
                  {recipe.source.year && (
                    <div class="text-sm">{recipe.source.year}</div>
                  )}
                  {recipe.source.url && (
                    <a
                      href={recipe.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Ver fuente original
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <button
              onClick={onClose}
              class="w-full bg-[#6B8A7A] text-white font-semibold py-3 px-6 rounded-xl hover:bg-[#5a7a6a] transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
