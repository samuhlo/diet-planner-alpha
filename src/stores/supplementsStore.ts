import { map, computed } from "nanostores";
import { getAllSupplements } from "../services/dataAdapter";
import type { Supplement } from "../types/supplements";

// Definir la interfaz del estado
interface SupplementsState {
  items: Supplement[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
}

// Estado inicial
const initialState: SupplementsState = {
  items: [],
  isLoading: true,
  error: null,
  selectedCategory: null,
};

// Crear el store
export const $supplements = map<SupplementsState>(initialState);

// Función para cargar suplementos desde el adaptador
export async function loadSupplements() {
  $supplements.setKey("isLoading", true);
  $supplements.setKey("error", null);

  try {
    const supplements = await getAllSupplements();
    $supplements.setKey("items", supplements);
    $supplements.setKey("isLoading", false);
    console.log(`✅ ${supplements.length} suplementos cargados en store`);
  } catch (error) {
    $supplements.setKey("error", `Error cargando suplementos: ${error}`);
    $supplements.setKey("isLoading", false);
    console.error("Error cargando suplementos:", error);
  }
}

// Inicializar automáticamente
if (typeof window !== "undefined") {
  loadSupplements();
}

// Acciones
export function setSelectedCategory(category: string | null) {
  $supplements.setKey("selectedCategory", category);
}

export function addSupplement(supplement: Supplement) {
  const currentItems = $supplements.get().items;
  $supplements.setKey("items", [...currentItems, supplement]);
}

export function updateSupplement(id: string, updates: Partial<Supplement>) {
  const currentItems = $supplements.get().items;
  const updatedItems = currentItems.map((item) =>
    item.id === id ? { ...item, ...updates } : item
  );
  $supplements.setKey("items", updatedItems);
}

export function removeSupplement(id: string) {
  const currentItems = $supplements.get().items;
  const filteredItems = currentItems.filter((item) => item.id !== id);
  $supplements.setKey("items", filteredItems);
}

// Stores computados
export const $supplementsByCategory = computed($supplements, (state) => {
  const { items, selectedCategory } = state;

  if (!selectedCategory) {
    return items;
  }

  return items.filter(
    (item) =>
      item.type === selectedCategory || item.categoria === selectedCategory
  );
});

export const $supplementCategories = computed($supplements, (state) => {
  const categories = new Set<string>();

  state.items.forEach((item) => {
    if (item.type) categories.add(item.type);
    if (item.categoria) categories.add(item.categoria);
  });

  return Array.from(categories).sort();
});

export const $supplementsByTag = computed($supplements, (state) => {
  const tagMap: Record<string, Supplement[]> = {};

  state.items.forEach((supplement) => {
    if (supplement.tags && supplement.tags.length > 0) {
      supplement.tags.forEach((tag) => {
        if (!tagMap[tag]) {
          tagMap[tag] = [];
        }
        tagMap[tag].push(supplement);
      });
    }
  });

  return tagMap;
});

export const $supplementTags = computed($supplements, (state) => {
  const tags = new Set<string>();

  state.items.forEach((item) => {
    if (item.tags) {
      item.tags.forEach((tag) => tags.add(tag));
    }
  });

  return Array.from(tags).sort();
});

// Función para obtener un suplemento por ID
export function getSupplementById(id: string): Supplement | undefined {
  return $supplements.get().items.find((item) => item.id === id);
}

// Función para buscar suplementos por nombre
export function searchSupplementsByName(query: string): Supplement[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return $supplements.get().items;
  }

  return $supplements
    .get()
    .items.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        (item.nombre && item.nombre.toLowerCase().includes(normalizedQuery))
    );
}

// Función para filtrar suplementos por múltiples criterios
export function filterSupplements({
  categories = [],
  tags = [],
  minProteins = 0,
}: {
  categories?: string[];
  tags?: string[];
  minProteins?: number;
}): Supplement[] {
  let filtered = $supplements.get().items;

  // Filtrar por categorías
  if (categories.length > 0) {
    filtered = filtered.filter(
      (item) =>
        (item.type && categories.includes(item.type)) ||
        (item.categoria && categories.includes(item.categoria))
    );
  }

  // Filtrar por tags
  if (tags.length > 0) {
    filtered = filtered.filter(
      (item) => item.tags && tags.some((tag) => item.tags?.includes(tag))
    );
  }

  // Filtrar por proteínas mínimas
  if (minProteins > 0) {
    filtered = filtered.filter((item) => {
      const proteinValue =
        item.proteinas || item.protein || item.nutritionalInfo?.protein || 0;
      return proteinValue >= minProteins;
    });
  }

  return filtered;
}
