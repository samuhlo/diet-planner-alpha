import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "preact/hooks";
import type { BaseItem, Recipe } from "../../types";
import { openModal, openRecipeDetailModal } from "../../stores/modalStore";
import type { ModalType } from "../../stores/modalStore";

// Interfaz para configurar la apariencia y comportamiento del selector
export interface SelectorConfig {
  colorScheme: {
    selectedBgColor: string;
    selectedTextColor: string;
    selectedBorderColor: string;
    hoverBgColor: string;
    activeButtonColor: string;
    activeTextColor: string;
  };
  itemProperties: {
    showCalories?: boolean;
    showProtein?: boolean;
    showCarbs?: boolean;
    showFat?: boolean;
    showDescription?: boolean;
    showTags?: boolean;
  };
  modalType?: ModalType;
  placeholderText: string;
  title: string;
  maxItems?: number; // Número máximo de elementos que se pueden seleccionar
  hideQuantitySelector?: boolean; // Ocultar el selector de cantidad
}

// Interfaces para unificar los datos
interface GenericSelectorItemConfig<T> {
  getId: (item: T) => string;
  getName: (item: T) => string;
  getCalories: (item: T) => number;
  getProtein?: (item: T) => number;
  getCarbs?: (item: T) => number;
  getFats?: (item: T) => number;
  getDescription?: (item: T) => string;
  getTags?: (item: T) => string[];
}

// Interfaces para elementos seleccionados
export interface SelectedItem {
  id: string;
  quantity: number;
}

export interface GenericSelectorProps<T extends Record<string, any>> {
  dayId: string;
  allItems: T[];
  selectedItems?: SelectedItem[];
  onItemsChange: (items: SelectedItem[]) => void;
  itemConfig: GenericSelectorItemConfig<T>;
  selectorConfig: SelectorConfig;
  enableMultiple?: boolean;
  onEnableChange?: (enabled: boolean) => void;
  isEnabled?: boolean;
}

