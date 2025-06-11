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
  const [enabled, setEnabled] = useState(
    (currentSupplementPlan?.shakes || 0) > 0
  );
  const [supplementCount, setSupplementCount] = useState(
    currentSupplementPlan?.shakes || 1
  );
  const [selectedSupplement, setSelectedSupplement] = useState<string>(
    currentSupplementPlan?.type || allSupplements[0]?.id || ""
  );

  // Memoizar la función de callback para evitar bucles infinitos
  const memoizedOnSupplementPlanChange = useCallback(
    onSupplementPlanChange,
    []
  );

  // Actualizar el plan cuando cambien los valores
  useEffect(() => {
    const supplementPlan: SupplementPlan = {
      type: selectedSupplement,
      shakes: enabled ? supplementCount : 0,
    };
    memoizedOnSupplementPlanChange(supplementPlan);
  }, [
    enabled,
    supplementCount,
    selectedSupplement,
    memoizedOnSupplementPlanChange,
  ]);

  // Manejar cambios en el checkbox principal
  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    if (!checked) {
      setSupplementCount(1);
    }
  };

  // Manejar cambios en la cantidad de suplementos
  const handleSupplementCountChange = (count: number) => {
    setSupplementCount(count);
  };

  // Manejar cambios en el tipo de suplemento
  const handleSupplementTypeChange = (supplementId: string) => {
    setSelectedSupplement(supplementId);
  };

  // Calcular totales nutricionales
  const calculateTotals = () => {
    if (!enabled || !selectedSupplement) return { calories: 0, protein: 0 };

    const supplementData = allSupplements.find(
      (s) => s.id === selectedSupplement
    );
    if (!supplementData) return { calories: 0, protein: 0 };

    return NutritionService.calculateSupplementNutrition(
      supplementData,
      supplementCount
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
            Suplementos Proteicos
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
          <div class="flex items-center space-x-2 ">
            <select
              value={selectedSupplement}
              onChange={(e) =>
                handleSupplementTypeChange(e.currentTarget.value)
              }
              class="flex-1 text-sm border border-gray-300 rounded px-2 py-1 w-full"
            >
              <option value="">Seleccionar suplemento...</option>
              {allSupplements.map((supplement) => (
                <option key={supplement.id} value={supplement.id}>
                  {supplement.name} ({supplement.calories} kcal,{" "}
                  {supplement.protein}g proteína)
                </option>
              ))}
            </select>
          </div>

          {/* Resumen nutricional */}
          {totals.calories > 0 && (
            <div class="mt-4 p-3 bg-white rounded border">
              <h4 class="text-sm font-medium text-gray-700 mb-2">
                Resumen Suplementos:
              </h4>
              <div class="grid grid-cols-2 gap-2 text-xs">
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
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
