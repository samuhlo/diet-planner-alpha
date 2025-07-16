#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { allMeals } from "../src/data/recipes.js";
import { allSupplements } from "../src/data/supplements.js";
import { allTips } from "../src/data/tips.js";

// Configuración de Supabase
const supabaseUrl =
  process.env.PUBLIC_SUPABASE_URL || "https://uelqwczponhydoijzlbv.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error(
    "❌ Error: Configura SUPABASE_SERVICE_ROLE_KEY en las variables de entorno"
  );
  console.log("💡 Tip: export SUPABASE_SERVICE_ROLE_KEY='tu-service-role-key'");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ID del usuario autor (cámbialo por el tuyo)
const AUTHOR_USER_ID =
  process.env.AUTHOR_USER_ID || "36c99997-9503-442e-ba81-e9e7ad9be777";

console.log("🚀 Iniciando migración de datos locales a Supabase...");
console.log(`👤 Usuario autor: ${AUTHOR_USER_ID}`);

// ========================================
// MIGRACIÓN DE RECETAS
// ========================================

async function migrateRecipes() {
  console.log("\n🍽️  === MIGRANDO RECETAS ===");
  console.log(`📦 Preparando ${allMeals.length} recetas...`);

  let insertedRecipes = 0;
  let skippedRecipes = 0;

  for (const recipe of allMeals) {
    try {
      // Determinar dificultad basada en tags
      let difficulty = null;
      if (recipe.tags?.includes("Fácil")) difficulty = "Fácil";
      else if (recipe.tags?.includes("Rápida")) difficulty = "Fácil";

      // Preparar datos de la receta
      const recipeData = {
        author_id: AUTHOR_USER_ID,
        title: recipe.nombre,
        description: recipe.tags?.join(", ") || "",
        instructions: recipe.preparacion || "Sin instrucciones específicas",
        meal_type: recipe.tipo,
        tags: recipe.tags || [],
        calories: recipe.calorias,
        protein: recipe.p,
        carbs: recipe.c,
        fat: recipe.f,
        source_id: recipe.source?.id || "personal",
        source_name: recipe.source?.name || null,
        source_url: recipe.source?.url || null,
        servings: 1,
        difficulty: difficulty,
        is_public: false, // Cambiar a true si quieres que sean públicas
      };

      // Insertar receta
      const { data: insertedRecipe, error: recipeError } = await supabase
        .from("recipes")
        .insert(recipeData)
        .select("id, title")
        .single();

      if (recipeError) {
        console.error(
          `❌ Error insertando receta "${recipe.nombre}": ${recipeError.message}`
        );
        skippedRecipes++;
        continue;
      }

      insertedRecipes++;

      // Insertar ingredientes de la receta
      if (recipe.ingredientes && recipe.ingredientes.length > 0) {
        for (const ingrediente of recipe.ingredientes) {
          try {
            // Buscar o crear ingrediente
            let { data: existingIngredient, error: searchError } =
              await supabase
                .from("ingredients")
                .select("id")
                .eq("name", ingrediente.n)
                .single();

            let ingredientId = existingIngredient?.id;

            if (!ingredientId) {
              // Crear nuevo ingrediente
              const { data: newIngredient, error: createError } = await supabase
                .from("ingredients")
                .insert({ name: ingrediente.n })
                .select("id")
                .single();

              if (createError) {
                console.warn(
                  `⚠️  No se pudo crear ingrediente "${ingrediente.n}": ${createError.message}`
                );
                continue;
              }
              ingredientId = newIngredient.id;
            }

            // Insertar relación receta-ingrediente
            const { error: relationError } = await supabase
              .from("recipe_ingredients")
              .insert({
                recipe_id: insertedRecipe.id,
                ingredient_id: ingredientId,
                quantity: ingrediente.q,
                unit: ingrediente.u,
              });

            if (relationError) {
              console.warn(
                `⚠️  Error relacionando ingrediente "${ingrediente.n}" con receta: ${relationError.message}`
              );
            }
          } catch (ingredientError) {
            console.warn(
              `⚠️  Error procesando ingrediente "${ingrediente.n}":`,
              (ingredientError as Error).message
            );
          }
        }
      }

      // Log cada 50 recetas para seguimiento
      if (insertedRecipes % 50 === 0) {
        console.log(
          `📈 Progreso: ${insertedRecipes}/${allMeals.length} recetas procesadas...`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error procesando receta "${recipe.nombre}":`,
        (error as Error).message
      );
      skippedRecipes++;
    }
  }

  console.log(
    `✅ Recetas completadas: ${insertedRecipes} insertadas, ${skippedRecipes} omitidas`
  );
  return insertedRecipes;
}

// ========================================
// MIGRACIÓN DE SUPLEMENTOS
// ========================================

async function migrateSupplements() {
  console.log("\n💊 === MIGRANDO SUPLEMENTOS ===");
  console.log(`📦 Preparando ${allSupplements.length} suplementos...`);

  const supplementsToInsert = allSupplements.map((supplement) => ({
    id: supplement.id,
    name: supplement.name,
    description: supplement.description || null,
    type: supplement.type || null,
    category: supplement.categoria || null,
    tags: supplement.tags || [],
    calories: supplement.calories || supplement.calorias || null,
    protein: supplement.protein || supplement.proteinas || null,
    carbs: supplement.carbs || supplement.carbohidratos || null,
    fat: supplement.fat || supplement.grasas || null,
    dosage: supplement.dosage || null,
    timing: supplement.timing || null,
    serving: supplement.serving || null,
    benefits: supplement.benefits || [],
    image_url: supplement.imageUrl || null,
    brand: supplement.brand || null,
    price: supplement.price || null,
    link: supplement.link || null,
    is_active: true,
  }));

  try {
    const { data, error } = await supabase
      .from("supplements")
      .upsert(supplementsToInsert, { onConflict: "id" })
      .select("id, name");

    if (error) {
      console.error("❌ Error insertando suplementos:", error);
      return 0;
    }

    console.log(`✅ ${data.length} suplementos migrados`);
    return data.length;
  } catch (error) {
    console.error(
      "❌ Error en migración de suplementos:",
      (error as Error).message
    );
    return 0;
  }
}

// ========================================
// MIGRACIÓN DE CONSEJOS/TIPS
// ========================================

async function migrateTips() {
  console.log("\n💡 === MIGRANDO CONSEJOS Y TIPS ===");
  console.log(`📦 Preparando ${allTips.length} tips...`);

  const tipsToInsert = allTips.map((tip) => {
    // Estimar tiempo de lectura basado en el contenido
    const wordCount = tip.content.replace(/<[^>]*>/g, "").split(" ").length;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 palabras por minuto

    // Determinar categoría basada en tags
    let category = "General";
    if (tip.tags.includes("Batidos")) category = "Batidos";
    else if (tip.tags.includes("Tentempiés")) category = "Snacks";
    else if (tip.tags.includes("Compra")) category = "Compras";
    else if (tip.tags.includes("Batch Cooking")) category = "Preparación";
    else if (tip.tags.includes("Control Calórico"))
      category = "Control de Peso";

    return {
      id: tip.id,
      title: tip.title,
      content: tip.content,
      tags: tip.tags || [],
      category: category,
      difficulty_level: "Principiante", // La mayoría de tips son para principiantes
      time_to_read: estimatedReadTime,
      author_id: AUTHOR_USER_ID,
      is_featured: false,
      is_active: true,
      views_count: 0,
      likes_count: 0,
    };
  });

  try {
    const { data, error } = await supabase
      .from("tips")
      .upsert(tipsToInsert, { onConflict: "id" })
      .select("id, title");

    if (error) {
      console.error("❌ Error insertando tips:", error);
      return 0;
    }

    console.log(`✅ ${data.length} tips migrados`);
    return data.length;
  } catch (error) {
    console.error("❌ Error en migración de tips:", (error as Error).message);
    return 0;
  }
}

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================

async function runMigration() {
  try {
    console.log("🎯 Iniciando migración completa...\n");

    // Migrar datos
    const results = {
      recipes: await migrateRecipes(),
      supplements: await migrateSupplements(),
      tips: await migrateTips(),
    };

    // Resumen final
    console.log("\n🎉 === MIGRACIÓN COMPLETADA ===");
    console.log("📊 Resultados:");
    console.log(`   🍽️  Recetas: ${results.recipes}`);
    console.log(`   💊 Suplementos: ${results.supplements}`);
    console.log(`   💡 Tips: ${results.tips}`);

    const total = results.recipes + results.supplements + results.tips;
    console.log(`   🔢 Total de registros: ${total}`);

    console.log("\n✅ ¡Migración completada exitosamente!");
    console.log(
      "💡 Tip: Ahora puedes usar estos datos desde tu aplicación frontend"
    );

    // Mostrar consultas útiles
    console.log("\n🔍 Consultas útiles para verificar:");
    console.log("SELECT COUNT(*) FROM recipes;");
    console.log("SELECT COUNT(*) FROM supplements;");
    console.log("SELECT COUNT(*) FROM tips;");
    console.log("SELECT meal_type, COUNT(*) FROM recipes GROUP BY meal_type;");
  } catch (error) {
    console.error("\n❌ Error en la migración:", error);
    process.exit(1);
  }
}

// Ejecutar migración
runMigration();
