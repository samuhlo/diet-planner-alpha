import React, { useState } from "react";
import { useStore } from "@nanostores/react";
import { $searchResults, getPaginatedResults } from "../../stores/searchStore";
import RecipeCard from "./RecipeCard";
import SupplementCard from "../supplements/SupplementCard";

interface SearchResultsProps {
  resultsPerPage?: number;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  resultsPerPage = 10,
}) => {
  const searchResults = useStore($searchResults);
  const [currentPage, setCurrentPage] = useState(1);

  // Obtener resultados paginados
  const paginatedResults = getPaginatedResults(currentPage, resultsPerPage);

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Si no hay resultados
  if (
    paginatedResults.recipes.length === 0 &&
    paginatedResults.supplements.length === 0
  ) {
    return (
      <div className="search-results-empty">
        <p>No se encontraron resultados para tu búsqueda.</p>
        <p>Intenta con otros términos o ajusta los filtros.</p>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      {/* Mostrar recetas */}
      {paginatedResults.recipes.length > 0 && (
        <div className="search-results-section">
          <h3>Recetas ({searchResults.recipes.length})</h3>
          <div className="search-results-grid">
            {paginatedResults.recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {/* Mostrar suplementos */}
      {paginatedResults.supplements.length > 0 && (
        <div className="search-results-section">
          <h3>Suplementos ({searchResults.supplements.length})</h3>
          <div className="search-results-grid">
            {paginatedResults.supplements.map((supplement) => (
              <SupplementCard key={supplement.id} supplement={supplement} />
            ))}
          </div>
        </div>
      )}

      {/* Paginación */}
      {paginatedResults.totalPages > 1 && (
        <div className="search-results-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="pagination-button"
          >
            &laquo; Anterior
          </button>

          <span className="pagination-info">
            Página {currentPage} de {paginatedResults.totalPages}
          </span>

          <button
            disabled={currentPage === paginatedResults.totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="pagination-button"
          >
            Siguiente &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
