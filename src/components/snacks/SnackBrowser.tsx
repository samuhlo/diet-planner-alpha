import type { VNode } from "preact";
import { useState, useMemo } from "preact/hooks";
import SnackCard from "./SnackCard.tsx";
import type { Snack } from "../../types";
import {
  searchSnacks,
  getSnacksByType,
  getSnacksByTag,
  getSnacksByNutritionalCategory,
  getSnacksByTimeOfDay,
  filterSnacks,
  sortSnacksByCalories,
} from "../../utils";

interface SnackBrowserProps {
  allSnacks: Snack[];
}

export default function SnackBrowser({ allSnacks }: SnackBrowserProps): VNode {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<"simple" | "elaborado" | "">(
    ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "calories" | "protein">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Obtener datos únicos para filtros
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allSnacks.forEach((snack) => {
      snack.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allSnacks]);

  const allCategories = useMemo(() => {
    return ["protein", "carbs", "fat", "fiber", "balanced"];
  }, []);

  const allTimeOfDay = useMemo(() => {
    return ["morning", "afternoon", "evening", "post-workout", "anytime"];
  }, []);

  // Filtrar snacks usando las nuevas utilidades
  const filteredSnacks = useMemo(() => {
    let snacks = allSnacks;

    // Aplicar filtros
    if (
      selectedTags.length > 0 ||
      selectedType ||
      selectedCategory ||
      selectedTimeOfDay
    ) {
      snacks = filterSnacks(snacks, {
        type: selectedType || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
    }

    // Aplicar filtros específicos
    if (selectedCategory) {
      snacks = getSnacksByNutritionalCategory(snacks, selectedCategory as any);
    }

    if (selectedTimeOfDay) {
      snacks = getSnacksByTimeOfDay(snacks, selectedTimeOfDay as any);
    }

    // Aplicar búsqueda
    if (searchTerm) {
      snacks = searchSnacks(snacks, searchTerm);
    }

    // Aplicar ordenamiento
    if (sortBy === "calories") {
      snacks = sortSnacksByCalories(snacks, sortOrder === "asc");
    } else if (sortBy === "protein") {
      snacks = [...snacks].sort((a, b) => {
        return sortOrder === "asc" ? a.p - b.p : b.p - a.p;
      });
    } else {
      // Ordenar por nombre
      snacks = [...snacks].sort((a, b) => {
        return sortOrder === "asc"
          ? a.nombre.localeCompare(b.nombre)
          : b.nombre.localeCompare(a.nombre);
      });
    }

    return snacks;
  }, [
    allSnacks,
    selectedTags,
    selectedType,
    selectedCategory,
    selectedTimeOfDay,
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
    setSelectedCategory("");
    setSelectedTimeOfDay("");
    setSortBy("name");
    setSortOrder("asc");
  };

  const hasActiveFilters =
    selectedTags.length > 0 ||
    selectedType ||
    selectedCategory ||
    selectedTimeOfDay ||
    searchTerm;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      protein: "Alto en Proteína",
      carbs: "Alto en Carbohidratos",
      fat: "Alto en Grasas",
      fiber: "Alto en Fibra",
      balanced: "Balanceado",
    };
    return labels[category] || category;
  };

  const getTimeOfDayLabel = (time: string) => {
    const labels: Record<string, string> = {
      morning: "Mañana",
      afternoon: "Tarde",
      evening: "Noche",
      "post-workout": "Post-entrenamiento",
      anytime: "Cualquier momento",
    };
    return labels[time] || time;
  };

  return (
    <div>
      {/* Filtros y Buscador */}
      <div class="bg-white p-4 rounded-lg shadow-md mb-8 space-y-4">
        {/* Barra de búsqueda */}
        <div class="flex gap-2">
          <input
            type="text"
            placeholder="Buscar snacks por nombre, ingredientes o tags..."
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro por tipo */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setSelectedType(value as "simple" | "elaborado" | "");
              }}
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B8A7A] focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              <option value="simple">Simple</option>
              <option value="elaborado">Elaborado</option>
            </select>
          </div>

          {/* Filtro por categoría nutricional */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
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

          {/* Filtro por momento del día */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Momento del día
            </label>
            <select
              value={selectedTimeOfDay}
              onChange={(e) => setSelectedTimeOfDay(e.currentTarget.value)}
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#6B8A7A] focus:border-transparent"
            >
              <option value="">Cualquier momento</option>
              {allTimeOfDay.map((time) => (
                <option key={time} value={time}>
                  {getTimeOfDayLabel(time)}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <div class="flex gap-2">
              <select
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
          Mostrando {filteredSnacks.length} de {allSnacks.length} snacks
          {hasActiveFilters && (
            <span class="ml-2 text-[#6B8A7A] font-medium">(filtrados)</span>
          )}
        </div>
      </div>

      {/* Grid de Resultados */}
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSnacks.length > 0 ? (
          filteredSnacks.map((snack) => (
            <SnackCard key={snack.id} item={snack} />
          ))
        ) : (
          <div class="col-span-full text-center py-12">
            <p class="text-stone-500 italic text-lg">
              No se han encontrado snacks con los filtros seleccionados.
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