export default function GenericSelector<T extends Record<string, any>>({
  dayId,
  allItems,
  selectedItems = [],
  onItemsChange,
  itemConfig,
  selectorConfig,
  enableMultiple = false,
  onEnableChange,
  isEnabled = true,
}: GenericSelectorProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  }>({ key: "name", direction: "ascending" });
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const maxItems = selectorConfig.maxItems || 5;
  const canAddMore = selectedItems.length < maxItems;

  // Filtrar y ordenar elementos según búsqueda y criterios
  const filteredItems = useMemo(() => {
    // Aplicar filtro de búsqueda
    let filtered = allItems;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        const name = itemConfig.getName(item).toLowerCase();
        const tags = itemConfig.getTags
          ? itemConfig.getTags(item).map((tag) => tag.toLowerCase())
          : [];
        const description = itemConfig.getDescription
          ? itemConfig.getDescription(item).toLowerCase()
          : "";

        return (
          name.includes(searchLower) ||
          tags.some((tag) => tag.includes(searchLower)) ||
          description.includes(searchLower)
        );
      });
    }

    // Aplicar ordenamiento
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let aValue, bValue;

        // Determinar los valores a comparar según la key
        switch (sortConfig.key) {
          case "name":
            aValue = itemConfig.getName(a);
            bValue = itemConfig.getName(b);
            break;
          case "calories":
            aValue = itemConfig.getCalories(a);
            bValue = itemConfig.getCalories(b);
            break;
          case "protein":
            aValue = itemConfig.getProtein ? itemConfig.getProtein(a) : 0;
            bValue = itemConfig.getProtein ? itemConfig.getProtein(b) : 0;
            break;
          default:
            aValue = itemConfig.getName(a);
            bValue = itemConfig.getName(b);
        }

        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [allItems, searchTerm, sortConfig, itemConfig]);

  // Obtener los elementos seleccionados
  const selectedItemsWithData = useMemo(() => {
    return selectedItems
      .map((item) => {
        const itemData = allItems.find((i) => itemConfig.getId(i) === item.id);
        return {
          ...item,
          data: itemData,
        };
      })
      .filter((item) => item.data); // Filtrar elementos que no se encuentran en allItems
  }, [allItems, selectedItems, itemConfig]);

  // Manejar selección de elemento
  const handleItemSelect = useCallback(
    (itemId: string) => {
      // Añadimos un nuevo item
      const newItems = [...selectedItems, { id: itemId, quantity: 1 }];
      onItemsChange(newItems);
      setShowDropdown(false);
      setSearchTerm("");
    },
    [onItemsChange, selectedItems]
  );

  // Manejar cambio de cantidad
  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity > 0 && quantity <= 10) {
      const newItems = [...selectedItems];
      newItems[index] = {
        ...newItems[index],
        quantity,
      };
      onItemsChange(newItems);
    }
  };

  // Manejar eliminación de un elemento
  const handleRemoveItem = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    onItemsChange(newItems);
  };

  // Manejar la adición de un nuevo elemento
  const handleAddNew = () => {
    setSearchTerm("");
    setShowDropdown(true);
  };

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Manejar cambio en el input
  const handleInputChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    setSearchTerm(newValue);
    setShowDropdown(true);
  }, []);

  // Manejar foco en el input
  const handleInputFocus = useCallback(() => {
    setShowDropdown(true);
  }, []);

  // Manejar clics fuera del dropdown
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node) &&
      inputRef.current &&
      !inputRef.current.contains(e.target as Node)
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

  // Manejar cambio en el checkbox de habilitación
  const handleEnabledChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (onEnableChange) {
      onEnableChange(target.checked);
    }
  };

  // Abrir modal con detalles del elemento
  const handleOpenModal = (item: T) => {
    if (selectorConfig.modalType === "recipeDetail") {
      // Asegurarse de que el item se trata como una receta
      const recipeData = item as unknown as Recipe;
      openRecipeDetailModal(recipeData);
    } else if (selectorConfig.modalType) {
      openModal(selectorConfig.modalType, item as any);
    }
  };

  // Si está deshabilitado, mostrar solo el checkbox
  if (enableMultiple && !isEnabled) {
    return (
      <div class={`bg-white p-3 rounded-lg shadow-sm border border-gray-200`}>
        <div class="flex items-center justify-between mb-2">
          <label class="font-semibold text-gray-700 flex items-center">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={handleEnabledChange}
              class="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {selectorConfig.title}
          </label>
        </div>
      </div>
    );
  }

  return (
    <div
      class={
        enableMultiple
          ? `bg-white p-3 rounded-lg shadow-sm border border-gray-200`
          : ""
      }
    >
      {/* Encabezado con checkbox si es multiple */}
      {enableMultiple && (
        <div class="flex items-center justify-between mb-3">
          <label class="font-semibold text-gray-700 flex items-center">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={handleEnabledChange}
              class="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            {selectorConfig.title}
          </label>
        </div>
      )}

      {/* Lista de elementos seleccionados */}
      <div class="space-y-2 mb-3">
        {selectedItemsWithData.map((item, index) => (
          <div
            key={index}
            class={`p-2 ${selectorConfig.colorScheme.selectedBgColor} border ${selectorConfig.colorScheme.selectedBorderColor} rounded-md`}
          >
            <div class="flex justify-between items-start">
              <div
                class={`flex-1 ${
                  selectorConfig.modalType ? "cursor-pointer" : ""
                }`}
                onClick={() =>
                  item.data && selectorConfig.modalType
                    ? handleOpenModal(item.data)
                    : null
                }
              >
                <h4
                  class={`font-medium ${selectorConfig.colorScheme.selectedTextColor}`}
                >
                  {item.data
                    ? itemConfig.getName(item.data)
                    : "Elemento no encontrado"}
                </h4>
                {item.data && (
                  <div
                    class={`flex flex-wrap gap-x-2 gap-y-1 text-xs ${selectorConfig.colorScheme.selectedTextColor} mt-1 opacity-80`}
                  >
                    {selectorConfig.itemProperties.showDescription &&
                      itemConfig.getDescription && (
                        <span>{itemConfig.getDescription(item.data)}</span>
                      )}
                    {selectorConfig.itemProperties.showCalories && (
                      <span>{itemConfig.getCalories(item.data)} kcal</span>
                    )}
                    {selectorConfig.itemProperties.showProtein &&
                      itemConfig.getProtein && (
                        <span>
                          {itemConfig.getProtein(item.data).toFixed(0)}g P
                        </span>
                      )}
                    {selectorConfig.itemProperties.showCarbs &&
                      itemConfig.getCarbs && (
                        <span>
                          {itemConfig.getCarbs(item.data).toFixed(0)}g C
                        </span>
                      )}
                    {selectorConfig.itemProperties.showFat &&
                      itemConfig.getFats && (
                        <span>
                          {itemConfig.getFats(item.data).toFixed(0)}g F
                        </span>
                      )}
                  </div>
                )}
              </div>
              <div class="flex items-center gap-2">
                {/* Control de cantidad */}
                {!selectorConfig.hideQuantitySelector && (
                  <div class="flex items-center space-x-1">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          index,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      class={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${selectorConfig.colorScheme.selectedTextColor} border ${selectorConfig.colorScheme.selectedBorderColor}`}
                    >
                      -
                    </button>
                    <span
                      class={`w-8 text-center ${selectorConfig.colorScheme.selectedTextColor}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          index,
                          Math.min(10, item.quantity + 1)
                        )
                      }
                      class={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${selectorConfig.colorScheme.selectedTextColor} border ${selectorConfig.colorScheme.selectedBorderColor}`}
                    >
                      +
                    </button>
                  </div>
                )}
                {/* Botones de acción */}
                <div class="flex">
                  {/* Botón para cambiar cuando maxItems es 1 */}
                  {selectorConfig.maxItems === 1 && (
                    <button
                      onClick={handleAddNew}
                      class={`mr-1 ${selectorConfig.colorScheme.selectedTextColor} hover:opacity-80`}
                      title="Cambiar"
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
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                  )}
                  {/* Botón de eliminación */}
                  <button
                    onClick={() => handleRemoveItem(index)}
                    class={`ml-1 ${selectorConfig.colorScheme.selectedTextColor} hover:opacity-80`}
                    title="Quitar"
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
            </div>
          </div>
        ))}
      </div>

      {/* Botón para agregar nuevo elemento o campo de búsqueda */}
      {canAddMore &&
        (selectedItems.length === 0 || selectorConfig.maxItems !== 1) && (
          <div class="relative">
            {!showDropdown ? (
              <button
                onClick={handleAddNew}
                class={`w-full p-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center`}
              >
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Añadir {selectorConfig.title.toLowerCase().slice(0, -1)}
              </button>
            ) : (
              <div class="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={selectorConfig.placeholderText}
                  value={searchTerm}
                  onInput={handleInputChange}
                  onFocus={handleInputFocus}
                  class="w-full text-sm border border-gray-300 rounded-md p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                />
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

            {/* Dropdown de búsqueda */}
            {showDropdown && (
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
                          onClick={() => requestSort(option.key)}
                          class={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                            sortConfig.key === option.key
                              ? `${selectorConfig.colorScheme.activeButtonColor} ${selectorConfig.colorScheme.activeTextColor}`
                              : "bg-white text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {option.label}
                          {sortConfig.key === option.key && (
                            <svg
                              class={`h-3 w-3 transition-transform ${
                                sortConfig.direction === "descending"
                                  ? "rotate-180"
                                  : ""
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Lista de elementos */}
                {filteredItems.length > 0 ? (
                  <div>
                    {filteredItems.map((item) => (
                      <button
                        key={itemConfig.getId(item)}
                        onClick={() => handleItemSelect(itemConfig.getId(item))}
                        class="w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        <div class="flex justify-between items-center">
                          <div class="flex-1">
                            <p class="font-medium text-gray-800">
                              {itemConfig.getName(item)}
                            </p>
                            <div class="flex flex-wrap gap-x-2 text-xs text-gray-500">
                              {selectorConfig.itemProperties.showDescription &&
                                itemConfig.getDescription && (
                                  <p class="text-xs text-gray-500">
                                    {itemConfig.getDescription(item)}
                                  </p>
                                )}
                              {selectorConfig.itemProperties.showCalories && (
                                <span>{itemConfig.getCalories(item)} kcal</span>
                              )}
                              {selectorConfig.itemProperties.showProtein &&
                                itemConfig.getProtein && (
                                  <span>
                                    {itemConfig.getProtein(item)?.toFixed(0)}g P
                                  </span>
                                )}
                              {selectorConfig.itemProperties.showCarbs &&
                                itemConfig.getCarbs && (
                                  <span>
                                    {itemConfig.getCarbs(item)?.toFixed(0)}g C
                                  </span>
                                )}
                              {selectorConfig.itemProperties.showFat &&
                                itemConfig.getFats && (
                                  <span>
                                    {itemConfig.getFats(item)?.toFixed(0)}g F
                                  </span>
                                )}
                            </div>

                            {selectorConfig.itemProperties.showTags &&
                              itemConfig.getTags && (
                                <div class="text-xs text-gray-500 flex gap-2 mt-1">
                                  {itemConfig
                                    .getTags(item)
                                    .slice(0, 2)
                                    .map((tag) => (
                                      <span
                                        key={tag}
                                        class="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p class="px-3 py-4 text-center text-gray-500">
                    No se encontraron resultados.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
