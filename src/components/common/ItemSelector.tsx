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

  const isUserEditingRef = useRef(false);

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

  // Manejar cambios en el checkbox principal
  const handleEnabledChange = (checked: boolean) => {
    isUserEditingRef.current = true;
    setEnabled(checked);
    if (!checked) {
      setSelectedItems([{ itemId: "", quantity: 1 }]);
      setItemCount(1);
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
            {selectedItems.slice(0, itemCount).map((item, index) => (
              <div key={index} class="flex gap-2 items-center">
                <select
                  value={item.itemId}
                  onChange={(e) =>
                    handleItemChange(index, e.currentTarget.value)
                  }
                  class="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">Seleccionar {title.toLowerCase()}</option>
                  {allItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      {getItemDisplayName(i)} ({getItemCalories(i)} kcal)
                    </option>
                  ))}
                </select>

                <select
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(index, Number(e.currentTarget.value))
                  }
                  class="w-16 text-sm border border-gray-300 rounded px-2 py-1"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            ))}
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
