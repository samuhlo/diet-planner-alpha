// Tipos para la gestión de ingredientes

export interface ExtractedIngredient {
  id: string;
  nombre: string;
  categoria: string;
  unidadBase: string;
  precioPorUnidadBase: number; // Calculado automáticamente: precioTotal / cantidadTotalEnUnidadBase
  infoCompra: {
    precioTotal: number;
    formato: string;
    cantidadTotalEnUnidadBase: number;
  };
  equivalencias: Record<string, number>;
}
