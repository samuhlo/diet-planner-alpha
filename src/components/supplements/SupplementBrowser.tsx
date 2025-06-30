import type { VNode } from "preact";
import { useState, useMemo } from "preact/hooks";
import SupplementCard from "./SupplementCard.tsx";
import type { Supplement } from "../../types/supplements";

interface SupplementBrowserProps {
  allSupplements: Supplement[];
}

/**
 * Funciones auxiliares para filtrado de suplementos
 */
const searchSupplements = (supplements: Supplement[], term: string) => {
  const lowerTerm = term.toLowerCase();
  return supplements.filter(
    (supplement) =>
      supplement.name.toLowerCase().includes(lowerTerm) ||
      supplement.description?.toLowerCase().includes(lowerTerm) ||
      supplement.tags?.some((tag) => tag.toLowerCase().includes(lowerTerm))
  );
};

const getSupplementsByCategory = (
  supplements: Supplement[],
  category: string
) => {
  return supplements.filter((supplement) => supplement.categoria === category);
};

const sortSupplementsByName = (supplements: Supplement[], ascending = true) => {
  return [...supplements].sort((a, b) => {
    return ascending
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });
};

const sortSupplementsByCalories = (
  supplements: Supplement[],
  ascending = true
) => {
  return [...supplements].sort((a, b) => {
    const aCalories = a.calories || 0;
    const bCalories = b.calories || 0;
    return ascending ? aCalories - bCalories : bCalories - aCalories;
  });
};

/**
 * Navegador de suplementos con filtros y búsqueda
 */
export default function SupplementBrowser({
  allSupplements,
}: SupplementBrowserProps): VNode {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "calories">("name");
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

  const allCalories = useMemo(() => {
    return ["with-calories", "without-calories"];
  }, []);

  const allProtein = useMemo(() => {
    return ["with-protein", "without-protein"];
  }, []);

  // Filtrar suplementos usando la lógica simplificada
  const filteredSupplements = useMemo(() => {
    let supplements = allSupplements;

    // Aplicar búsqueda
    if (searchTerm) {
      supplements = searchSupplements(supplements, searchTerm);
    }

    // Aplicar filtros específicos
    if (selectedCategory) {
      supplements = getSupplementsByCategory(supplements, selectedCategory);
    }

    // Filtrar por tags
    if (selectedTags.length > 0) {
      supplements = supplements.filter((supplement) =>
        selectedTags.some((tag) => supplement.tags?.includes(tag))
      );
    }

    // Aplicar ordenamiento
    if (sortBy === "calories") {
      supplements = sortSupplementsByCalories(supplements, sortOrder === "asc");
    } else {
      // Ordenar por nombre
      supplements = sortSupplementsByName(supplements, sortOrder === "asc");
    }

    return supplements;
  }, [
    allSupplements,
    selectedTags,
    selectedCategory,
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

    setSortBy("name");
    setSortOrder("asc");
  };

  const hasActiveFilters =
    selectedTags.length > 0 || selectedCategory || searchTerm;

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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Ordenamiento */}
          <div>
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
