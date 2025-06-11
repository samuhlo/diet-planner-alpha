import { useState, useEffect, useCallback } from "preact/hooks";
import type { Supplement, SupplementPlan } from "../../types";
import { allSupplements } from "../../data/supplements";
import { NutritionService } from "../../services/nutritionService";

interface SupplementSelectorProps {
  dayId: string;
  currentSupplementPlan?: SupplementPlan;
  onSupplementPlanChange: (supplementPlan: SupplementPlan) => void;
}

export default function SupplementSelector({
  dayId,
  currentSupplementPlan,
  onSupplementPlanChange,
}: SupplementSelectorProps) {
  // Migrar estructura antigua a nueva si es necesario
  const migrateSupplementPlan = (oldPlan: any): SupplementPlan => {
    if (oldPlan && oldPlan.shakes && oldPlan.type) {
      // Estructura antigua: migrar a nueva
      return {
        enabled: oldPlan.shakes > 0,
        supplements:
          oldPlan.shakes > 0
            ? [{ supplementId: oldPlan.type, quantity: oldPlan.shakes }]
            : [],
      };
    }
    // Estructura nueva o sin datos
    if (oldPlan && oldPlan.enabled && Array.isArray(oldPlan.supplements)) {
      return oldPlan;
    }
    return { enabled: false, supplements: [] };
  };

  const migratedPlan = migrateSupplementPlan(currentSupplementPlan);

  const [enabled, setEnabled] = useState(migratedPlan.enabled);
  const [supplementCount, setSupplementCount] = useState(
    migratedPlan.supplements?.length || 1
  );
  const [selectedSupplements, setSelectedSupplements] = useState<
    Array<{ supplementId: string; quantity: number }>
  >(
    migratedPlan.supplements?.length > 0
      ? migratedPlan.supplements
      : [{ supplementId: "", quantity: 1 }]
  );

  // Memoizar la función de callback para evitar bucles infinitos
  const memoizedOnSupplementPlanChange = useCallback(
    onSupplementPlanChange,
    []
  );

  // Actualizar el plan cuando cambien los valores
  useEffect(() => {
    const supplementPlan: SupplementPlan = {
      enabled,
      supplements: enabled
        ? selectedSupplements.filter((s) => s.supplementId)
        : [],
    };
    memoizedOnSupplementPlanChange(supplementPlan);
  }, [enabled, selectedSupplements, memoizedOnSupplementPlanChange]);

  // Manejar cambios en el checkbox principal
  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    if (!checked) {
      setSelectedSupplements([{ supplementId: "", quantity: 1 }]);
      setSupplementCount(1);
    }
  };

  // Manejar cambios en la cantidad de suplementos
  const handleSupplementCountChange = (count: number) => {
    setSupplementCount(count);
    if (count > selectedSupplements.length) {
      // Añadir nuevos slots
      const newSupplements = [...selectedSupplements];
      for (let i = selectedSupplements.length; i < count; i++) {
        newSupplements.push({ supplementId: "", quantity: 1 });
      }
      setSelectedSupplements(newSupplements);
    } else {
      // Remover slots extra
      setSelectedSupplements(selectedSupplements.slice(0, count));
    }
  };

  // Manejar cambios en un suplemento específico
  const handleSupplementChange = (index: number, supplementId: string) => {
    const newSupplements = [...selectedSupplements];
    newSupplements[index] = { ...newSupplements[index], supplementId };
    setSelectedSupplements(newSupplements);
  };

  // Manejar cambios en la cantidad de un suplemento
  const handleQuantityChange = (index: number, quantity: number) => {
    const newSupplements = [...selectedSupplements];
    newSupplements[index] = { ...newSupplements[index], quantity };
    setSelectedSupplements(newSupplements);
  };

  // Calcular totales nutricionales
  const calculateTotals = () => {
    if (!enabled) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

    const supplementsWithData = selectedSupplements
      .filter((s) => s.supplementId)
      .map((s) => {
        const supplement = allSupplements.find(
          (sup) => sup.id === s.supplementId
        );
        return supplement ? { supplement, quantity: s.quantity } : null;
      })
      .filter(Boolean);

    return NutritionService.calculateSupplementsNutrition(
      supplementsWithData as Array<{ supplement: Supplement; quantity: number }>
    );
  };

  const totals = calculateTotals();

  return (
    <div class="bg-gray-50 p-4 rounded-lg border">
      {/* Header con checkbox */}
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`supplements-${dayId}`}
            checked={enabled}
            onChange={(e) => handleEnabledChange(e.currentTarget.checked)}
            class="h-4 w-4 text-green-600 rounded border-gray-300"
          />
          <label
            for={`supplements-${dayId}`}
            class="text-sm font-medium text-gray-700"
          >
            Suplementos
          </label>
        </div>

        {enabled && (
          <div class="flex items-center space-x-2">
            <label class="text-xs text-gray-600">Cantidad:</label>
            <select
              value={supplementCount}
              onChange={(e) =>
                handleSupplementCountChange(Number(e.currentTarget.value))
              }
              class="text-xs border border-gray-300 rounded px-2 py-1"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Contenido de suplementos */}
      {enabled && (
        <div class="space-y-3">
          {Array.from({ length: supplementCount }, (_, index) => (
            <div key={index} class="flex items-center space-x-2">
              <select
                value={selectedSupplements[index]?.supplementId || ""}
                onChange={(e) =>
                  handleSupplementChange(index, e.currentTarget.value)
                }
                class="flex-1 text-sm border border-gray-300 rounded px-2 py-1 w-full"
              >
                <option value="">Seleccionar suplemento...</option>
                {allSupplements.map((supplement) => (
                  <option key={supplement.id} value={supplement.id}>
                    {supplement.name} ({supplement.serving || "1 porción"})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                max="5"
                value={selectedSupplements[index]?.quantity || 1}
                onChange={(e) =>
                  handleQuantityChange(index, Number(e.currentTarget.value))
                }
                class="w-16 text-sm border border-gray-300 rounded px-2 py-1 text-center"
                placeholder="1"
              />
            </div>
          ))}

          {/* Resumen nutricional */}
          {totals.calories > 0 && (
            <div class="mt-4 p-3 bg-white rounded border">
              <h4 class="text-sm font-medium text-gray-700 mb-2">
                Resumen Suplementos:
              </h4>
              <div class="grid grid-cols-4 gap-2 text-xs">
                <div class="text-center">
                  <div class="font-medium text-gray-900">{totals.calories}</div>
                  <div class="text-gray-500">kcal</div>
                </div>
                <div class="text-center">
                  <div class="font-medium text-gray-900">
                    {totals.protein.toFixed(1)}
                  </div>
                  <div class="text-gray-500">Proteína</div>
                </div>
                <div class="text-center">
                  <div class="font-medium text-gray-900">
                    {totals.carbs.toFixed(1)}
                  </div>
                  <div class="text-gray-500">Carbos</div>
                </div>
                <div class="text-center">
                  <div class="font-medium text-gray-900">
                    {totals.fats.toFixed(1)}
                  </div>
                  <div class="text-gray-500">Grasas</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
