import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "preact/hooks";
import type { Recipe } from "../../types";
import { filterRecipes, sortRecipesByCalories } from "../../utils/recipeUtils";
import { openModal } from "../../stores/modalStore";

interface RecipeSelectorProps {
  mealType: string;
  selectedRecipe?: string;
  onRecipeSelect: (recipeName: string) => void;
  allMeals: Recipe[];
}

export default function RecipeSelector({
  mealType,
  selectedRecipe,
  onRecipeSelect,
  allMeals,
}: RecipeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "calories" | "protein">("name");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar y ordenar recetas según búsqueda y criterios
  const filteredRecipes = useMemo(() => {
    console.log("Filtrando recetas con término:", searchTerm); // Debug

    // Filtrar por tipo de comida primero
    let filtered = allMeals.filter((meal) => meal.tipo === mealType);

    // Aplicar filtro de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          recipe.nombre.toLowerCase().includes(searchLower) ||
          recipe.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          (recipe.source?.name &&
            recipe.source.name.toLowerCase().includes(searchLower))
      );
    }

    console.log("Recetas filtradas:", filtered.length); // Debug

    // Aplicar ordenamiento
    switch (sortBy) {
      case "calories":
        return sortRecipesByCalories(filtered, true);
      case "protein":
        return [...filtered].sort((a, b) => (b.p || 0) - (a.p || 0));
      case "name":
      default:
        return [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
  }, [allMeals, mealType, searchTerm, sortBy]);

  // Obtener la receta seleccionada
  const selectedRecipeData = useMemo(() => {
    return allMeals.find((meal) => meal.nombre === selectedRecipe);
  }, [allMeals, selectedRecipe]);

  // Manejar selección de receta
  const handleRecipeSelect = useCallback(
    (recipeName: string) => {
      onRecipeSelect(recipeName);
      setShowDropdown(false);
    },
    [onRecipeSelect]
  );

  // Manejar limpieza de selección
  const handleClearSelection = useCallback(() => {
    onRecipeSelect("");
    setSearchTerm("");
    setShowDropdown(false);
  }, [onRecipeSelect]);

  // Manejar cambio en el input
  const handleInputChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    console.log("Input cambiado a:", newValue); // Debug
    setSearchTerm(newValue);
    setShowDropdown(true);
  }, []);

  // Manejar foco en el input
  const handleInputFocus = useCallback(() => {
    setShowDropdown(true);
  }, []);

  // Manejar clics fuera del dropdown
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(target) &&
      inputRef.current &&
      !inputRef.current.contains(target)
    ) {
      setShowDropdown(false);
    }
  }, []);

  // Agregar/remover event listener para clics fuera
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div class="relative">
      {/* Campo de entrada - Solo mostrar si no hay receta seleccionada */}
      {!selectedRecipeData && (
        <div class="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={`Buscar ${mealType.toLowerCase()}...`}
            value={searchTerm}
            onInput={handleInputChange}
            onFocus={handleInputFocus}
            class="w-full text-sm border border-gray-300 rounded-md p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />

          {/* Icono de búsqueda */}
          <div class="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              class="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Receta seleccionada */}
      {selectedRecipeData && (
        <div
          class="p-2 bg-green-50 border border-green-200 rounded-md cursor-pointer hover:bg-green-100 transition"
          onClick={() => openModal("recipeDetail", selectedRecipeData)}
          title="Ver detalles de la receta"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h4 class="font-medium text-green-800">
                {selectedRecipeData.nombre}
              </h4>
              <div class="flex gap-2 text-xs text-green-600 mt-1">
                <span>{selectedRecipeData.calorias} kcal</span>
                {selectedRecipeData.p && <span>{selectedRecipeData.p}g P</span>}
                {selectedRecipeData.c && <span>{selectedRecipeData.c}g C</span>}
                {selectedRecipeData.f && <span>{selectedRecipeData.f}g F</span>}
              </div>
              <div class="flex gap-1 mt-1">
                {selectedRecipeData.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    class="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearSelection();
              }}
              class="ml-2 text-green-600 hover:text-green-800"
              title="Limpiar selección"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Dropdown de búsqueda - Solo mostrar si no hay receta seleccionada */}
      {showDropdown && !selectedRecipeData && (
        <div
          ref={dropdownRef}
          class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          {/* Controles de ordenamiento */}
          <div class="p-2 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600">Ordenar por:</span>
              <div class="flex gap-1">
                {[
                  { key: "name", label: "Nombre" },
                  { key: "calories", label: "Calorías" },
                  { key: "protein", label: "Proteína" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSortBy(option.key as any)}
                    class={`px-2 py-1 text-xs rounded ${
                      sortBy === option.key
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lista de recetas */}
          <div class="py-1">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <button
                  key={recipe.nombre}
                  onClick={() => handleRecipeSelect(recipe.nombre)}
                  class="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900">{recipe.nombre}</h4>
                      <div class="flex gap-2 text-xs text-gray-600 mt-1">
                        <span>{recipe.calorias} kcal</span>
                        {recipe.p && <span>{recipe.p} P</span>}
                        {recipe.c && <span>{recipe.c} C</span>}
                        {recipe.f && <span>{recipe.f} F</span>}
                      </div>
                      <div class="flex gap-1 mt-1">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            class="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div class="ml-2 text-xs text-gray-500">{recipe.tipo}</div>
                  </div>
                </button>
              ))
            ) : (
              <div class="px-3 py-4 text-center text-gray-500">
                {searchTerm.trim()
                  ? `No se encontraron recetas que coincidan con "${searchTerm}"`
                  : "Escribe para buscar recetas..."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
