import React, { useState, useEffect, useRef } from "preact/compat";
import { useStore } from "@nanostores/preact";
import {
  setSearchQuery,
  updateFilters,
  clearFilters,
  setSearchType,
  $search,
  getTotalResultsCount,
  $searchFilters,
  $searchHistory,
  addToSearchHistory,
  clearSearchHistory,
} from "../../stores/searchStore";
import { getAllRecipeTags, getAllRecipeTypes } from "../../stores/recipesStore";
import { getAllSupplementTags } from "../../stores/supplementsStore";

interface SearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  showTypeSelector?: boolean;
  onSearch?: (term: string) => void;
  className?: string;
  showHistory?: boolean;
  autoFocus?: boolean;
}

export default function SearchBar({
  placeholder = "Buscar...",
  showFilters = true,
  showTypeSelector = true,
  onSearch,
  className = "",
  showHistory = true,
  autoFocus = false,
}: SearchBarProps) {
  const searchState = useStore($search);
  const filters = useStore($searchFilters);
  const searchHistory = useStore($searchHistory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Cargar opciones disponibles
  useEffect(() => {
    const recipeTags = getAllRecipeTags();
    const supplementTags = getAllSupplementTags();
    const recipeTypes = getAllRecipeTypes();

    // Combinar y eliminar duplicados
    const allTags = [...new Set([...recipeTags, ...supplementTags])];

    setAvailableTags(allTags);
    setAvailableTypes(recipeTypes);
  }, []);

  // Actualizar contador de resultados
  useEffect(() => {
    setResultsCount(getTotalResultsCount());
  }, [searchState]);

  // Manejar cambio en el input
  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    updateFilters({ searchTerm: target.value });
  };

  // Manejar envío del formulario
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const term = filters.searchTerm.trim();

    if (term) {
      addToSearchHistory(term);
      if (onSearch) onSearch(term);
    }

    setIsHistoryVisible(false);
  };

  // Manejar clic en un elemento del historial
  const handleHistoryItemClick = (term: string) => {
    updateFilters({ searchTerm: term });
    if (onSearch) onSearch(term);
    setIsHistoryVisible(false);
    inputRef.current?.focus();
  };

  // Manejar foco en el input
  const handleFocus = () => {
    setIsFocused(true);
    if (showHistory && searchHistory.length > 0) {
      setIsHistoryVisible(true);
    }
  };

  // Manejar clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        historyRef.current &&
        !historyRef.current.contains(e.target as Node)
      ) {
        setIsHistoryVisible(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Autofocus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(e.target.value as any);
  };

  const handleTypeFilterChange = (type: string) => {
    const currentTypes = [...searchState.filters.type];
    const index = currentTypes.indexOf(type);

    if (index >= 0) {
      currentTypes.splice(index, 1);
    } else {
      currentTypes.push(type);
    }

    updateFilters({ type: currentTypes });
  };

  const handleTagFilterChange = (tag: string) => {
    const currentTags = [...searchState.filters.tags];
    const index = currentTags.indexOf(tag);

    if (index >= 0) {
      currentTags.splice(index, 1);
    } else {
      currentTags.push(tag);
    }

    updateFilters({ tags: currentTags });
  };

  const handleNutritionalFilterChange = (
    filterName: "maxCalories" | "maxCarbs" | "minProtein" | "maxFat",
    value: string
  ) => {
    const numValue = value ? parseInt(value, 10) : null;
    updateFilters({ [filterName]: numValue });
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={filters.searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full px-4 py-2 pr-10 text-gray-700 bg-white border ${
            isFocused
              ? "border-green-500 ring-2 ring-green-200"
              : "border-gray-300"
          } rounded-lg focus:outline-none transition-all duration-200`}
        />
        <button
          type="submit"
          className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </button>
      </form>

      {/* Historial de búsqueda */}
      {showHistory && isHistoryVisible && searchHistory.length > 0 && (
        <div
          ref={historyRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
        >
          <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
            <span className="text-xs text-gray-500">Búsquedas recientes</span>
            <button
              onClick={() => clearSearchHistory()}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Borrar historial
            </button>
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {searchHistory.map((term, index) => (
              <li key={index}>
                <button
                  onClick={() => handleHistoryItemClick(term)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-gray-700">{term}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="search-bar-container">
        <div className="search-input-container">
          {showTypeSelector && (
            <select
              className="search-type-selector"
              value={searchState.activeSearchType}
              onChange={handleTypeChange}
            >
              <option value="recipes">Recetas</option>
              <option value="supplements">Suplementos</option>
              <option value="all">Todos</option>
            </select>
          )}

          {showFilters && (
            <button
              className="filter-toggle-btn"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              Filtros {isFilterOpen ? "▲" : "▼"}
            </button>
          )}

          <div className="results-count">{resultsCount} resultados</div>
        </div>

        {showFilters && isFilterOpen && (
          <div className="filters-container">
            <div className="filter-section">
              <h4>Tipo de receta</h4>
              <div className="filter-options">
                {availableTypes.map((type) => (
                  <label key={type} className="filter-option">
                    <input
                      type="checkbox"
                      checked={searchState.filters.type.includes(type)}
                      onChange={() => handleTypeFilterChange(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Etiquetas</h4>
              <div className="filter-options">
                {availableTags.map((tag) => (
                  <label key={tag} className="filter-option">
                    <input
                      type="checkbox"
                      checked={searchState.filters.tags.includes(tag)}
                      onChange={() => handleTagFilterChange(tag)}
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Información nutricional</h4>
              <div className="nutritional-filters">
                <div className="nutritional-filter">
                  <label>Máx. calorías:</label>
                  <input
                    type="number"
                    min="0"
                    value={searchState.filters.maxCalories || ""}
                    onChange={(e) =>
                      handleNutritionalFilterChange(
                        "maxCalories",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="nutritional-filter">
                  <label>Máx. carbohidratos:</label>
                  <input
                    type="number"
                    min="0"
                    value={searchState.filters.maxCarbs || ""}
                    onChange={(e) =>
                      handleNutritionalFilterChange("maxCarbs", e.target.value)
                    }
                  />
                </div>

                <div className="nutritional-filter">
                  <label>Mín. proteínas:</label>
                  <input
                    type="number"
                    min="0"
                    value={searchState.filters.minProtein || ""}
                    onChange={(e) =>
                      handleNutritionalFilterChange(
                        "minProtein",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="nutritional-filter">
                  <label>Máx. grasas:</label>
                  <input
                    type="number"
                    min="0"
                    value={searchState.filters.maxFat || ""}
                    onChange={(e) =>
                      handleNutritionalFilterChange("maxFat", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <button className="clear-filters-btn" onClick={handleClearFilters}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
