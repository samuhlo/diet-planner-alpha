import React, { useState, useEffect } from "preact/compat";
import { useStore } from "@nanostores/preact";
import {
  $modal,
  getModalData,
  closeModal,
  updateModalData,
} from "../../stores/modalStore";
import {
  $filteredRecipes,
  setSearchQuery,
  updateFilters,
} from "../../stores/searchStore";
import { updateMealPlan } from "../../stores/planStore";
import type { Recipe } from "../../types";

const MealPlannerModal: React.FC = () => {
  const modalState = useStore($modal);
  const plannerData = getModalData<"mealPlanner">();
  const filteredRecipes = useStore($filteredRecipes);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(
    plannerData?.currentRecipe || null
  );
  const [diners, setDiners] = useState(2);

  useEffect(() => {
    // Actualizar la búsqueda cuando cambie el término
    setSearchQuery(searchTerm);

    // Filtrar por el tipo de comida actual
    if (plannerData?.mealType) {
      updateFilters({ type: [plannerData.mealType] });
    }
  }, [searchTerm, plannerData?.mealType]);

  if (!plannerData) {
    return (
      <div className="error-message">
        No se encontró información para planificar
      </div>
    );
  }

  const { day, mealType } = plannerData;

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    updateModalData({ currentRecipe: recipe });
  };

  const handleSave = () => {
    if (selectedRecipe) {
      updateMealPlan(day, mealType, {
        recipeName: selectedRecipe.name,
        diners,
      });
      closeModal();
    }
  };

  const handleClear = () => {
    updateMealPlan(day, mealType, undefined);
    closeModal();
  };

  const handleDinersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setDiners(value);
    }
  };

  return (
    <div className="meal-planner-modal">
      <h2 className="modal-title">
        Planificar {mealType} - {day}
      </h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar recetas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="recipe-selection-container">
        <div className="recipe-list">
          <h3>Recetas disponibles</h3>
          {filteredRecipes.length === 0 ? (
            <p className="no-results">No se encontraron recetas</p>
          ) : (
            <ul className="recipes-list">
              {filteredRecipes.map((recipe) => (
                <li
                  key={recipe.id}
                  className={`recipe-item ${
                    selectedRecipe?.id === recipe.id ? "selected" : ""
                  }`}
                  onClick={() => handleRecipeSelect(recipe)}
                >
                  <div className="recipe-name">{recipe.name}</div>
                  <div className="recipe-macros">
                    <span>
                      {recipe.nutritionalInfo?.calories || recipe.calorias} kcal
                    </span>
                    <span>
                      {recipe.nutritionalInfo?.protein || recipe.p}g P
                    </span>
                    <span>{recipe.nutritionalInfo?.carbs || recipe.c}g C</span>
                    <span>{recipe.nutritionalInfo?.fat || recipe.f}g G</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="selected-recipe-details">
          <h3>Receta seleccionada</h3>
          {selectedRecipe ? (
            <div className="selected-recipe">
              <h4>{selectedRecipe.name}</h4>

              <div className="diners-control">
                <label htmlFor="diners">Comensales:</label>
                <input
                  type="number"
                  id="diners"
                  min="1"
                  value={diners}
                  onChange={handleDinersChange}
                />
              </div>

              <div className="recipe-nutritional-info">
                <div className="info-item">
                  <span className="info-label">Calorías:</span>
                  <span className="info-value">
                    {selectedRecipe.nutritionalInfo?.calories ||
                      selectedRecipe.calorias}{" "}
                    kcal
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Proteínas:</span>
                  <span className="info-value">
                    {selectedRecipe.nutritionalInfo?.protein ||
                      selectedRecipe.p}{" "}
                    g
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Carbohidratos:</span>
                  <span className="info-value">
                    {selectedRecipe.nutritionalInfo?.carbs || selectedRecipe.c}{" "}
                    g
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Grasas:</span>
                  <span className="info-value">
                    {selectedRecipe.nutritionalInfo?.fat || selectedRecipe.f} g
                  </span>
                </div>
              </div>

              {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                <div className="recipe-tags">
                  {selectedRecipe.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="no-selection">No hay receta seleccionada</p>
          )}
        </div>
      </div>

      <div className="modal-actions">
        <button className="clear-button" onClick={handleClear}>
          Eliminar comida
        </button>
        <button
          className="save-button"
          onClick={handleSave}
          disabled={!selectedRecipe}
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default MealPlannerModal;
