import React from "preact/compat";
import { useStore } from "@nanostores/preact";
import { $modal, getModalData, closeModal } from "../../stores/modalStore";
import type { Recipe } from "../../types";
import {
  formatIngredient,
  calculateRecipePrice,
  formatEuro,
} from "../../utils/ingredientFormatter";
import { getCalorieColor, getProteinColor } from "../../utils/recipeUtils";

export default function RecipeDetailModal() {
  // Usar el store modal en lugar de props
  const modalState = useStore($modal);
  const recipe = getModalData() as Recipe;

  console.log("Modal state en RecipeDetailModal:", modalState);
  console.log("Receta en RecipeDetailModal:", recipe);

  // Si el modal no es del tipo correcto o no hay receta, no renderizar nada
  if (modalState.type !== "recipeDetail" || !recipe) {
    console.log(
      "No se renderiza el modal porque:",
      modalState.type !== "recipeDetail" ? "tipo incorrecto" : "no hay receta"
    );
    return null;
  }

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

  // Función para capitalizar la primera letra
  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Función para formatear la preparación en pasos
  const formatPreparation = (preparation: string) => {
    // Dividir por números seguidos de punto (1. 2. 3. etc.)
    const steps = preparation.split(/(?=\d+\.)/);
    return steps.filter((step) => step.trim().length > 0);
  };

  // Calcular precios
  const { total: totalPrice, breakdown: priceBreakdown } =
    calculateRecipePrice(recipe);

  return (
    <div class="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeModal}
      ></div>

      {/* Modal */}
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Botón de cerrar flotante */}
          <button
            onClick={closeModal}
            class="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
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

          {/* Content */}
          <div class="p-6">
            {/* Nombre de la receta */}
            <h2 class="text-2xl font-bold text-gray-900 mb-4 leading-tight pr-12">
              {recipe.nombre}
            </h2>

            {/* Tipo de comida */}
            <div class="mb-6">
              <span
                class={`px-3 py-1 rounded-full text-sm font-semibold ${getMealTypeColor(
                  recipe.tipo
                )}`}
              >
                {recipe.tipo}
              </span>
            </div>

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
                  <div
                    class={`text-2xl font-bold text-gray-900 ${getCalorieColor(
                      recipe.calorias
                    )}`}
                  >
                    {recipe.calorias}
                  </div>
                  <div class="text-sm text-gray-600">Calorías</div>
                </div>
                <div class="text-center">
                  <div
                    class={`text-2xl font-bold text-gray-900 ${getProteinColor(
                      recipe.p
                    )}`}
                  >
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
                    {recipe.ingredientes.map((ingrediente, index) => {
                      const formatted = formatIngredient(ingrediente);
                      const price = priceBreakdown[index];
                      return (
                        <li
                          key={index}
                          class="flex items-center space-x-3 p-2 bg-white rounded-lg shadow-sm"
                        >
                          <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span class="text-gray-700 font-medium">
                            {capitalizeFirstLetter(ingrediente.n)}
                          </span>
                          <span class="font-medium text-gray-900">
                            {formatted.quantity} {formatted.unit}
                          </span>
                          {price != null && (
                            <span class="ml-auto text-green-700 font-semibold text-sm">
                              {formatEuro(price)}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {/* Total de la receta */}
                  <div class="mt-4 text-right text-base font-bold text-green-800">
                    Total receta aprox. → {formatEuro(totalPrice)}
                  </div>
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
                  <ol class="space-y-2">
                    {formatPreparation(recipe.preparacion).map(
                      (step, index) => (
                        <li key={index} class="text-gray-800 leading-relaxed">
                          {step.trim()}
                        </li>
                      )
                    )}
                  </ol>
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
              onClick={closeModal}
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
