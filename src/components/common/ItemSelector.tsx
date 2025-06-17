import { useState, useEffect, useRef } from "preact/hooks";

interface BaseItem {
  id: string;
}

interface ItemPlan {
  enabled: boolean;
  items: Array<{ itemId: string; quantity: number }>;
}

interface ItemSelectorProps<T extends BaseItem> {
  dayId: string;
  title: string;
  allItems: T[];
  currentPlan?: ItemPlan;
  onPlanChange: (plan: ItemPlan) => void;
  calculateNutrition: (items: Array<{ item: T; quantity: number }>) => {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  maxItems?: number;
  getItemDisplayName: (item: T) => string;
  getItemCalories: (item: T) => number;
}

export default function ItemSelector<T extends BaseItem>({
  dayId,
  title,
  allItems,
  currentPlan,
  onPlanChange,
  calculateNutrition,
  maxItems = 4,
  getItemDisplayName,
  getItemCalories,
}: ItemSelectorProps<T>) {
  const [enabled, setEnabled] = useState(currentPlan?.enabled || false);
  const [itemCount, setItemCount] = useState(currentPlan?.items.length || 1);
  const [selectedItems, setSelectedItems] = useState<
    Array<{ itemId: string; quantity: number }>
  >(currentPlan?.items || [{ itemId: "", quantity: 1 }]);
  const [openDropdowns, setOpenDropdowns] = useState<Set<number>>(new Set());
  const [searchTerms, setSearchTerms] = useState<Record<number, string>>({});
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const isUserEditingRef = useRef(false);
  const dropdownRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const tooltipTimeoutRef = useRef<number | null>(null);

  // Sincronizar estado local con props cuando cambien (solo si no está editando el usuario)
  useEffect(() => {
    if (!isUserEditingRef.current) {
      const newEnabled = currentPlan?.enabled || false;
      const newItemCount = currentPlan?.items.length || 1;
      const newSelectedItems =
        currentPlan?.items && currentPlan.items.length > 0
          ? currentPlan.items
          : [{ itemId: "", quantity: 1 }];

      setEnabled(newEnabled);
      setItemCount(newItemCount);
      setSelectedItems(newSelectedItems);
    }
  }, [currentPlan]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const shouldClose = Array.from(openDropdowns).every(
        (index) => !dropdownRefs.current[index]?.contains(target)
      );

      if (shouldClose && openDropdowns.size > 0) {
        setOpenDropdowns(new Set());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdowns]);

  // Tooltip handlers
  const showTooltip = (text: string, event: MouseEvent) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    tooltipTimeoutRef.current = window.setTimeout(() => {
      setTooltip({
        text,
        x: event.clientX + 10,
        y: event.clientY - 30,
      });
    }, 100); // Aparece después de 100ms en lugar del delay nativo del navegador
  };

