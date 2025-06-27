import { map, computed } from "nanostores";
import { allSupplements as initialSupplements } from "../data/supplements";
import type { Supplement } from "../types";

// Estado inicial para los suplementos
interface SupplementsState {
  supplements: Supplement[];
  loading: boolean;
  error: string | null;
}

// Inicializar el store con los suplementos del archivo de datos
export const $supplementsState = map<SupplementsState>({
  supplements: initialSupplements,
  loading: false,
  error: null,
});

// Store computada que expone directamente la lista de suplementos
export const $supplements = computed(
  $supplementsState,
  (state) => state.supplements
);

// Store computada para obtener suplementos por tipo
export const $supplementsByType = computed($supplements, (supplements) => {
  const byType: Record<string, Supplement[]> = {};

  supplements.forEach((supplement) => {
    const type = supplement.type || "general";
    if (!byType[type]) {
      byType[type] = [];
    }
    byType[type].push(supplement);
  });

  return byType;
});

// Store computada para obtener suplementos por etiqueta
export const $supplementsByTag = computed($supplements, (supplements) => {
  const byTag: Record<string, Supplement[]> = {};

  supplements.forEach((supplement) => {
    if (supplement.tags) {
      supplement.tags.forEach((tag) => {
        if (!byTag[tag]) {
          byTag[tag] = [];
        }
        byTag[tag].push(supplement);
      });
    }
  });

  return byTag;
});

/**
 * Añade un nuevo suplemento
 * @param supplement - El suplemento a añadir
 */
export function addSupplement(supplement: Supplement) {
  const currentSupplements = $supplementsState.get().supplements;
  $supplementsState.setKey("supplements", [...currentSupplements, supplement]);
}

/**
 * Actualiza un suplemento existente
 * @param id - El ID del suplemento a actualizar
 * @param updatedData - Los datos actualizados
 */
export function updateSupplement(id: string, updatedData: Partial<Supplement>) {
  const currentSupplements = $supplementsState.get().supplements;
  const updatedSupplements = currentSupplements.map((supplement) =>
    supplement.id === id ? { ...supplement, ...updatedData } : supplement
  );

  $supplementsState.setKey("supplements", updatedSupplements);
}

/**
 * Elimina un suplemento
 * @param id - El ID del suplemento a eliminar
 */
export function deleteSupplement(id: string) {
  const currentSupplements = $supplementsState.get().supplements;
  const filteredSupplements = currentSupplements.filter(
    (supplement) => supplement.id !== id
  );

  $supplementsState.setKey("supplements", filteredSupplements);
}

/**
 * Busca un suplemento por su ID
 * @param id - El ID del suplemento a buscar
 */
export function findSupplementById(id: string): Supplement | undefined {
  return $supplements.get().find((supplement) => supplement.id === id);
}

/**
 * Obtiene todos los tipos de suplementos disponibles
 */
export function getAllSupplementTypes(): string[] {
  const types = new Set<string>();

  $supplements.get().forEach((supplement) => {
    const type = supplement.type || "general";
    types.add(type);
  });

  return Array.from(types);
}

/**
 * Obtiene todas las etiquetas de suplementos disponibles
 */
export function getAllSupplementTags(): string[] {
  const tags = new Set<string>();

  $supplements.get().forEach((supplement) => {
    if (supplement.tags) {
      supplement.tags.forEach((tag) => tags.add(tag));
    }
  });

  return Array.from(tags);
}
