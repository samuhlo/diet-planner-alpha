import { allMeals } from "../src/data/recipes";
import * as fs from "fs";
import * as path from "path";

interface RecipeIngredient {
  n: string; // nombre
  q: number; // cantidad
  u: string; // unidad
}

interface ExtractedIngredient {
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

// Función para normalizar nombres de ingredientes
function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Función para generar ID único
function generarId(nombre: string): string {
  return normalizarNombre(nombre)
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

// Función para determinar la categoría del ingrediente
function determinarCategoria(nombre: string): string {
  const nombreLower = nombre.toLowerCase();

  // Proteínas
  if (
    nombreLower.includes("huevo") ||
    nombreLower.includes("pollo") ||
    nombreLower.includes("atún") ||
    nombreLower.includes("salmón") ||
    nombreLower.includes("merluza") ||
    nombreLower.includes("caballa") ||
    nombreLower.includes("ternera") ||
    nombreLower.includes("cerdo") ||
    nombreLower.includes("pavo") ||
    nombreLower.includes("pescado") ||
    nombreLower.includes("marisco") ||
    nombreLower.includes("tofu") ||
    nombreLower.includes("seitan") ||
    nombreLower.includes("tempeh") ||
    nombreLower.includes("proteína") ||
    nombreLower.includes("proteina")
  ) {
    return "Proteínas";
  }

  // Lácteos
  if (
    nombreLower.includes("leche") ||
    nombreLower.includes("queso") ||
    nombreLower.includes("yogur") ||
    nombreLower.includes("yogurt") ||
    nombreLower.includes("mantequilla") ||
    nombreLower.includes("nata") ||
    nombreLower.includes("requesón") ||
    nombreLower.includes("requeson")
  ) {
    return "Lácteos";
  }

  // Verduras
  if (
    nombreLower.includes("tomate") ||
    nombreLower.includes("cebolla") ||
    nombreLower.includes("zanahoria") ||
    nombreLower.includes("pimiento") ||
    nombreLower.includes("pepino") ||
    nombreLower.includes("calabacín") ||
    nombreLower.includes("calabacin") ||
    nombreLower.includes("brócoli") ||
    nombreLower.includes("brocoli") ||
    nombreLower.includes("espinaca") ||
    nombreLower.includes("lechuga") ||
    nombreLower.includes("rúcula") ||
    nombreLower.includes("rucula") ||
    nombreLower.includes("berenjena") ||
    nombreLower.includes("calabaza") ||
    nombreLower.includes("apio") ||
    nombreLower.includes("puerro") ||
    nombreLower.includes("ajo") ||
    nombreLower.includes("perejil") ||
    nombreLower.includes("albahaca") ||
    nombreLower.includes("cilantro") ||
    nombreLower.includes("hierbabuena") ||
    nombreLower.includes("menta") ||
    nombreLower.includes("patata") ||
    nombreLower.includes("boniato") ||
    nombreLower.includes("remolacha") ||
    nombreLower.includes("judía") ||
    nombreLower.includes("judia") ||
    nombreLower.includes("guisante") ||
    nombreLower.includes("alcachofa") ||
    nombreLower.includes("acelga") ||
    nombreLower.includes("coliflor") ||
    nombreLower.includes("kale") ||
    nombreLower.includes("escarola") ||
    nombreLower.includes("endivia") ||
    nombreLower.includes("canónigo") ||
    nombreLower.includes("canonigo")
  ) {
    return "Verduras";
  }

  // Frutas
  if (
    nombreLower.includes("manzana") ||
    nombreLower.includes("naranja") ||
    nombreLower.includes("plátano") ||
    nombreLower.includes("platano") ||
    nombreLower.includes("fresa") ||
    nombreLower.includes("arándano") ||
    nombreLower.includes("arandano") ||
    nombreLower.includes("frambuesa") ||
    nombreLower.includes("mango") ||
    nombreLower.includes("piña") ||
    nombreLower.includes("piña") ||
    nombreLower.includes("melón") ||
    nombreLower.includes("melon") ||
    nombreLower.includes("sandía") ||
    nombreLower.includes("sandia") ||
    nombreLower.includes("melocotón") ||
    nombreLower.includes("melocoton") ||
    nombreLower.includes("nectarina") ||
    nombreLower.includes("aguacate") ||
    nombreLower.includes("granada") ||
    nombreLower.includes("limón") ||
    nombreLower.includes("limon") ||
    nombreLower.includes("lima")
  ) {
    return "Frutas";
  }

  // Cereales y Pan
  if (
    nombreLower.includes("arroz") ||
    nombreLower.includes("pasta") ||
    nombreLower.includes("pan") ||
    nombreLower.includes("quinoa") ||
    nombreLower.includes("cuscús") ||
    nombreLower.includes("couscous") ||
    nombreLower.includes("avena") ||
    nombreLower.includes("trigo") ||
    nombreLower.includes("harina") ||
    nombreLower.includes("levadura") ||
    nombreLower.includes("fideo") ||
    nombreLower.includes("espagueti")
  ) {
    return "Cereales y Pan";
  }

  // Legumbres
  if (
    nombreLower.includes("lenteja") ||
    nombreLower.includes("garbanzo") ||
    nombreLower.includes("alubia") ||
    nombreLower.includes("guisante") ||
    nombreLower.includes("haba") ||
    nombreLower.includes("soja") ||
    nombreLower.includes("soya")
  ) {
    return "Legumbres";
  }

  // Frutos Secos y Semillas
  if (
    nombreLower.includes("nuez") ||
    nombreLower.includes("almendra") ||
    nombreLower.includes("avellana") ||
    nombreLower.includes("pistacho") ||
    nombreLower.includes("anacardo") ||
    nombreLower.includes("cacahuete") ||
    nombreLower.includes("semilla") ||
    nombreLower.includes("sésamo") ||
    nombreLower.includes("sesamo") ||
    nombreLower.includes("chía") ||
    nombreLower.includes("chia") ||
    nombreLower.includes("calabaza") ||
    nombreLower.includes("girasol") ||
    nombreLower.includes("tahini")
  ) {
    return "Frutos Secos y Semillas";
  }

  // Condimentos y Salsas
  if (
    nombreLower.includes("sal") ||
    nombreLower.includes("pimienta") ||
    nombreLower.includes("orégano") ||
    nombreLower.includes("oregano") ||
    nombreLower.includes("albahaca") ||
    nombreLower.includes("perejil") ||
    nombreLower.includes("cilantro") ||
    nombreLower.includes("comino") ||
    nombreLower.includes("curry") ||
    nombreLower.includes("cúrcuma") ||
    nombreLower.includes("curcuma") ||
    nombreLower.includes("jengibre") ||
    nombreLower.includes("canela") ||
    nombreLower.includes("nuez moscada") ||
    nombreLower.includes("azafrán") ||
    nombreLower.includes("azafran") ||
    nombreLower.includes("mostaza") ||
    nombreLower.includes("vinagre") ||
    nombreLower.includes("salsa") ||
    nombreLower.includes("pesto") ||
    nombreLower.includes("aceite") ||
    nombreLower.includes("miel") ||
    nombreLower.includes("sirope") ||
    nombreLower.includes("mermelada")
  ) {
    return "Condimentos y Salsas";
  }

  // Bebidas
  if (
    nombreLower.includes("agua") ||
    nombreLower.includes("hielo") ||
    nombreLower.includes("caldo") ||
    nombreLower.includes("zumo") ||
    nombreLower.includes("jugo")
  ) {
    return "Bebidas";
  }

  // Otros
  return "Otros";
}

// Función para determinar la unidad base
function determinarUnidadBase(nombre: string, unidad: string): string {
  const nombreLower = nombre.toLowerCase();
  const unidadLower = unidad.toLowerCase();

  // Si la unidad ya es g o ml, usarla directamente
  if (unidadLower === "g" || unidadLower === "ml") {
    return unidadLower;
  }

  // Para ingredientes líquidos, usar ml
  if (
    nombreLower.includes("leche") ||
    nombreLower.includes("agua") ||
    nombreLower.includes("caldo") ||
    nombreLower.includes("zumo") ||
    nombreLower.includes("jugo") ||
    nombreLower.includes("aceite") ||
    nombreLower.includes("vinagre") ||
    nombreLower.includes("sirope") ||
    unidadLower.includes("ml") ||
    unidadLower.includes("l")
  ) {
    return "ml";
  }

  // Para el resto, usar g
  return "g";
}

// Función para crear equivalencias básicas
function crearEquivalenciasBasicas(
  unidad: string,
  unidadBase: string
): Record<string, number> {
  const equivalencias: Record<string, number> = {};

  // Mapeo de unidades comunes a gramos/ml
  const mapeoUnidades: Record<string, number> = {
    // Unidades de peso
    g: 1,
    kg: 1000,
    oz: 28.35,
    lb: 453.59,

    // Unidades de volumen
    ml: 1,
    l: 1000,
    taza: 240,
    cucharada: 15,
    cucharadita: 5,
    copa: 150,

    // Unidades específicas de alimentos
    unidad: 100, // Valor por defecto, se ajustará según el ingrediente
    loncha: 20,
    puñado: 30,
    rodaja: 15,
    diente: 5,
    cabeza: 100,
    bol: 200,
    lata: 400,
    bote: 400,
    paquete: 500,
    bandeja: 300,
    docena: 12,
    media: 0.5,
    cuarto: 0.25,
    mitad: 0.5,
    tercio: 0.33,
    pizca: 1,
    chorrito: 10,
    chorro: 15,
    gota: 0.1,
    poco: 5,
    bastante: 50,
    mucho: 100,
  };

  // Añadir la unidad específica si existe en el mapeo
  if (mapeoUnidades[unidad]) {
    equivalencias[unidad] = mapeoUnidades[unidad];
  }

  // Añadir equivalencia básica
  equivalencias[unidadBase] = 1;

  return equivalencias;
}

// Función para extraer ingredientes únicos de las recetas
function extraerIngredientesUnicos(): ExtractedIngredient[] {
  const ingredientesUnicos = new Map<string, Set<string>>();

  // Recorrer todas las recetas
  for (const receta of allMeals) {
    for (const ingrediente of receta.ingredientes) {
      const nombreNormalizado = normalizarNombre(ingrediente.n);

      if (!ingredientesUnicos.has(nombreNormalizado)) {
        ingredientesUnicos.set(nombreNormalizado, new Set());
      }

      ingredientesUnicos.get(nombreNormalizado)!.add(ingrediente.u);
    }
  }

  // Convertir a array de ingredientes estructurados
  const ingredientesEstructurados: ExtractedIngredient[] = [];

  for (const [nombreNormalizado, unidades] of ingredientesUnicos) {
    const nombreOriginal =
      Array.from(allMeals.flatMap((r) => r.ingredientes)).find(
        (i) => normalizarNombre(i.n) === nombreNormalizado
      )?.n || nombreNormalizado;

    const categoria = determinarCategoria(nombreOriginal);
    const unidadBase = determinarUnidadBase(
      nombreOriginal,
      Array.from(unidades)[0]
    );

    // Crear equivalencias combinando todas las unidades encontradas
    const equivalencias: Record<string, number> = {};
    for (const unidad of unidades) {
      Object.assign(
        equivalencias,
        crearEquivalenciasBasicas(unidad, unidadBase)
      );
    }

    const ingrediente: ExtractedIngredient = {
      id: generarId(nombreOriginal),
      nombre: nombreOriginal,
      categoria,
      unidadBase,
      precioPorUnidadBase: 0, // Se calculará después con precios de Mercadona
      infoCompra: {
        precio: 0,
        formato: "",
        cantidad: 0,
        unidadCantidad: "",
      },
      equivalencias,
    };

    ingredientesEstructurados.push(ingrediente);
  }

  // Ordenar por categoría y nombre
  return ingredientesEstructurados.sort((a, b) => {
    if (a.categoria !== b.categoria) {
      return a.categoria.localeCompare(b.categoria);
    }
    return a.nombre.localeCompare(b.nombre);
  });
}

// Función principal
async function main(): Promise<void> {
  console.log("🔍 Extrayendo ingredientes únicos de las recetas...");

  const ingredientes = extraerIngredientesUnicos();

  console.log(`✅ Extraídos ${ingredientes.length} ingredientes únicos`);

  // Mostrar estadísticas por categoría
  const estadisticas = new Map<string, number>();
  for (const ingrediente of ingredientes) {
    const categoria = ingrediente.categoria;
    estadisticas.set(categoria, (estadisticas.get(categoria) || 0) + 1);
  }

  console.log("\n📊 Estadísticas por categoría:");
  for (const [categoria, cantidad] of estadisticas) {
    console.log(`   ${categoria}: ${cantidad} ingredientes`);
  }

  // Generar archivo TypeScript
  const outputPath = path.join(
    process.cwd(),
    "src/data/extractedIngredients.ts"
  );

  let output = `import type { ExtractedIngredient } from "../types/ingredients";

// Ingredientes extraídos de las recetas
// Generado automáticamente desde recipes.ts
export const extractedIngredients: ExtractedIngredient[] = [
`;

  for (const ingrediente of ingredientes) {
    output += `  {
    id: "${ingrediente.id}",
    nombre: "${ingrediente.nombre}",
    categoria: "${ingrediente.categoria}",
    unidadBase: "${ingrediente.unidadBase}",
    precioPorUnidadBase: ${ingrediente.precioPorUnidadBase},
    infoCompra: {
      precio: ${ingrediente.infoCompra.precio},
      formato: "${ingrediente.infoCompra.formato}",
      cantidad: ${ingrediente.infoCompra.cantidad},
      unidadCantidad: "${ingrediente.infoCompra.unidadCantidad}"
    },
    equivalencias: {
${Object.entries(ingrediente.equivalencias)
  .map(([key, value]) => `      "${key}": ${value}`)
  .join(",\n")}
    }
  },\n`;
  }

  output += `];

// Estadísticas de extracción
export const extractionStats = {
  totalIngredientes: ${ingredientes.length},
  categorias: ${estadisticas.size},
  fechaExtraccion: new Date(),
};

// Función para obtener ingrediente por ID
export function getExtractedIngredientById(id: string): ExtractedIngredient | undefined {
  return extractedIngredients.find(ing => ing.id === id);
}

// Función para obtener ingrediente por nombre
export function getExtractedIngredientByName(nombre: string): ExtractedIngredient | undefined {
  const nombreNormalizado = normalizarNombre(nombre);
  return extractedIngredients.find(ing => normalizarNombre(ing.nombre) === nombreNormalizado);
}

// Función para obtener ingredientes por categoría
export function GETExtractedIngredientsByCategory(categoria: string): ExtractedIngredient[] {
  return extractedIngredients.filter(ing => ing.categoria === categoria);
}

// Función auxiliar para normalizar nombres
function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
`;

  fs.writeFileSync(outputPath, output);

  console.log(`\n📁 Archivo generado: ${outputPath}`);

  // Mostrar algunos ejemplos
  console.log("\n📋 Ejemplos de ingredientes extraídos:");
  const ejemplos = ingredientes.slice(0, 5);
  ejemplos.forEach((ing) => {
    console.log(`   ${ing.nombre} (${ing.categoria}) - ID: ${ing.id}`);
    console.log(`     Unidad base: ${ing.unidadBase}`);
    console.log(
      `     Equivalencias: ${Object.keys(ing.equivalencias).join(", ")}`
    );
  });

  // Mostrar ingredientes con múltiples unidades
  console.log("\n🔍 Ingredientes con múltiples unidades:");
  const multiUnidad = ingredientes.filter(
    (ing) => Object.keys(ing.equivalencias).length > 2
  );
  multiUnidad.slice(0, 5).forEach((ing) => {
    console.log(
      `   ${ing.nombre}: ${Object.keys(ing.equivalencias).join(", ")}`
    );
  });
}

// Ejecutar el script
main().catch(console.error);