  const hideTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setTooltip(null);
  };

  // Cleanup tooltip on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Manejar cambios en el checkbox principal
  const handleEnabledChange = (checked: boolean) => {
    isUserEditingRef.current = true;
    setEnabled(checked);
    if (!checked) {
      setSelectedItems([{ itemId: "", quantity: 1 }]);
      setItemCount(1);
      setOpenDropdowns(new Set());
      setSearchTerms({});
    }

    // Notificar cambio inmediatamente
    const plan: ItemPlan = {
      enabled: checked,
      items: checked ? selectedItems.filter((s) => s.itemId) : [],
    };
    onPlanChange(plan);

    // Resetear la bandera después de que el store se actualice
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 200);
  };

  // Manejar cambios en la cantidad de items
  const handleItemCountChange = (count: number) => {
    isUserEditingRef.current = true;
    setItemCount(count);
    let newItems;

    if (count > selectedItems.length) {
      // Añadir nuevos slots
      newItems = [...selectedItems];
      for (let i = selectedItems.length; i < count; i++) {
        newItems.push({ itemId: "", quantity: 1 });
      }
    } else {
      // Remover slots extra
      newItems = selectedItems.slice(0, count);
    }

    setSelectedItems(newItems);

    // Notificar cambio inmediatamente
    const plan: ItemPlan = {
      enabled,
      items: enabled ? newItems.filter((s) => s.itemId) : [],
    };
    onPlanChange(plan);

    // Resetear la bandera después de que el store se actualice
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 200);
  };

  // Manejar cambios en un item específico
  const handleItemChange = (index: number, itemId: string) => {
    isUserEditingRef.current = true;
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], itemId };
    setSelectedItems(newItems);
    setOpenDropdowns(new Set());
    setSearchTerms({});

    // Notificar cambio inmediatamente
    const plan: ItemPlan = {
      enabled,
      items: enabled ? newItems.filter((s) => s.itemId) : [],
    };
    onPlanChange(plan);

    // Resetear la bandera después de que el store se actualice
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 200);
  };

  // Manejar cambios en la cantidad de un item
  const handleQuantityChange = (index: number, quantity: number) => {
    isUserEditingRef.current = true;
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], quantity };
    setSelectedItems(newItems);

    // Notificar cambio inmediatamente
    const plan: ItemPlan = {
      enabled,
      items: enabled ? newItems.filter((s) => s.itemId) : [],
    };
    onPlanChange(plan);

    // Resetear la bandera después de que el store se actualice
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 200);
  };

  // Toggle dropdown
  const toggleDropdown = (index: number) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(index)) {
      newOpenDropdowns.delete(index);
    } else {
      newOpenDropdowns.clear();
      newOpenDropdowns.add(index);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  // Filtrar items por término de búsqueda
  const getFilteredItems = (index: number) => {
    const searchTerm = searchTerms[index] || "";
    if (!searchTerm) return allItems;

    return allItems.filter((item) =>
      getItemDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Calcular totales nutricionales
  const calculateTotals = () => {
    if (!enabled) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

    const itemsWithData = selectedItems
      .filter((s) => s.itemId)
      .map((s) => {
        const item = allItems.find((i) => i.id === s.itemId);
        return item ? { item, quantity: s.quantity } : null;
      })
      .filter(Boolean);

    return calculateNutrition(
      itemsWithData as Array<{ item: T; quantity: number }>
    );
  };

  const totals = calculateTotals();

  return (
    <div class="flex flex-col gap-1 justify-between bg-gray-50 p-4 rounded-lg border">
      {/* Header con checkbox */}
      <div class="flex flex-col gap-1 justify-between mb-4">
        <div class="flex flex-row justify-between w-full gap-1 mb-1">
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`${title.toLowerCase()}-${dayId}`}
              checked={enabled}
              onChange={(e) => handleEnabledChange(e.currentTarget.checked)}
              class="h-4 w-4 text-green-600 rounded border-gray-300"
            />
            <label
              for={`${title.toLowerCase()}-${dayId}`}
              class="text-sm font-medium text-gray-700"
            >
              {title}
            </label>
          </div>
          {enabled && (
            <div class="flex items-center space-x-2">
              <label
                for={`${title.toLowerCase()}-count-${dayId}`}
                class="text-xs text-gray-600"
              >
                Cantidad:
              </label>
              <select
                id={`${title.toLowerCase()}-count-${dayId}`}
                value={itemCount}
                onChange={(e) =>
                  handleItemCountChange(Number(e.currentTarget.value))
                }
                class="text-xs border border-gray-300 rounded px-2 py-1"
              >
                {Array.from({ length: maxItems }, (_, i) => i + 1).map(
                  (num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  )
                )}
              </select>
            </div>
          )}
        </div>
        {/* Lista de items */}
        {enabled && (
          <div class="space-y-3">
            {selectedItems.slice(0, itemCount).map((item, index) => {
              const selectedItem = allItems.find((i) => i.id === item.itemId);
              const isDropdownOpen = openDropdowns.has(index);
              const filteredItems = getFilteredItems(index);

              return (
                <div key={index} class="flex gap-2 items-start min-w-0">
                  {/* Dropdown personalizado */}
                  <div
                    class="flex-1 relative min-w-0"
                    ref={(el) => (dropdownRefs.current[index] = el)}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDropdown(index)}
                      class="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm min-h-[40px] flex items-center min-w-0"
                    >
                      {selectedItem ? (
                        <div class="flex justify-between items-center w-full pr-6 min-w-0">
                          <span
                            class="truncate flex-1 text-left min-w-0 cursor-help"
                            onMouseEnter={(e) =>
                              showTooltip(getItemDisplayName(selectedItem), e)
                            }
                            onMouseLeave={hideTooltip}
                          >
                            {getItemDisplayName(selectedItem)}
                          </span>
                          <span class="text-gray-500 text-xs flex-shrink-0 ml-2">
                            {getItemCalories(selectedItem)} kcal
                          </span>
                        </div>
                      ) : (
                        <span
                          class="text-gray-500 w-full pr-6 truncate cursor-help"
                          onMouseEnter={(e) =>
                            showTooltip(`Seleccionar ${title.toLowerCase()}`, e)
                          }
                          onMouseLeave={hideTooltip}
                        >
                          Seleccionar {title.toLowerCase()}
                        </span>
                      )}
                      <svg
                        class={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {isDropdownOpen && (
                      <div class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden min-w-0">
                        {/* Search input */}
                        <div class="p-2 border-b border-gray-200">
                          <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerms[index] || ""}
                            onChange={(e) =>
                              setSearchTerms({
                                ...searchTerms,
                                [index]: e.currentTarget.value,
                              })
                            }
                            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>

                        {/* Items list */}
                        <div class="max-h-48 overflow-y-auto">
                          {filteredItems.length > 0 ? (
                            filteredItems.map((i) => (
                              <button
                                key={i.id}
                                type="button"
                                onClick={() => handleItemChange(index, i.id)}
                                class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0 flex items-center min-w-0"
                              >
                                <div class="flex justify-between items-center w-full min-w-0">
                                  <span
                                    class="truncate flex-1 text-left min-w-0 cursor-help"
                                    onMouseEnter={(e) =>
                                      showTooltip(getItemDisplayName(i), e)
                                    }
                                    onMouseLeave={hideTooltip}
                                  >
                                    {getItemDisplayName(i)}
                                  </span>
                                  <span class="text-gray-500 text-xs flex-shrink-0 ml-2">
                                    {getItemCalories(i)} kcal
                                  </span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div class="px-3 py-2 text-sm text-gray-500">
                              No se encontraron resultados
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantity selector */}
                  <div class="flex-shrink-0">
                    <select
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          index,
                          Number(e.currentTarget.value)
                        )
                      }
                      class="w-16 text-sm border border-gray-300 rounded px-2 py-2 bg-white"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumen nutricional */}
      {enabled && (
        <div class="mt-4 pt-3 border-t border-gray-200">
          <div class="text-xs text-gray-600 mb-2">Total nutricional:</div>
          <div class="grid grid-cols-4 gap-2 text-xs">
            <div class="text-center">
              <div class="font-medium">{Math.round(totals.calories)}</div>
              <div class="text-gray-500">kcal</div>
            </div>
            <div class="text-center">
              <div class="font-medium">{totals.protein.toFixed(1)}</div>
              <div class="text-gray-500">P</div>
            </div>
            <div class="text-center">
              <div class="font-medium">{totals.carbs.toFixed(1)}</div>
              <div class="text-gray-500">C</div>
            </div>
            <div class="text-center">
              <div class="font-medium">{totals.fats.toFixed(1)}</div>
              <div class="text-gray-500">F</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
