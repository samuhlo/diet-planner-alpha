import { useState, useEffect, useRef } from "preact/hooks";
import type { Snack, SnackPlan } from "../../types";
import { allSnacks } from "../../data/snacks";
import { NutritionService } from "../../services/nutritionService";

interface SnackSelectorProps {
  dayId: string;
  currentSnackPlan?: SnackPlan;
  onSnackPlanChange: (snackPlan: SnackPlan) => void;
}

export default function SnackSelector({
  dayId,
  currentSnackPlan,
  onSnackPlanChange,
}: SnackSelectorProps) {
  const [enabled, setEnabled] = useState(currentSnackPlan?.enabled || false);
  const [snackCount, setSnackCount] = useState(
    currentSnackPlan?.snacks.length || 1
  );
  const [selectedSnacks, setSelectedSnacks] = useState<
    Array<{ snackId: string; quantity: number }>
  >(currentSnackPlan?.snacks || [{ snackId: "", quantity: 1 }]);

  const isUserEditingRef = useRef(false);
  const lastUserActionRef = useRef<SnackPlan | null>(null);

  // Sincronizar estado local con props cuando cambien (solo si no está editando el usuario)
  useEffect(() => {
    if (!isUserEditingRef.current) {
      const newEnabled = currentSnackPlan?.enabled || false;
      const newSnackCount = currentSnackPlan?.snacks.length || 1;
      const newSelectedSnacks =
        currentSnackPlan?.snacks && currentSnackPlan.snacks.length > 0
          ? currentSnackPlan.snacks
          : [{ snackId: "", quantity: 1 }];

      setEnabled(newEnabled);
      setSnackCount(newSnackCount);
      setSelectedSnacks(newSelectedSnacks);
    }
  }, [currentSnackPlan]);

  // Manejar cambios en el checkbox principal
  const handleEnabledChange = (checked: boolean) => {
    isUserEditingRef.current = true;
    setEnabled(checked);
    if (!checked) {
      setSelectedSnacks([{ snackId: "", quantity: 1 }]);
      setSnackCount(1);
    }

    // Notificar cambio inmediatamente
    const snackPlan: SnackPlan = {
      enabled: checked,
      snacks: checked ? selectedSnacks.filter((s) => s.snackId) : [],
    };
    lastUserActionRef.current = snackPlan;
    onSnackPlanChange(snackPlan);

    // Resetear la bandera después de que el store se actualice
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 200);
  };

  // Manejar cambios en la cantidad de snacks
  const handleSnackCountChange = (count: number) => {
    isUserEditingRef.current = true;
    setSnackCount(count);
    let newSnacks;

    if (count > selectedSnacks.length) {
      // Añadir nuevos slots
      newSnacks = [...selectedSnacks];
      for (let i = selectedSnacks.length; i < count; i++) {
        newSnacks.push({ snackId: "", quantity: 1 });
      }
    } else {
      // Remover slots extra
      newSnacks = selectedSnacks.slice(0, count);
    }

    setSelectedSnacks(newSnacks);

    // Notificar cambio inmediatamente
    const snackPlan: SnackPlan = {
      enabled,
      snacks: enabled ? newSnacks.filter((s) => s.snackId) : [],
    };
    lastUserActionRef.current = snackPlan;
    onSnackPlanChange(snackPlan);

    // Resetear la bandera después de que el store se actualice
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 200);
  };

  // Manejar cambios en un snack específico
  const handleSnackChange = (index: number, snackId: string) => {
    isUserEditingRef.current = true;
    const newSnacks = [...selectedSnacks];
    newSnacks[index] = { ...newSnacks[index], snackId };
    setSelectedSnacks(newSnacks);

    // Notificar cambio inmediatamente
    const snackPlan: SnackPlan = {
      enabled,
      snacks: enabled ? newSnacks.filter((s) => s.snackId) : [],
    };
    lastUserActionRef.current = snackPlan;
    onSnackPlanChange(snackPlan);

    // Resetear la bandera después de que el store se actualice
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 200);
  };

  // Manejar cambios en la cantidad de un snack
  const handleQuantityChange = (index: number, quantity: number) => {
    isUserEditingRef.current = true;
    const newSnacks = [...selectedSnacks];
    newSnacks[index] = { ...newSnacks[index], quantity };
    setSelectedSnacks(newSnacks);

    // Notificar cambio inmediatamente
    const snackPlan: SnackPlan = {
      enabled,
      snacks: enabled ? newSnacks.filter((s) => s.snackId) : [],
    };
    lastUserActionRef.current = snackPlan;
    onSnackPlanChange(snackPlan);

    // Resetear la bandera después de que el store se actualice
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 200);
  };

  // Calcular totales nutricionales
  const calculateTotals = () => {
    if (!enabled) return { calories: 0, protein: 0, carbs: 0, fats: 0 };

    const snacksWithData = selectedSnacks
      .filter((s) => s.snackId)
      .map((s) => {
        const snack = allSnacks.find((sn) => sn.id === s.snackId);
        return snack ? { snack, quantity: s.quantity } : null;
      })
      .filter(Boolean);

    return NutritionService.calculateSnacksNutrition(
      snacksWithData as Array<{ snack: Snack; quantity: number }>
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
            id={`snacks-${dayId}`}
            checked={enabled}
            onChange={(e) => handleEnabledChange(e.currentTarget.checked)}
            class="h-4 w-4 text-green-600 rounded border-gray-300"
          />
          <label
            for={`snacks-${dayId}`}
            class="text-sm font-medium text-gray-700"
          >
            Snacks
          </label>
        </div>

        {enabled && (
          <div class="flex items-center space-x-2">
            <label for={`snack-count-${dayId}`} class="text-xs text-gray-600">
              Cantidad:
            </label>
            <select
              id={`snack-count-${dayId}`}
              value={snackCount}
              onChange={(e) =>
                handleSnackCountChange(Number(e.currentTarget.value))
              }
              class="text-xs border border-gray-300 rounded px-2 py-1"
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Contenido de snacks */}
      {enabled && (
        <div class="space-y-3">
          {Array.from({ length: snackCount }, (_, index) => (
            <div key={index} class="flex items-center space-x-2">
              <select
                value={selectedSnacks[index]?.snackId || ""}
                onChange={(e) =>
                  handleSnackChange(index, e.currentTarget.value)
                }
                class="flex-1 text-sm border border-gray-300 rounded px-2 py-1 w-full"
              >
                <option value="">Seleccionar snack...</option>
                <optgroup label="Snacks Simples">
                  {allSnacks
                    .filter((snack) => snack.tipo === "simple")
                    .map((snack) => (
                      <option key={snack.id} value={snack.id}>
                        {snack.nombre} ({snack.porcion})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Snacks Elaborados">
                  {allSnacks
                    .filter((snack) => snack.tipo === "elaborado")
                    .map((snack) => (
                      <option key={snack.id} value={snack.id}>
                        {snack.nombre} ({snack.porcion})
                      </option>
                    ))}
                </optgroup>
              </select>

              <input
                type="number"
                min="1"
                max="5"
                value={selectedSnacks[index]?.quantity || 1}
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
                Resumen Snacks:
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
