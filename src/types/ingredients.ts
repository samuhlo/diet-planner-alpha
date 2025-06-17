// Tipos para la gestión de ingredientes

export interface ExtractedIngredient {
  id: string;
  nombre: string;
  categoria: string;
  unidadBase: string;
  precioPorUnidadBase: number;
  infoCompra: {
    precio: number;
    formato: string;
    cantidad: number;
    unidadCantidad: string;
  };
  equivalencias: Record<string, number>;
}
