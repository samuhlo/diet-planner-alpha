import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "preact/hooks";
import type { Supplement, SupplementPlan } from "../../types";
import { openModal } from "../../stores/modalStore";

interface SupplementSelectorProps {
  dayId: string;
  allSupplements: Supplement[];
  currentSupplementPlan?: SupplementPlan;
  onSupplementPlanChange: (supplementPlan: SupplementPlan) => void;
}

// Sub-componente para un único selector de suplemento con cantidad
function SingleSupplementSelector({
  allSupplements,
  selectedSupplement,
  onSupplementChange,
  onClear,
}: {
  allSupplements: Supplement[];
  selectedSupplement: { supplementId: string; quantity: number };
  onSupplementChange: (supplementId: string, quantity: number) => void;
  onClear: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSupplements = useMemo(() => {
    if (!allSupplements || !searchTerm.trim()) return allSupplements || [];
    return allSupplements.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSupplements, searchTerm]);

  const selectedSupplementData = useMemo(() => {
    if (!allSupplements) return null;
    return allSupplements.find((s) => s.id === selectedSupplement.supplementId);
  }, [allSupplements, selectedSupplement.supplementId]);

  const handleSelect = (supplementId: string) => {
    onSupplementChange(supplementId, selectedSupplement.quantity || 1);
    setShowDropdown(false);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (selectedSupplementData && newQuantity > 0 && newQuantity < 100) {
      onSupplementChange(selectedSupplementData.id, newQuantity);
    }
  };

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setShowDropdown(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  if (selectedSupplementData) {
    return (
      <div class="p-2 bg-blue-50 border border-blue-200 rounded-md">
        <div class="flex justify-between items-center">
          <div class="flex-1">
            <h4 class="font-medium text-blue-800">
              {selectedSupplementData.name}
            </h4>
            <span class="text-xs text-blue-600">
              {selectedSupplementData.description}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center ml-3">
              <input
                type="number"
                value={selectedSupplement.quantity}
                onInput={(e) =>
                  handleQuantityChange(parseInt(e.currentTarget.value, 10))
                }
                class="pl-1 w-10 text-center border bg-white text-sm"
                min="1"
              />
            </div>
            <button
              onClick={onClear}
              class="text-blue-600 hover:text-blue-800"
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
    );
  }

  return (
    <div class="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Buscar suplemento..."
        value={searchTerm}
        onInput={(e) => setSearchTerm(e.currentTarget.value)}
        onFocus={() => setShowDropdown(true)}
        class="w-full text-sm border border-gray-300 rounded-md p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showDropdown && (
        <div class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSupplements.length > 0 ? (
            filteredSupplements.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s.id)}
                class="w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                <p class="font-medium text-gray-800">{s.name}</p>
                <p class="text-xs text-gray-500">{s.description}</p>
              </button>
            ))
          ) : (
            <p class="px-3 py-4 text-center text-gray-500">
              No hay resultados.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Componente principal que gestiona múltiples suplementos
export default function SupplementSelector({
  dayId,
  allSupplements,
  currentSupplementPlan,
  onSupplementPlanChange,
}: SupplementSelectorProps) {
  const isEnabled = currentSupplementPlan?.enabled ?? false;
  const supplements = currentSupplementPlan?.supplements || [];

  const handleToggleEnable = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newPlan = {
      enabled: target.checked,
      supplements:
        target.checked && supplements.length === 0
          ? [{ supplementId: "", quantity: 1 }]
          : supplements,
    };
    onSupplementPlanChange(newPlan as SupplementPlan);
  };

  const handleSupplementChange = (
    index: number,
    supplementId: string,
    quantity: number
  ) => {
    const newSupplements = [...supplements];
    newSupplements[index] = { supplementId, quantity };
    onSupplementPlanChange({ enabled: isEnabled, supplements: newSupplements });
  };

  const handleAddSupplement = () => {
    if (supplements.length < 5) {
      const newSupplements = [
        ...supplements,
        { supplementId: "", quantity: 1 },
      ];
      onSupplementPlanChange({
        enabled: isEnabled,
        supplements: newSupplements,
      });
    }
  };

  const handleRemoveSupplement = (index: number) => {
    const newSupplements = supplements.filter((_, i) => i !== index);
    onSupplementPlanChange({ enabled: isEnabled, supplements: newSupplements });
  };

  return (
    <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <label class="font-semibold text-gray-700 flex items-center">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggleEnable}
            class="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Suplementos
        </label>
      </div>

      {isEnabled && (
        <div class="space-y-2">
          {supplements.map((s, index) => (
            <SingleSupplementSelector
              key={index}
              allSupplements={allSupplements}
              selectedSupplement={s}
              onSupplementChange={(supplementId, quantity) =>
                handleSupplementChange(index, supplementId, quantity)
              }
              onClear={() => handleRemoveSupplement(index)}
            />
          ))}
          {supplements.length < 5 && (
            <button
              onClick={handleAddSupplement}
              class="w-full mt-2 p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-semibold"
            >
              + Añadir Suplemento
            </button>
          )}
        </div>
      )}
    </div>
  );
}
