#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔄 Compilando datos TypeScript a JSON...");

try {
  // Compilar TypeScript si es necesario
  console.log("📦 Transpilando archivos TypeScript...");

  // Usar ts-node para ejecutar y extraer los datos
  const extractDataScript = `
    import { allMeals } from '../src/data/recipes.js';
    import { allSupplements } from '../src/data/supplements.js';
    import { allTips } from '../src/data/tips.js';
    
    const data = {
      allMeals,
      allSupplements,
      allTips
    };
    
    console.log(JSON.stringify(data, null, 2));
  `;

  // Escribir script temporal
  fs.writeFileSync("temp-extract.mjs", extractDataScript);

  try {
    // Ejecutar con Node.js ESM
    const result = execSync("node temp-extract.mjs", { encoding: "utf8" });

    // Parsear el resultado
    const data = JSON.parse(result);

    // Guardar datos compilados
    fs.writeFileSync(
      "scripts/compiled-data.json",
      JSON.stringify(data, null, 2)
    );

    console.log("✅ Datos compilados guardados en scripts/compiled-data.json");
    console.log(`📊 Estadísticas:`);
    console.log(`   🍽️  Recetas: ${data.allMeals.length}`);
    console.log(`   💊 Suplementos: ${data.allSupplements.length}`);
    console.log(`   💡 Tips: ${data.allTips.length}`);
  } catch (extractError) {
    console.error("❌ Error extrayendo datos:", extractError.message);

    // Fallback: crear datos básicos
    console.log("⚠️  Creando archivo de datos básico...");
    const fallbackData = {
      allMeals: [],
      allSupplements: [],
      allTips: [],
    };

    fs.writeFileSync(
      "scripts/compiled-data.json",
      JSON.stringify(fallbackData, null, 2)
    );
    console.log(
      "📝 Archivo de datos básico creado. Necesitarás compilar manualmente."
    );
  }
} catch (error) {
  console.error("❌ Error en compilación:", error.message);
} finally {
  // Limpiar archivo temporal
  if (fs.existsSync("temp-extract.mjs")) {
    fs.unlinkSync("temp-extract.mjs");
  }
}
