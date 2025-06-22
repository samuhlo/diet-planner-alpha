import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "preact/hooks";
import type { Snack, SnackPlan, Recipe } from "../../types";
import { openModal } from "../../stores/modalStore";
import { allMeals } from "../../data/recipes";

interface SnackSelectorProps {
  dayId: string;
  allSnacks: Snack[];
  currentSnackPlan?: SnackPlan;
  onSnackPlanChange: (snackPlan: SnackPlan) => void;
}

// Componente para un único selector de snack
function SingleSnackSelector({
  allSnacks,
  selectedSnackId,
  onSelect,
  onClear,
}: {
  allSnacks: Snack[];
  selectedSnackId?: string;
  onSelect: (snackId: string) => void;
  onClear: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: "nombre" | "calorias" | "p";
    direction: "ascending" | "descending";
  }>({ key: "nombre", direction: "ascending" });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sortedAndFilteredSnacks = useMemo(() => {
    let allSnacksCopy = [...allSnacks];

    if (sortConfig) {
      allSnacksCopy.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? 0;
        const bValue = b[sortConfig.key] ?? 0;

        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    if (!searchTerm.trim()) return allSnacksCopy;

    const searchLower = searchTerm.toLowerCase();
    return allSnacksCopy.filter(
      (s) =>
        s.nombre.toLowerCase().includes(searchLower) ||
        s.tags.some((t) => t.toLowerCase().includes(searchLower))
    );
  }, [allSnacks, searchTerm, sortConfig]);

  const requestSort = (key: "nombre" | "calorias" | "p") => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const selectedSnackData = useMemo(() => {
    return allSnacks.find((s) => s.id === selectedSnackId);
  }, [allSnacks, selectedSnackId]);

  const handleSelect = (snackId: string) => {
    onSelect(snackId);
    setShowDropdown(false);
  };

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

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleOpenModal = () => {
    if (selectedSnackData?.tipo === "elaborado") {
      const recipeData = allMeals.find(
        (meal) =>
          meal.nombre.toLowerCase().replace(/\s+/g, "-") ===
          selectedSnackData.id
      );
      if (recipeData) openModal("recipeDetail", recipeData);
    }
  };

  if (selectedSnackData) {
    return (
      <div
        class={`p-2 bg-green-50 border border-green-200 rounded-md transition ${
          selectedSnackData.tipo === "elaborado"
            ? "cursor-pointer hover:bg-green-100"
            : ""
        }`}
        onClick={handleOpenModal}
        title={selectedSnackData.tipo === "elaborado" ? "Ver detalles" : ""}
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h4 class="font-medium text-green-800">
              {selectedSnackData.nombre}
            </h4>
            <div class="flex flex-wrap gap-x-2 gap-y-1 text-xs text-green-600 mt-1">
              <span>{selectedSnackData.calorias} kcal</span>
              {selectedSnackData.p && (
                <span>{selectedSnackData.p.toFixed(0)}g P</span>
              )}
              {selectedSnackData.c && (
                <span>{selectedSnackData.c.toFixed(0)}g C</span>
              )}
              {selectedSnackData.f && (
                <span>{selectedSnackData.f.toFixed(0)}g F</span>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            class="ml-2 text-green-600 hover:text-green-800"
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
    );
  }

  return (
    <div class="relative">
      <div class="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar snack..."
          value={searchTerm}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          onFocus={() => setShowDropdown(true)}
          class="w-full text-sm border border-gray-300 rounded-md p-2 pr-8 focus:outline-none focus:ring-2 focus:ring-green-500"
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
      {showDropdown && (
        <div
          ref={dropdownRef}
          class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          <div class="p-2 border-b border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-600">Ordenar por:</span>
              <div class="flex gap-1">
                {[
                  { key: "nombre", label: "Nombre" },
                  { key: "calorias", label: "Calorías" },
                  { key: "p", label: "Proteína" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() =>
                      requestSort(option.key as "nombre" | "calorias" | "p")
                    }
                    class={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                      sortConfig.key === option.key
                        ? "bg-green-500 text-white"
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
          {sortedAndFilteredSnacks.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              class="w-full text-left px-3 py-2 hover:bg-gray-100"
            >
              <div class="flex justify-between items-center">
                <div class="flex-1">
                  <p class="font-medium text-gray-800">{s.nombre}</p>
                  <div class="flex gap-2 text-xs text-gray-500">
                    <span>{s.calorias} kcal</span>
                    <span>{s.p?.toFixed(0)} P</span>
                    <span>{s.c?.toFixed(0)} C</span>
                    <span>{s.f?.toFixed(0)} F</span>
                  </div>
                  <div class="text-xs text-gray-500 flex gap-2 mt-1">
                    {s.tags.slice(0, 2).map((tag) => (
                      <span class="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente principal que gestiona múltiples snacks
export default function SnackSelector({
  dayId,
  allSnacks,
  currentSnackPlan,
  onSnackPlanChange,
}: SnackSelectorProps) {
  const isEnabled = currentSnackPlan?.enabled ?? false;
  const snacks = currentSnackPlan?.snacks || [];

  const handleToggleEnable = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newPlan = {
      enabled: target.checked,
      snacks:
        target.checked && snacks.length === 0
          ? [{ snackId: "", quantity: 1 }]
          : snacks,
    };
    onSnackPlanChange(newPlan as SnackPlan);
  };

  const handleSnackChange = (index: number, snackId: string) => {
    const newSnacks = [...snacks];
    newSnacks[index] = { snackId, quantity: 1 };
    onSnackPlanChange({ enabled: isEnabled, snacks: newSnacks });
  };

  const handleAddSnack = () => {
    if (snacks.length < 4) {
      const newSnacks = [...snacks, { snackId: "", quantity: 1 }];
      onSnackPlanChange({ enabled: isEnabled, snacks: newSnacks });
    }
  };

  const handleRemoveSnack = (index: number) => {
    const newSnacks = snacks.filter((_, i) => i !== index);
    onSnackPlanChange({ enabled: isEnabled, snacks: newSnacks });
  };

  return (
    <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div class="flex items-center justify-between mb-2">
        <label class="font-semibold text-gray-700 flex items-center">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggleEnable}
            class="mr-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          Snacks
        </label>
      </div>

      {isEnabled && (
        <div class="space-y-2">
          {snacks.map((s, index) => (
            <SingleSnackSelector
              key={index}
              allSnacks={allSnacks}
              selectedSnackId={s.snackId}
              onSelect={(snackId) => handleSnackChange(index, snackId)}
              onClear={() => handleRemoveSnack(index)}
            />
          ))}
          {snacks.length < 4 && (
            <button
              onClick={handleAddSnack}
              class="w-full p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-semibold"
            >
              + Añadir Snack
            </button>
          )}
        </div>
      )}
    </div>
  );
}
