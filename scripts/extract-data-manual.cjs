#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔄 Extrayendo datos desde archivos TypeScript...");

try {
  // Leer archivos TypeScript directamente
  console.log("📦 Leyendo archivos de datos...");

  const recipesPath = path.join(__dirname, "../src/data/recipes.ts");
  const supplementsPath = path.join(__dirname, "../src/data/supplements.ts");
  const tipsPath = path.join(__dirname, "../src/data/tips.ts");

  if (!fs.existsSync(recipesPath)) {
    console.error("❌ No se encontró src/data/recipes.ts");
    process.exit(1);
  }

  // Función para extraer datos del archivo TypeScript
  function extractArrayFromFile(filePath, arrayName) {
    try {
      const content = fs.readFileSync(filePath, "utf8");

      // Buscar el patrón de exportación
      const exportPattern = new RegExp(
        `export const ${arrayName}.*?=\\s*\\[(.*?)\\];`,
        "s"
      );
      const match = content.match(exportPattern);

      if (!match) {
        console.warn(`⚠️  No se encontró ${arrayName} en ${filePath}`);
        return [];
      }

      // Extraer solo la parte del array
      const arrayContent = `[${match[1]}]`;

      // Intentar evaluar el contenido
      // NOTA: Esto es una simplificación y puede no funcionar con imports complejos
      try {
        // Crear contexto de evaluación básico
        const mockSources = {
          personal: { id: "personal", name: "Personal", type: "personal" },
          squat_fit: { id: "squat_fit", name: "Squat Fit", type: "book" },
        };

        // Preparar contexto para evaluación
        const contextCode = `
          const recipeSources = ${JSON.stringify(mockSources)};
          const result = ${arrayContent};
          result;
        `;

        // Para seguridad, usar eval solo si el contenido parece seguro
        if (
          !content.includes("require") &&
          !content.includes("import") &&
          !content.includes("fs.")
        ) {
          const result = eval(contextCode);
          return result;
        } else {
          console.warn(
            `⚠️  Archivo ${filePath} contiene imports complejos, usando parsing básico`
          );
          return [];
        }
      } catch (evalError) {
        console.warn(
          `⚠️  Error evaluando datos de ${filePath}:`,
          evalError.message
        );
        return [];
      }
    } catch (error) {
      console.error(`❌ Error leyendo ${filePath}:`, error.message);
      return [];
    }
  }

  // Extraer datos
  console.log("📊 Extrayendo arrays de datos...");

  const allMeals = extractArrayFromFile(recipesPath, "allMeals");
  const allSupplements = extractArrayFromFile(
    supplementsPath,
    "allSupplements"
  );
  const allTips = extractArrayFromFile(tipsPath, "allTips");

  // Si no se pudieron extraer datos reales, crear datos de muestra más realistas
  if (
    allMeals.length === 0 &&
    allSupplements.length === 0 &&
    allTips.length === 0
  ) {
    console.log(
      "⚠️  No se pudieron extraer datos reales, creando datos de muestra..."
    );

    const sampleData = {
      allMeals: [
        {
          nombre: "Huevos revueltos con espinacas",
          tipo: "Desayuno",
          tags: ["Fácil", "Rápida", "Proteína"],
          calorias: 250,
          p: 18,
          c: 3,
          f: 18,
          ingredientes: [
            { n: "huevo", q: 2, u: "unidad" },
            { n: "espinacas", q: 50, u: "gramos" },
            { n: "aceite de oliva", q: 1, u: "cucharadita" },
          ],
          preparacion:
            "Batir los huevos, añadir espinacas y cocinar en sartén con aceite.",
          source: { id: "personal", name: "Personal" },
        },
        {
          nombre: "Pechuga de pollo a la plancha",
          tipo: "Almuerzo",
          tags: ["Proteína", "Saludable"],
          calorias: 165,
          p: 31,
          c: 0,
          f: 3.6,
          ingredientes: [
            { n: "pechuga de pollo", q: 100, u: "gramos" },
            { n: "sal", q: 1, u: "pizca" },
            { n: "pimienta", q: 1, u: "pizca" },
          ],
          preparacion:
            "Sazonar la pechuga y cocinar en plancha hasta que esté bien cocida.",
          source: { id: "personal", name: "Personal" },
        },
      ],
      allSupplements: [
        {
          id: "whey-protein",
          name: "Proteína Whey",
          description: "Suplemento de proteína de suero de leche",
          type: "Proteína",
          categoria: "Proteína",
          tags: ["Músculo", "Recuperación"],
          calories: 120,
          protein: 25,
          carbs: 2,
          fat: 1,
          dosage: "1 scoop (30g)",
          timing: "Post-entreno",
          serving: "30g",
          benefits: ["Construcción muscular", "Recuperación", "Saciedad"],
        },
      ],
      allTips: [
        {
          id: "hidratacion-basica",
          title: "Importancia de la hidratación",
          content:
            "<p>Beber suficiente agua es fundamental para el buen funcionamiento del organismo. Se recomienda entre 2-3 litros diarios.</p>",
          tags: ["Hidratación", "Básicos"],
        },
      ],
    };

    fs.writeFileSync(
      path.join(__dirname, "compiled-data.json"),
      JSON.stringify(sampleData, null, 2)
    );

    console.log("✅ Datos de muestra creados en scripts/compiled-data.json");
    console.log("📊 Estadísticas:");
    console.log(`   🍽️  Recetas: ${sampleData.allMeals.length}`);
    console.log(`   💊 Suplementos: ${sampleData.allSupplements.length}`);
    console.log(`   💡 Tips: ${sampleData.allTips.length}`);
  } else {
    // Guardar datos extraídos
    const extractedData = {
      allMeals: allMeals || [],
      allSupplements: allSupplements || [],
      allTips: allTips || [],
    };

    fs.writeFileSync(
      path.join(__dirname, "compiled-data.json"),
      JSON.stringify(extractedData, null, 2)
    );

    console.log("✅ Datos extraídos guardados en scripts/compiled-data.json");
    console.log("📊 Estadísticas:");
    console.log(`   🍽️  Recetas: ${extractedData.allMeals.length}`);
    console.log(`   💊 Suplementos: ${extractedData.allSupplements.length}`);
    console.log(`   💡 Tips: ${extractedData.allTips.length}`);
  }

  console.log("\n💡 Ahora puedes ejecutar: node scripts/migrate-final.cjs");
} catch (error) {
  console.error("❌ Error en extracción:", error.message);
  process.exit(1);
}
