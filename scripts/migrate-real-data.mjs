#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { allMeals } from "../src/data/recipes.ts";
import { allSupplements } from "../src/data/supplements.ts";
import { allTips } from "../src/data/tips.ts";

const supabaseUrl = "https://uelqwczponhydoijzlbv.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY no está configurado");
  process.exit(1);
}

// Usar un usuario existente de la base de datos
const AUTHOR_USER_ID = "c8c02ecd-3aed-4ebd-908f-be6d625d36e3";

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🚀 Iniciando migración de datos reales...");
console.log(`📊 Datos disponibles:
   🍽️  Recetas: ${allMeals.length}
   💊 Suplementos: ${allSupplements.length}
   💡 Tips: ${allTips.length}`);

// Migrar recetas
async function migrateRecipes() {
  console.log("\n🍽️  === MIGRANDO RECETAS ===");
  let inserted = 0;
  let errors = 0;

  for (const recipe of allMeals) {
    try {
      const recipeData = {
        // id: recipe.id || generateId(recipe.nombre), // Dejar que PostgreSQL genere el UUID
        title: recipe.nombre,
        description: `Receta de ${recipe.nombre}`,
        meal_type: mapMealType(recipe.tipo),
        tags: recipe.tags || [],
        calories: recipe.calorias || 0,
        protein: recipe.p || 0,
        carbs: recipe.c || 0,
        fat: recipe.f || 0,
        servings: 1,
        prep_time: 15,
        cook_time: 10,
        difficulty: "Fácil",
        instructions: `Preparar ${recipe.nombre} según indicaciones`,
        source_id: mapSourceId(recipe.source?.id) || "personal",
        author_id: AUTHOR_USER_ID,
        is_public: true,
      };

      const { error } = await supabase.from("recipes").insert(recipeData);

      if (error) {
        console.error(`❌ Error con receta "${recipe.nombre}":`, error.message);
        errors++;
      } else {
        inserted++;
        if (inserted % 100 === 0) {
          console.log(`✅ ${inserted} recetas procesadas...`);
        }
      }
    } catch (e) {
      console.error(
        `❌ Error procesando receta "${recipe.nombre}":`,
        e.message
      );
      errors++;
    }
  }

  console.log(
    `✅ Recetas completadas: ${inserted} insertadas, ${errors} errores`
  );
  return inserted;
}

// Migrar suplementos
async function migrateSupplements() {
  console.log("\n💊 === MIGRANDO SUPLEMENTOS ===");
  let inserted = 0;
  let errors = 0;

  for (const supplement of allSupplements) {
    try {
      const supplementData = {
        id: supplement.id,
        name: supplement.name,
        description: supplement.description || "",
        type: supplement.type || "otros",
        category: mapSupplementCategory(supplement.type),
        tags: supplement.tags || [],
        calories:
          supplement.calories || supplement.nutritionalInfo?.calories || 0,
        protein: supplement.protein || supplement.nutritionalInfo?.protein || 0,
        carbs: supplement.carbs || supplement.nutritionalInfo?.carbs || 0,
        fat: supplement.fat || supplement.nutritionalInfo?.fat || 0,
        dosage: supplement.dosage || "",
        timing: supplement.timing || "",
        benefits: supplement.benefits || [],
        brand: supplement.brand || "",
        price: supplement.price || null,
        is_active: true,
      };

      const { error } = await supabase
        .from("supplements")
        .insert(supplementData);

      if (error) {
        console.error(
          `❌ Error con suplemento "${supplement.name}":`,
          error.message
        );
        errors++;
      } else {
        inserted++;
      }
    } catch (e) {
      console.error(
        `❌ Error procesando suplemento "${supplement.name}":`,
        e.message
      );
      errors++;
    }
  }

  console.log(
    `✅ Suplementos completados: ${inserted} insertados, ${errors} errores`
  );
  return inserted;
}

// Migrar tips
async function migrateTips() {
  console.log("\n💡 === MIGRANDO TIPS ===");
  let inserted = 0;
  let errors = 0;

  for (const tip of allTips) {
    try {
      const tipData = {
        id: tip.id,
        title: tip.title,
        content: tip.content,
        tags: tip.tags || [],
        category: "general",
        difficulty_level: "Principiante",
        time_to_read: 2,
        author_id: AUTHOR_USER_ID,
        is_active: true,
        views_count: 0,
        likes_count: 0,
      };

      const { error } = await supabase.from("tips").insert(tipData);

      if (error) {
        console.error(`❌ Error con tip "${tip.title}":`, error.message);
        errors++;
      } else {
        inserted++;
      }
    } catch (e) {
      console.error(`❌ Error procesando tip "${tip.title}":`, e.message);
      errors++;
    }
  }

  console.log(`✅ Tips completados: ${inserted} insertados, ${errors} errores`);
  return inserted;
}

// Funciones auxiliares
function generateId(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

function mapMealType(tipo) {
  const mapping = {
    Desayuno: "Desayuno",
    Comida: "Almuerzo",
    Cena: "Cena",
    Postre: "Postre",
    Snack: "Snack",
  };
  return mapping[tipo] || "Snack";
}

function mapSupplementCategory(type) {
  const mapping = {
    proteina: "proteínas",
    creatina: "rendimiento",
    vitamina: "vitaminas",
    mineral: "minerales",
    omega3: "salud general",
  };
  return mapping[type] || "otros";
}

function mapSourceId(sourceId) {
  const mapping = {
    squatFit: "squat_fit",
    personal: "personal",
    gobierno: "gobierno",
    internet: "internet",
    magazine: "magazine",
    other: "other",
  };
  return mapping[sourceId] || "personal";
}

// Función principal
async function main() {
  try {
    const startTime = Date.now();

    // Verificar conexión
    console.log("🔐 Verificando conexión a Supabase...");
    const { data, error } = await supabase
      .from("recipes")
      .select("count")
      .limit(1);
    if (error) {
      console.error("❌ Error de conexión:", error.message);
      process.exit(1);
    }
    console.log("✅ Conexión exitosa");

    // Ejecutar migraciones
    const recipesCount = await migrateRecipes();
    const supplementsCount = await migrateSupplements();
    const tipsCount = await migrateTips();

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const totalRecords = recipesCount + supplementsCount + tipsCount;

    console.log(`\n🎉 === MIGRACIÓN COMPLETADA ===`);
    console.log(`📊 Resultados:
   🍽️  Recetas: ${recipesCount}
   💊 Suplementos: ${supplementsCount}
   💡 Tips: ${tipsCount}
   🔢 Total de registros: ${totalRecords}
   ⏱️  Tiempo total: ${totalTime}s`);

    console.log("\n✅ ¡Migración completada exitosamente!");
    console.log(
      "💡 Tip: Ahora puedes usar estos datos desde tu aplicación frontend"
    );
  } catch (error) {
    console.error("❌ Error en migración:", error.message);
    process.exit(1);
  }
}

main();
