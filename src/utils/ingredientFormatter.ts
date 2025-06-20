import type { Ingredient } from "../types";
import { getExtractedIngredientByName } from "../data/ingredients";
import type { Recipe } from "../types";

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

/**
 * Calcula el precio aproximado de un ingrediente según la cantidad y unidad.
 * Devuelve null si no se puede calcular.
 */
export function calculateIngredientPrice(
  ingrediente: Ingredient
): number | null {
  const extracted = getExtractedIngredientByName(ingrediente.n);
  if (
    !extracted ||
    !extracted.infoCompra ||
    !extracted.infoCompra.precioTotal ||
    !extracted.infoCompra.cantidadTotalEnUnidadBase
  ) {
    return null;
  }
  // Buscar equivalencia de la unidad usada a la unidad base
  const eq = extracted.equivalencias[ingrediente.u];
  if (!eq) return null;
  // Cantidad en unidad base
  const cantidadEnUnidadBase = ingrediente.q * eq;
  // Precio proporcional
  const precio =
    (cantidadEnUnidadBase / extracted.infoCompra.cantidadTotalEnUnidadBase) *
    extracted.infoCompra.precioTotal;
  return precio;
}

/**
 * Calcula el precio total de una receta y el desglose por ingrediente.
 * Devuelve { total, breakdown } donde breakdown es un array de precios por ingrediente (null si no se puede calcular).
 */
export function calculateRecipePrice(recipe: Recipe): {
  total: number;
  breakdown: (number | null)[];
} {
  let total = 0;
  const breakdown = recipe.ingredientes.map((ing) => {
    const price = calculateIngredientPrice(ing);
    if (price != null) total += price;
    return price;
  });
  return { total, breakdown };
}

/**
 * Formatea un precio en euros con un decimal y símbolo €
 */
export function formatEuro(price: number): string {
  return (
    price.toLocaleString("es-ES", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " €"
  );
}
