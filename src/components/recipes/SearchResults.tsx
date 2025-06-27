import React, { useState } from "preact/compat";
import { useStore } from "@nanostores/preact";
import {
  $filteredRecipes,
  $filteredSupplements,
  $searchStats,
  $searchFilters,
  updateFilters,
} from "../../stores/searchStore";
import { openRecipeDetailModal } from "../../stores/modalStore";
import { openSupplementDetailModal } from "../../stores/modalStore";
import type { Recipe } from "../../types";
import type { Supplement } from "../../types/supplements";

interface SearchResultsProps {
  className?: string;
  maxResults?: number;
  showFilters?: boolean;
  showTabs?: boolean;
}

export default function SearchResults({
  className = "",
  maxResults = 50,
  showFilters = true,
  showTabs = true,
}: SearchResultsProps) {
  const recipes = useStore($filteredRecipes);
  const supplements = useStore($filteredSupplements);
  const stats = useStore($searchStats);
  const filters = useStore($searchFilters);

  const [activeTab, setActiveTab] = useState<"all" | "recipes" | "supplements">(
    "all"
  );
  const [page, setPage] = useState(1);
  const resultsPerPage = 10;

  // Calcular resultados a mostrar según el tab activo
  const getVisibleResults = () => {
    const startIndex = (page - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;

    let recipeResults: Recipe[] = [];
    let supplementResults: Supplement[] = [];

    switch (activeTab) {
      case "recipes":
        recipeResults = recipes.items
          .slice(0, maxResults)
          .slice(startIndex, endIndex);
        break;
      case "supplements":
        supplementResults = supplements.items
          .slice(0, maxResults)
          .slice(startIndex, endIndex);
        break;
      case "all":
      default:
        // Mostrar una mezcla de ambos tipos de resultados
        const totalItems = Math.min(
          recipes.items.length + supplements.items.length,
          maxResults
        );
        const halfPerPage = Math.ceil(resultsPerPage / 2);

        recipeResults = recipes.items.slice(
          0,
          Math.min(halfPerPage, recipes.items.length)
        );
        supplementResults = supplements.items.slice(
          0,
          Math.min(halfPerPage, supplements.items.length)
        );

        // Si un tipo tiene menos resultados, mostrar más del otro tipo
        if (recipeResults.length < halfPerPage) {
          const extra = halfPerPage - recipeResults.length;
          supplementResults = supplements.items.slice(
            0,
            Math.min(halfPerPage + extra, supplements.items.length)
          );
        } else if (supplementResults.length < halfPerPage) {
          const extra = halfPerPage - supplementResults.length;
          recipeResults = recipes.items.slice(
            0,
            Math.min(halfPerPage + extra, recipes.items.length)
          );
        }
        break;
    }

    return { recipeResults, supplementResults };
  };

  // Calcular el número total de páginas
  const getTotalPages = () => {
    let totalItems = 0;

    switch (activeTab) {
      case "recipes":
        totalItems = Math.min(recipes.items.length, maxResults);
        break;
      case "supplements":
        totalItems = Math.min(supplements.items.length, maxResults);
        break;
      case "all":
      default:
        totalItems = Math.min(
          recipes.items.length + supplements.items.length,
          maxResults
        );
        break;
    }

    return Math.ceil(totalItems / resultsPerPage);
  };

  // Cambiar de página
  const changePage = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, getTotalPages())));
  };

  // Manejar cambio de tab
  const handleTabChange = (tab: "all" | "recipes" | "supplements") => {
    setActiveTab(tab);
    setPage(1);
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    const [sortBy, sortDirection] = target.value.split("-") as [
      any,
      "asc" | "desc"
    ];
    updateFilters({ sortBy, sortDirection });
  };

  // Renderizar un elemento de receta
  const renderRecipeItem = (recipe: Recipe) => (
    <div
      key={recipe.id}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => openRecipeDetailModal(recipe)}
    >
      <h3 className="font-medium text-gray-900">{recipe.nombre}</h3>

      <div className="mt-1 flex flex-wrap gap-2">
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          {recipe.tipo}
        </span>

        {recipe.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-gray-600">
        <div>
          <span className="font-semibold">{recipe.calorias}</span> kcal
        </div>
        <div>
          <span className="font-semibold">{recipe.p}g</span> proteína
        </div>
        <div>
          <span className="font-semibold">{recipe.c}g</span> carbos
        </div>
      </div>
    </div>
  );

  // Renderizar un elemento de suplemento
  const renderSupplementItem = (supplement: Supplement) => (
    <div
      key={supplement.id}
      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => openSupplementDetailModal(supplement)}
    >
      <h3 className="font-medium text-gray-900">{supplement.name}</h3>

      <div className="mt-1 flex flex-wrap gap-2">
        {supplement.type && (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {supplement.type}
          </span>
        )}

        {supplement.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-2 text-sm text-gray-600">
        {supplement.description && (
          <p className="line-clamp-2">{supplement.description}</p>
        )}

        {(supplement.nutritionalInfo ||
          supplement.protein ||
          supplement.proteinas) && (
          <div className="mt-1">
            <span className="font-semibold">
              {supplement.nutritionalInfo?.protein ||
                supplement.protein ||
                supplement.proteinas ||
                0}
              g
            </span>{" "}
            proteína
          </div>
        )}
      </div>
    </div>
  );

  // Obtener los resultados a mostrar
  const { recipeResults, supplementResults } = getVisibleResults();
  const totalPages = getTotalPages();

  // Si no hay resultados
  if (recipes.items.length === 0 && supplements.items.length === 0) {
    return (
      <div
        className={`bg-white rounded-lg shadow p-6 text-center ${className}`}
      >
        <svg
          className="w-12 h-12 mx-auto text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No se encontraron resultados
        </h3>
        <p className="mt-1 text-gray-500">
          Intenta con otra búsqueda o ajusta los filtros.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Cabecera con estadísticas y filtros */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Resultados de búsqueda
            </h2>
            <p className="text-sm text-gray-500">
              Se encontraron {stats.totalResults} resultados
            </p>
          </div>

          {showFilters && (
            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="text-sm text-gray-600">
                Ordenar por:
              </label>
              <select
                id="sort"
                className="text-sm border border-gray-300 rounded-md p-1"
                value={`${filters.sortBy}-${filters.sortDirection}`}
                onChange={handleSortChange}
              >
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                <option value="calories-asc">Calorías (menor a mayor)</option>
                <option value="calories-desc">Calorías (mayor a menor)</option>
                <option value="protein-asc">Proteína (menor a mayor)</option>
                <option value="protein-desc">Proteína (mayor a menor)</option>
              </select>
            </div>
          )}
        </div>

        {/* Tabs */}
        {showTabs && (
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => handleTabChange("all")}
                className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "all"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Todos ({stats.totalResults})
              </button>
              <button
                onClick={() => handleTabChange("recipes")}
                className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "recipes"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Recetas ({stats.recipeResults})
              </button>
              <button
                onClick={() => handleTabChange("supplements")}
                className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "supplements"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Suplementos ({stats.supplementResults})
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recetas */}
          {(activeTab === "all" || activeTab === "recipes") &&
            recipeResults.map((recipe) => renderRecipeItem(recipe))}

          {/* Suplementos */}
          {(activeTab === "all" || activeTab === "supplements") &&
            supplementResults.map((supplement) =>
              renderSupplementItem(supplement)
            )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className={`px-3 py-1 rounded-md ${
                  page === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => Math.abs(p - page) < 3 || p === 1 || p === totalPages
                )
                .map((p, i, arr) => {
                  // Agregar puntos suspensivos si hay saltos en la paginación
                  if (i > 0 && p > arr[i - 1] + 1) {
                    return (
                      <React.Fragment key={`ellipsis-${p}`}>
                        <span className="px-3 py-1 text-gray-400">...</span>
                        <button
                          onClick={() => changePage(p)}
                          className={`px-3 py-1 rounded-md ${
                            page === p
                              ? "bg-green-100 text-green-700 font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => changePage(p)}
                      className={`px-3 py-1 rounded-md ${
                        page === p
                          ? "bg-green-100 text-green-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded-md ${
                  page === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
