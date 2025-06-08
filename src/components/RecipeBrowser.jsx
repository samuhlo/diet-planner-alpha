import { useState, useMemo } from "preact/hooks";

export default function RecipeBrowser({ allMeals }) {
  const [activeTags, setActiveTags] = useState([]);

  const handleTagChange = (tag) => {
    setActiveTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const filteredMeals = useMemo(() => {
    if (activeTags.length === 0) {
      return allMeals; // Si no hay filtros, mostramos todo
    }
    // Devolvemos solo las recetas que incluyen TODAS las etiquetas activas
    return allMeals.filter((meal) =>
      activeTags.every((tag) => meal.tags.includes(tag))
    );
  }, [activeTags, allMeals]);

  const filterOptions = [
    { id: "filter-desayuno", tag: "desayuno", label: "Desayuno" },
    { id: "filter-almuerzo", tag: "almuerzo", label: "Almuerzo" },
    { id: "filter-cena", tag: "cena", label: "Cena" },
    { id: "filter-rapida", tag: "rápida", label: "Rápida" },
    { id: "filter-facil", tag: "fácil", label: "Fácil" },
    { id: "filter-elaborada", tag: "elaborada", label: "Elaborada" },
    { id: "filter-vegetariana", tag: "vegetariana", label: "Vegetariana" },
    { id: "filter-vegana", tag: "vegana", label: "Vegana" },
  ];
  return (
    <>
      {/* --- FILTROS --- */}
      <div
        id="recipe-filters"
        class="bg-white p-4 rounded-lg shadow-md mb-8 flex flex-wrap gap-x-6 gap-y-4 justify-center"
      >
        {filterOptions.map(({ id, tag, label }) => (
          <div key={id}>
            <input
              type="checkbox"
              id={id}
              class="filter-checkbox hidden"
              checked={activeTags.includes(tag)}
              onChange={() => handleTagChange(tag)}
            />
            <label
              htmlFor={id}
              class={`cursor-pointer border border-gray-300 rounded-full py-1 px-3 text-sm transition ${
                activeTags.includes(tag)
                  ? "bg-[#6B8A7A] text-white border-[#6B8A7A]"
                  : ""
              }`}
            >
              {label}
            </label>
          </div>
        ))}
      </div>

      {/* --- CUADRÍCULA DE RECETAS --- */}
      <div
        id="recipe-grid"
        class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredMeals.length > 0 ? (
          filteredMeals.map((receta) => (
            <div
              key={receta.nombre}
              class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
            >
              <div class="p-4 flex-grow">
                <h4 class="text-lg font-bold text-stone-800 mb-2">
                  {receta.nombre}
                </h4>
                <div class="mb-3 flex flex-wrap gap-1">
                  {receta.tags.map((tag) => (
                    <span
                      key={tag}
                      class="bg-gray-200 text-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p class="text-sm text-stone-600">
                  {receta.calorias} kcal | P: {receta.p}g C: {receta.c}g F:{" "}
                  {receta.f}g
                </p>
              </div>
            </div>
          ))
        ) : (
          <p class="text-stone-500 italic col-span-full text-center">
            No se han encontrado recetas con los filtros seleccionados.
          </p>
        )}
      </div>
    </>
  );
}
