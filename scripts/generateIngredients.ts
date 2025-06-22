import { allMeals } from "../src/data/recipes";

interface IngredientCount {
  name: string;
  count: number;
  units: Set<string>;
}

// Función para generar IDs únicos
function generateId(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Función para normalizar nombres
function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Función para determinar la unidad principal
function determinarUnidadPrincipal(unidades: string[]): string {
  const prioridades = [
    "g",
    "ml",
    "unidad",
    "cucharada",
    "cucharadita",
    "al gusto",
  ];

  for (const prioridad of prioridades) {
    if (unidades.includes(prioridad)) {
      return prioridad;
    }
  }

  return unidades[0] || "g";
}

// Función para categorizar ingredientes
function categorizarIngrediente(nombre: string): string {
  const nombreLower = nombre.toLowerCase();

  // Proteínas
  if (
    nombreLower.includes("pollo") ||
    nombreLower.includes("pavo") ||
    nombreLower.includes("ternera") ||
    nombreLower.includes("cerdo") ||
    nombreLower.includes("huevo") ||
    nombreLower.includes("huevos") ||
    nombreLower.includes("atún") ||
    nombreLower.includes("salmón") ||
    nombreLower.includes("merluza") ||
    nombreLower.includes("pescado") ||
    nombreLower.includes("tofu") ||
    nombreLower.includes("garbanzo") ||
    nombreLower.includes("lenteja") ||
    nombreLower.includes("proteína") ||
    nombreLower.includes("caballa") ||
    nombreLower.includes("lubina") ||
    nombreLower.includes("langostino") ||
    nombreLower.includes("jamón")
  ) {
    return "Proteínas";
  }

  // Verduras
  if (
    nombreLower.includes("espinaca") ||
    nombreLower.includes("lechuga") ||
    nombreLower.includes("tomate") ||
    nombreLower.includes("cebolla") ||
    nombreLower.includes("zanahoria") ||
    nombreLower.includes("pimiento") ||
    nombreLower.includes("pepino") ||
    nombreLower.includes("calabacín") ||
    nombreLower.includes("brócoli") ||
    nombreLower.includes("coliflor") ||
    nombreLower.includes("puerro") ||
    nombreLower.includes("ajo") ||
    nombreLower.includes("seta") ||
    nombreLower.includes("champiñón") ||
    nombreLower.includes("rúcula") ||
    nombreLower.includes("kale") ||
    nombreLower.includes("judía") ||
    nombreLower.includes("nabo") ||
    nombreLower.includes("remolacha")
  ) {
    return "Verduras";
  }

  // Frutas
  if (
    nombreLower.includes("manzana") ||
    nombreLower.includes("plátano") ||
    nombreLower.includes("naranja") ||
    nombreLower.includes("fresa") ||
    nombreLower.includes("arándano") ||
    nombreLower.includes("mango") ||
    nombreLower.includes("piña") ||
    nombreLower.includes("melocotón") ||
    nombreLower.includes("nectarina") ||
    nombreLower.includes("sandía") ||
    nombreLower.includes("limón") ||
    nombreLower.includes("lima") ||
    nombreLower.includes("melón")
  ) {
    return "Frutas";
  }

  // Cereales
  if (
    nombreLower.includes("arroz") ||
    nombreLower.includes("pasta") ||
    nombreLower.includes("quinoa") ||
    nombreLower.includes("pan") ||
    nombreLower.includes("trigo") ||
    nombreLower.includes("avena") ||
    nombreLower.includes("cereal") ||
    nombreLower.includes("lenteja")
  ) {
    return "Cereales";
  }

  // Lácteos
  if (
    nombreLower.includes("leche") ||
    nombreLower.includes("yogur") ||
    nombreLower.includes("queso") ||
    nombreLower.includes("mantequilla") ||
    nombreLower.includes("nata") ||
    nombreLower.includes("crema") ||
    nombreLower.includes("requesón")
  ) {
    return "Lácteos";
  }

  // Grasas
  if (
    nombreLower.includes("aceite") ||
    nombreLower.includes("oliva") ||
    nombreLower.includes("nuez") ||
    nombreLower.includes("almendra") ||
    nombreLower.includes("pistacho") ||
    nombreLower.includes("semilla") ||
    nombreLower.includes("tahini")
  ) {
    return "Grasas";
  }

  // Condimentos
  if (
    nombreLower.includes("sal") ||
    nombreLower.includes("pimienta") ||
    nombreLower.includes("orégano") ||
    nombreLower.includes("albahaca") ||
    nombreLower.includes("curry") ||
    nombreLower.includes("mostaza") ||
    nombreLower.includes("vinagre") ||
    nombreLower.includes("salsa") ||
    nombreLower.includes("pimentón") ||
    nombreLower.includes("jengibre") ||
    nombreLower.includes("menta") ||
    nombreLower.includes("perejil")
  ) {
    return "Condimentos";
  }

  // Bebidas
  if (
    nombreLower.includes("agua") ||
    nombreLower.includes("zumo") ||
    nombreLower.includes("té") ||
    nombreLower.includes("café")
  ) {
    return "Bebidas";
  }

  // Snacks
  if (
    nombreLower.includes("galleta") ||
    nombreLower.includes("chocolate") ||
    nombreLower.includes("sirope") ||
    nombreLower.includes("mermelada") ||
    nombreLower.includes("miel")
  ) {
    return "Snacks";
  }

  return "Otros";
}

// Función para estimar precios basándose en la categoría y frecuencia
function estimarPrecio(
  nombre: string,
  categoria: string,
  count: number
): { precioPorUnidad: number; precioVenta: number } {
  const nombreLower = nombre.toLowerCase();

  // Precios base por categoría (por unidad principal)
  const preciosBase = {
    Proteínas: { base: 0.015, multiplicador: 1.2 },
    Verduras: { base: 0.008, multiplicador: 1.3 },
    Frutas: { base: 0.012, multiplicador: 1.4 },
    Cereales: { base: 0.01, multiplicador: 1.1 },
    Lácteos: { base: 0.015, multiplicador: 1.2 },
    Grasas: { base: 0.02, multiplicador: 1.3 },
    Condimentos: { base: 0.005, multiplicador: 1.5 },
    Bebidas: { base: 0.008, multiplicador: 1.2 },
    Snacks: { base: 0.025, multiplicador: 1.4 },
    Otros: { base: 0.01, multiplicador: 1.2 },
  };

  const config =
    preciosBase[categoria as keyof typeof preciosBase] || preciosBase.Otros;

  // Ajustes específicos por ingrediente
  let multiplicador = config.multiplicador;

  if (nombreLower.includes("huevo")) multiplicador = 0.8;
  if (nombreLower.includes("sal")) multiplicador = 0.1;
  if (nombreLower.includes("pimienta")) multiplicador = 0.2;
  if (nombreLower.includes("aceite")) multiplicador = 1.0;
  if (nombreLower.includes("atún")) multiplicador = 1.5;
  if (nombreLower.includes("salmón")) multiplicador = 2.0;
  if (nombreLower.includes("arándano")) multiplicador = 2.5;

  const precioPorUnidad = config.base * multiplicador;
  const precioVenta = precioPorUnidad * 1.25; // 25% de margen

  return { precioPorUnidad, precioVenta };
}

// Función para estimar stock mínimo
function estimarStockMinimo(categoria: string, count: number): number {
  const stockBase = {
    Proteínas: 500,
    Verduras: 200,
    Frutas: 300,
    Cereales: 1000,
    Lácteos: 500,
    Grasas: 300,
    Condimentos: 100,
    Bebidas: 1000,
    Snacks: 200,
    Otros: 300,
  };

  const base = stockBase[categoria as keyof typeof stockBase] || 300;
  return Math.max(base, count * 10);
}

function generateIngredientsFromRecipes(): void {
  const ingredientMap = new Map<string, IngredientCount>();

  // Extraer ingredientes de las recetas
  allMeals.forEach((recipe) => {
    recipe.ingredientes.forEach((ingredient) => {
      const name = ingredient.n.toLowerCase().trim();

      if (ingredientMap.has(name)) {
        const existing = ingredientMap.get(name)!;
        existing.count++;
        existing.units.add(ingredient.u);
      } else {
        ingredientMap.set(name, {
          name: ingredient.n,
          count: 1,
          units: new Set([ingredient.u]),
        });
      }
    });
  });

  // Convertir a array y ordenar por frecuencia
  const ingredients = Array.from(ingredientMap.values()).sort(
    (a, b) => b.count - a.count
  );

  console.log("// Ingredientes generados automáticamente desde las recetas");
  console.log("export const generatedIngredients = [");

  ingredients.forEach((ingredient, index) => {
    const categoria = categorizarIngrediente(ingredient.name);
    const unidadPrincipal = determinarUnidadPrincipal(
      Array.from(ingredient.units)
    );
    const unidadesAlternativas = Array.from(ingredient.units).filter(
      (u) => u !== unidadPrincipal
    );
    const precios = estimarPrecio(ingredient.name, categoria, ingredient.count);
    const stockMinimo = estimarStockMinimo(categoria, ingredient.count);

    console.log(`  {`);
    console.log(`    id: "${generateId(ingredient.name)}",`);
    console.log(`    nombre: "${ingredient.name}",`);
    console.log(
      `    nombreNormalizado: "${normalizarNombre(ingredient.name)}",`
    );
    console.log(`    categoria: "${categoria}",`);
    console.log(`    unidadPrincipal: "${unidadPrincipal}",`);
    console.log(
      `    unidadesAlternativas: [${unidadesAlternativas
        .map((u) => `"${u}"`)
        .join(", ")}],`
    );
    console.log(
      `    precioPorUnidadPrincipal: ${precios.precioPorUnidad.toFixed(3)},`
    );
    console.log(`    precioVenta: ${precios.precioVenta.toFixed(3)},`);
    console.log(`    stockMinimo: ${stockMinimo},`);
    console.log(`    activo: true,`);
    console.log(`    fechaCreacion: new Date(),`);
    console.log(`    fechaActualizacion: new Date(),`);
    console.log(`  },`);
  });

  console.log("];");

  // Estadísticas
  console.log("\n// Estadísticas de generación:");
  console.log(`// Total de ingredientes únicos: ${ingredients.length}`);

  const categorias = new Map<string, number>();
  ingredients.forEach((ing) => {
    const cat = categorizarIngrediente(ing.name);
    categorias.set(cat, (categorias.get(cat) || 0) + 1);
  });

  console.log("// Distribución por categorías:");
  Array.from(categorias.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`// ${cat}: ${count} ingredientes`);
    });
}

// Ejecutar el script
generateIngredientsFromRecipes();
