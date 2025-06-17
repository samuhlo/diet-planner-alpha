import type { Ingredient } from "../types";

export interface FormattedIngredient {
  quantity: string;
  unit: string;
  isOptional: boolean;
  displayText: string;
}

/**
 * Capitaliza la primera letra de un texto
 */
function capitalizeFirstLetter(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Formatea un ingrediente para mostrar en la interfaz
 * Maneja casos especiales como ingredientes "al gusto"
 */
export function formatIngredient(ingrediente: Ingredient): FormattedIngredient {
  const capitalizedName = capitalizeFirstLetter(ingrediente.n);

  // Si la cantidad es 0 y la unidad es "al gusto", mostrar de forma especial
  if (ingrediente.q === 0 && ingrediente.u === "al gusto") {
    return {
      quantity: "Al gusto",
      unit: "",
      isOptional: true,
      displayText: capitalizedName,
    };
  }

  // Si la cantidad es 0 pero no es "al gusto", mostrar solo el nombre
  if (ingrediente.q === 0) {
    return {
      quantity: "",
      unit: "",
      isOptional: false,
      displayText: capitalizedName,
    };
  }

  // Caso normal
  return {
    quantity: Number(ingrediente.q.toPrecision(3)).toString(),
    unit: ingrediente.u,
    isOptional: false,
    displayText: `${capitalizedName} - ${Number(
      ingrediente.q.toPrecision(3)
    )} ${ingrediente.u}`,
  };
}

/**
 * Verifica si un ingrediente es opcional (cantidad 0 y unidad "al gusto")
 */
export function isOptionalIngredient(ingrediente: Ingredient): boolean {
  return ingrediente.q === 0 && ingrediente.u === "al gusto";
}
