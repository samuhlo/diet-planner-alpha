import type { VNode } from "preact";
import { useState, useMemo } from "preact/hooks";
import RecipeCard from "./RecipeCard.tsx";
import type { Recipe } from "../../types";
import {
  searchRecipes,
  getRecipesByTag,
  getRecipesByType,
  getRecipesBySource,
  getUniqueSources,
  filterRecipes,
  sortRecipesByCalories,
} from "../../utils";

interface RecipeBrowserProps {
  allMeals: Recipe[];
}

export default function RecipeBrowser({ allMeals }: RecipeBrowserProps): VNode {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<
    "Desayuno" | "Almuerzo" | "Cena" | "Snack" | ""
  >("");
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "calories" | "protein">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Obtener datos únicos para filtros
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allMeals.forEach((recipe) => {
      recipe.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allMeals]);

  const allTypes = useMemo(() => {
    const types = new Set(allMeals.map((recipe) => recipe.tipo));
    return Array.from(types).sort();
  }, [allMeals]);

  const allSources = useMemo(() => {
    return getUniqueSources(allMeals);
  }, [allMeals]);

  // Filtrar recetas usando las nuevas utilidades
  const filteredRecipes = useMemo(() => {
    let recipes = allMeals;

    // Aplicar filtros
    if (
      selectedTags.length > 0 ||
      selectedType ||
      selectedSource ||
      searchTerm
    ) {
      recipes = filterRecipes(allMeals, {
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        type: selectedType || undefined,
        sourceId: selectedSource || undefined,
      });
    }

    // Aplicar búsqueda
    if (searchTerm) {
      recipes = searchRecipes(recipes, searchTerm);
    }

    // Aplicar ordenamiento
    if (sortBy === "calories") {
      recipes = sortRecipesByCalories(recipes, sortOrder === "asc");
    } else if (sortBy === "protein") {
      recipes = [...recipes].sort((a, b) => {
        return sortOrder === "asc" ? a.p - b.p : b.p - a.p;
      });
    } else {
      // Ordenar por nombre
      recipes = [...recipes].sort((a, b) => {
        return sortOrder === "asc"
          ? a.nombre.localeCompare(b.nombre)
          : b.nombre.localeCompare(a.nombre);
      });
    }

    return recipes;
  }, [
    allMeals,
    selectedTags,
    selectedType,
    selectedSource,
    searchTerm,
    sortBy,
    sortOrder,
  ]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
    setSelectedType("");
    setSelectedSource("");
    setSortBy("name");
    setSortOrder("asc");
  };

  const hasActiveFilters =
    selectedTags.length > 0 || selectedType || selectedSource || searchTerm;

  return (
    <div>
      {/* Filtros y Buscador */}
      <div class="bg-white p-4 rounded-lg shadow-md mb-8 space-y-4">
        {/* Barra de búsqueda */}
        <div class="flex gap-2">
          <input
            type="text"
            placeholder="Buscar recetas por nombre, ingredientes o tags..."
            value={searchTerm}
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            class="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B8A7A] focus:border-transparent"
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtros rápidos */}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro por tipo */}
          <div>
            <label
              for="recipe-type-filter"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de comida
            </label>
            <select
              id="recipe-type-filter"
              value={selectedType}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setSelectedType(
                  value as "Desayuno" | "Almuerzo" | "Cena" | "Snack" | ""
                );
              }}
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B8A7A] focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {allTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por fuente */}
          <div>
            <label
              for="recipe-source-filter"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Fuente
            </label>
            <select
              id="recipe-source-filter"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.currentTarget.value)}
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B8A7A] focus:border-transparent"
            >
              <option value="">Todas las fuentes</option>
              {allSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <label
              for="recipe-sort-filter"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Ordenar por
            </label>
            <div class="flex gap-2">
              <select
                id="recipe-sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.currentTarget.value as any)}
                class="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B8A7A] focus:border-transparent"
              >
                <option value="name">Nombre</option>
                <option value="calories">Calorías</option>
                <option value="protein">Proteína</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title={sortOrder === "asc" ? "Ascendente" : "Descendente"}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tags ({selectedTags.length} seleccionados)
          </label>
          <div class="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                class={`cursor-pointer border rounded-full py-1 px-3 text-sm transition ${
                  selectedTags.includes(tag)
                    ? "bg-[#6B8A7A] text-white border-[#6B8A7A]"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Información de resultados */}
        <div class="text-sm text-gray-600">
          Mostrando {filteredRecipes.length} de {allMeals.length} recetas
          {hasActiveFilters && (
            <span class="ml-2 text-[#6B8A7A] font-medium">(filtradas)</span>
          )}
        </div>
      </div>

      {/* Grid de Resultados */}
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((receta) => (
            <RecipeCard key={receta.nombre} item={receta} />
          ))
        ) : (
          <div class="col-span-full text-center py-12">
            <p class="text-stone-500 italic text-lg">
              No se han encontrado recetas con los filtros seleccionados.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                class="mt-4 px-6 py-2 bg-[#6B8A7A] text-white rounded-md hover:bg-[#5A7A6A] transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
