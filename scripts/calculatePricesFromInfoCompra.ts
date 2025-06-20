import type { ExtractedIngredient } from "../src/types/ingredients";
import { extractedIngredients } from "../src/data/ingredients";

/**
 * Script para calcular precioPorUnidadBase automáticamente
 * basándose en infoCompra.precioTotal / infoCompra.cantidadTotalEnUnidadBase
 */

function calcularPreciosPorUnidadBase(
  ingredientes: ExtractedIngredient[]
): ExtractedIngredient[] {
  const ingredientesActualizados = ingredientes.map((ingrediente) => {
    const { precioTotal, cantidadTotalEnUnidadBase } = ingrediente.infoCompra;

    // Calcular precioPorUnidadBase si hay datos válidos
    if (precioTotal > 0 && cantidadTotalEnUnidadBase > 0) {
      const precioCalculado = precioTotal / cantidadTotalEnUnidadBase;
      console.log(
        `✅ ${
          ingrediente.nombre
        }: ${precioTotal}€ / ${cantidadTotalEnUnidadBase}${
          ingrediente.unidadBase
        } = ${precioCalculado.toFixed(4)}€/${ingrediente.unidadBase}`
      );

      return {
        ...ingrediente,
        precioPorUnidadBase: precioCalculado,
      };
    } else {
      console.log(
        `⚠️  ${ingrediente.nombre}: Sin datos de compra válidos (precio: ${precioTotal}€, cantidad: ${cantidadTotalEnUnidadBase}${ingrediente.unidadBase})`
      );
      return ingrediente;
    }
  });

  return ingredientesActualizados;
}

function generarArchivoActualizado(
  ingredientes: ExtractedIngredient[]
): string {
  const ingredientesOrdenados = ingredientes.sort((a, b) => {
    // Primero por categoría, luego por nombre
    if (a.categoria !== b.categoria) {
      return a.categoria.localeCompare(b.categoria);
    }
    return a.nombre.localeCompare(b.nombre);
  });

  const estadisticas = {
    total: ingredientes.length,
    conPrecio: ingredientes.filter((i) => i.precioPorUnidadBase > 0).length,
    sinPrecio: ingredientes.filter((i) => i.precioPorUnidadBase === 0).length,
    categorias: [...new Set(ingredientes.map((i) => i.categoria))].length,
  };

  let contenido = `// Ingredientes extraídos de recetas con precios calculados automáticamente
// Generado automáticamente - NO EDITAR MANUALMENTE
// Última actualización: ${new Date().toLocaleString("es-ES")}

import type { ExtractedIngredient } from '../types/ingredients';

export const extractedIngredients: ExtractedIngredient[] = ${JSON.stringify(
    ingredientesOrdenados,
    null,
    2
  )};

// Estadísticas:
// - Total de ingredientes: ${estadisticas.total}
// - Con precio calculado: ${estadisticas.conPrecio}
// - Sin precio: ${estadisticas.sinPrecio}
// - Categorías: ${estadisticas.categorias}

// Funciones auxiliares
export function buscarIngredientePorId(id: string): ExtractedIngredient | undefined {
  return extractedIngredients.find(ingrediente => ingrediente.id === id);
}

export function buscarIngredientePorNombre(nombre: string): ExtractedIngredient | undefined {
  return extractedIngredients.find(ingrediente => 
    ingrediente.nombre.toLowerCase().includes(nombre.toLowerCase())
  );
}

export function buscarIngredientesPorCategoria(categoria: string): ExtractedIngredient[] {
  return extractedIngredients.filter(ingrediente => 
    ingrediente.categoria.toLowerCase() === categoria.toLowerCase()
  );
}

export function obtenerCategorias(): string[] {
  return [...new Set(extractedIngredients.map(ingrediente => ingrediente.categoria))].sort();
}

export function obtenerIngredientesConPrecio(): ExtractedIngredient[] {
  return extractedIngredients.filter(ingrediente => ingrediente.precioPorUnidadBase > 0);
}

export function obtenerIngredientesSinPrecio(): ExtractedIngredient[] {
  return extractedIngredients.filter(ingrediente => ingrediente.precioPorUnidadBase === 0);
}
`;

  return contenido;
}

// Ejecutar el script
console.log("🔄 Calculando precios por unidad base...\n");

const ingredientesConPrecios =
  calcularPreciosPorUnidadBase(extractedIngredients);

console.log("\n📊 Resumen:");
const conPrecio = ingredientesConPrecios.filter(
  (i) => i.precioPorUnidadBase > 0
).length;
const sinPrecio = ingredientesConPrecios.filter(
  (i) => i.precioPorUnidadBase === 0
).length;
console.log(`- Ingredientes con precio calculado: ${conPrecio}`);
console.log(`- Ingredientes sin precio: ${sinPrecio}`);
console.log(`- Total: ${ingredientesConPrecios.length}`);

// Generar el archivo actualizado
const contenidoActualizado = generarArchivoActualizado(ingredientesConPrecios);

// Escribir el archivo
import { writeFileSync } from "fs";
import { join } from "path";

const rutaArchivo = join(
  process.cwd(),
  "src",
  "data",
  "extractedIngredients.ts"
);
writeFileSync(rutaArchivo, contenidoActualizado, "utf-8");

console.log(`\n✅ Archivo actualizado: ${rutaArchivo}`);
console.log(
  "💡 Ahora puedes editar manualmente infoCompra en el archivo y volver a ejecutar este script para recalcular los precios."
);
