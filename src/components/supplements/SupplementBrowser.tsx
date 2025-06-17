import type { VNode } from "preact";
import { useState, useMemo } from "preact/hooks";
import SupplementCard from "./SupplementCard.tsx";
import type { Supplement } from "../../types";
import {
  searchSupplements,
  getSupplementsByCategory,
  getSupplementsByGoal,
  filterSupplements,
  sortSupplementsByCalories,
  sortSupplementsByProtein,
  getSupplementsWithCalories,
  getSupplementsWithoutCalories,
  getSupplementsWithProtein,
} from "../../utils/supplementUtils";

interface SupplementBrowserProps {
  allSupplements: Supplement[];
}

export default function SupplementBrowser({
  allSupplements,
}: SupplementBrowserProps): VNode {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "calories" | "protein">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Obtener datos únicos para filtros
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allSupplements.forEach((supplement) => {
      supplement.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allSupplements]);

  const allCategories = useMemo(() => {
    return ["protein", "vitamins", "minerals", "performance", "health"];
  }, []);

  const allGoals = useMemo(() => {
    return [
      "muscle-gain",
      "weight-loss",
      "general-health",
      "performance",
      "recovery",
    ];
  }, []);

  const allCalories = useMemo(() => {
    return ["with-calories", "without-calories"];
  }, []);

  const allProtein = useMemo(() => {
    return ["with-protein", "without-protein"];
  }, []);

  // Filtrar suplementos usando las nuevas utilidades
  const filteredSupplements = useMemo(() => {
    let supplements = allSupplements;

    // Aplicar filtros básicos
    if (selectedTags.length > 0 || selectedCategory || selectedGoal) {
      supplements = filterSupplements(supplements, {
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
    }

    // Aplicar filtros específicos
    if (selectedCategory) {
      supplements = getSupplementsByCategory(
        supplements,
        selectedCategory as any
      );
    }

    if (selectedGoal) {
      supplements = getSupplementsByGoal(supplements, selectedGoal as any);
    }

    // Aplicar búsqueda
    if (searchTerm) {
      supplements = searchSupplements(supplements, searchTerm);
    }

    // Aplicar ordenamiento
    if (sortBy === "calories") {
      supplements = sortSupplementsByCalories(supplements, sortOrder === "asc");
    } else if (sortBy === "protein") {
      supplements = sortSupplementsByProtein(supplements, sortOrder === "asc");
    } else {
      // Ordenar por nombre
      supplements = [...supplements].sort((a, b) => {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
    }

    return supplements;
  }, [
    allSupplements,
    selectedTags,
    selectedCategory,
    selectedGoal,

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
    setSelectedCategory("");
    setSelectedGoal("");

    setSortBy("name");
    setSortOrder("asc");
  };

  const hasActiveFilters =
    selectedTags.length > 0 || selectedCategory || selectedGoal || searchTerm;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      protein: "Proteínas",
      vitamins: "Vitaminas",
      minerals: "Minerales",
      performance: "Performance",
      health: "Salud",
    };
    return labels[category] || category;
  };

  const getGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      "muscle-gain": "Ganar Músculo",
      "weight-loss": "Pérdida de Peso",
      "general-health": "Salud General",
      performance: "Performance",
      recovery: "Recuperación",
    };
    return labels[goal] || goal;
  };

  const getCaloriesLabel = (calories: string) => {
    const labels: Record<string, string> = {
      "with-calories": "Con Calorías",
      "without-calories": "Sin Calorías",
    };
    return labels[calories] || calories;
  };

  const getProteinLabel = (protein: string) => {
    const labels: Record<string, string> = {
      "with-protein": "Con Proteína",
      "without-protein": "Sin Proteína",
    };
    return labels[protein] || protein;
  };

  return (
    <div>
      {/* Filtros y Buscador */}
      <div class="bg-white p-4 rounded-lg shadow-md mb-8 space-y-4">
        {/* Barra de búsqueda */}
        <div class="flex gap-2">
          <input
            type="text"
            placeholder="Buscar suplementos por nombre, descripción o tags..."
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
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Filtro por categoría */}
          <div>
            <label
              for="supplement-category-filter"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoría
            </label>
            <select
              id="supplement-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.currentTarget.value)}
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B8A7A] focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {allCategories.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por objetivo */}
          <div>
            <label
              for="supplement-goal-filter"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Objetivo
            </label>
            <select
              id="supplement-goal-filter"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.currentTarget.value)}
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B8A7A] focus:border-transparent"
            >
              <option value="">Todos los objetivos</option>
              {allGoals.map((goal) => (
                <option key={goal} value={goal}>
                  {getGoalLabel(goal)}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <div class="md:col-span-2">
            <label
              for="supplement-sort-filter"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Ordenar por
            </label>
            <div class="flex gap-2">
              <select
                id="supplement-sort-filter"
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
          Mostrando {filteredSupplements.length} de {allSupplements.length}{" "}
          suplementos
          {hasActiveFilters && (
            <span class="ml-2 text-[#6B8A7A] font-medium">(filtrados)</span>
          )}
        </div>
      </div>

      {/* Grid de Resultados */}
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSupplements.length > 0 ? (
          filteredSupplements.map((supplement) => (
            <SupplementCard key={supplement.id} item={supplement} />
          ))
        ) : (
          <div class="col-span-full text-center py-12">
            <p class="text-stone-500 italic text-lg">
              No se han encontrado suplementos con los filtros seleccionados.
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
