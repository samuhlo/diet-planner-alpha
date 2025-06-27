import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  setSearchQuery,
  updateFilters,
  clearFilters,
  setSearchType,
  $search,
  getTotalResultsCount,
} from "../../stores/searchStore";
import { getAllRecipeTags, getAllRecipeTypes } from "../../stores/recipesStore";
import { getAllSupplementTags } from "../../stores/supplementsStore";

interface SearchBarProps {
  placeholder?: string;
  showFilters?: boolean;
  showTypeSelector?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar...",
  showFilters = true,
  showTypeSelector = true,
}) => {
  const searchState = useStore($search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [resultsCount, setResultsCount] = useState(0);

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
    <div className="search-bar-container">
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchState.query}
          onChange={handleQueryChange}
        />

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
                    handleNutritionalFilterChange("maxCalories", e.target.value)
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
                    handleNutritionalFilterChange("minProtein", e.target.value)
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
  );
};

export default SearchBar;
