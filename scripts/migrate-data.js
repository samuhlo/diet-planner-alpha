#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { extractedIngredients } from "../src/data/ingredients.js";
import { allMeals } from "../src/data/recipes.js";

// Configuración de Supabase
const supabaseUrl = "https://uelqwczponhydoijzlbv.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error(
    "❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno"
  );
  console.log(
    "💡 Tip: Añade la variable de entorno con tu service role key de Supabase"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ID del usuario author (cambiar por el tuyo)
const AUTHOR_USER_ID =
  process.env.AUTHOR_USER_ID || "36c99997-9503-442e-ba81-e9e7ad9be777";

console.log("🚀 Iniciando migración de datos locales a Supabase...");
console.log(`👤 Usuario autor: ${AUTHOR_USER_ID}`);

// Función para migrar ingredientes
async function migrateIngredients() {
  console.log("\n🥕 === MIGRANDO INGREDIENTES ===");

  const ingredientsToInsert = extractedIngredients.map((ingredient) => ({
    name: ingredient.nombre,
    nutritional_info: {
      categoria: ingredient.categoria,
      unidadBase: ingredient.unidadBase,
      precioPorUnidadBase: ingredient.precioPorUnidadBase,
      infoCompra: ingredient.infoCompra,
      equivalencias: ingredient.equivalencias,
    },
  }));

  console.log(`📦 Preparando ${ingredientsToInsert.length} ingredientes...`);

  const batchSize = 100;
  let insertedCount = 0;

  for (let i = 0; i < ingredientsToInsert.length; i += batchSize) {
    const batch = ingredientsToInsert.slice(i, i + batchSize);

    try {
      const { data, error } = await supabase
        .from("ingredients")
        .insert(batch)
        .select("id, name");

      if (error) {
        if (error.code === "23505") {
          // unique violation
          console.log(
            `⚠️  Lote ${
              Math.floor(i / batchSize) + 1
            }: Ingredientes duplicados, insertando individualmente...`
          );
          for (const ingredient of batch) {
            try {
              await supabase.from("ingredients").insert(ingredient);
              insertedCount++;
            } catch (individualError) {
              // Ingrediente ya existe, lo omitimos
            }
          }
        } else {
          throw error;
        }
      } else {
        insertedCount += data?.length || 0;
        console.log(
          `✅ Lote ${Math.floor(i / batchSize) + 1}: ${
            data?.length
          } ingredientes insertados`
        );
      }
    } catch (batchError) {
      console.error(
        `❌ Error en lote ${Math.floor(i / batchSize) + 1}:`,
        batchError.message
      );
    }
  }

  console.log(`✅ Ingredientes completados: ${insertedCount} insertados`);
  return insertedCount;
}

// Función para migrar recetas
async function migrateRecipes() {
  console.log("\n📋 === MIGRANDO RECETAS ===");

  // Obtener todos los ingredientes para mapeo
  const { data: dbIngredients, error: ingredientsError } = await supabase
    .from("ingredients")
    .select("id, name");

  if (ingredientsError) {
    throw new Error(
      `Error obteniendo ingredientes: ${ingredientsError.message}`
    );
  }

  const ingredientMap = new Map(
    dbIngredients.map((ing) => [ing.name.toLowerCase(), ing.id])
  );

  console.log(`📦 Preparando ${allMeals.length} recetas...`);
  console.log(
    `🗂️  Mapa de ingredientes: ${ingredientMap.size} ingredientes disponibles`
  );

  let insertedRecipes = 0;
  let insertedIngredientRelations = 0;

  for (const recipe of allMeals) {
    try {
      // Insertar receta
      const { data: insertedRecipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          author_id: AUTHOR_USER_ID,
          title: recipe.nombre,
          description: recipe.tags?.join(", ") || "",
          instructions: recipe.preparacion || "Sin instrucciones específicas",
          is_public: false,
          source_name: recipe.source?.name,
          source_url: recipe.source?.url,
        })
        .select("id")
        .single();

      if (recipeError) {
        console.error(
          `❌ Error insertando receta "${recipe.nombre}": ${recipeError.message}`
        );
        continue;
      }

      // Insertar ingredientes de la receta
      const recipeIngredients = [];

      for (const ingredient of recipe.ingredientes) {
        const ingredientName = ingredient.n.toLowerCase();
        const ingredientId = ingredientMap.get(ingredientName);

        if (ingredientId) {
          recipeIngredients.push({
            recipe_id: insertedRecipe.id,
            ingredient_id: ingredientId,
            quantity: ingredient.q,
            unit: ingredient.u,
          });
        } else {
          console.warn(
            `⚠️  Ingrediente no encontrado: "${ingredient.n}" en receta "${recipe.nombre}"`
          );
        }
      }

      if (recipeIngredients.length > 0) {
        const { error: ingredientsError } = await supabase
          .from("recipe_ingredients")
          .insert(recipeIngredients);

        if (ingredientsError) {
          console.error(
            `❌ Error insertando ingredientes para "${recipe.nombre}": ${ingredientsError.message}`
          );
        } else {
          insertedIngredientRelations += recipeIngredients.length;
        }
      }

      insertedRecipes++;
      if (insertedRecipes % 25 === 0) {
        console.log(
          `⏳ Progreso: ${insertedRecipes}/${allMeals.length} recetas procesadas...`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error procesando receta "${recipe.nombre}": ${error.message}`
      );
    }
  }

  console.log(
    `✅ Recetas completadas: ${insertedRecipes} recetas, ${insertedIngredientRelations} relaciones`
  );
  return { recipes: insertedRecipes, relations: insertedIngredientRelations };
}

// Función para verificar estado
async function checkStatus() {
  const [
    { count: ingredientsCount },
    { count: recipesCount },
    { count: relationsCount },
  ] = await Promise.all([
    supabase.from("ingredients").select("*", { count: "exact", head: true }),
    supabase.from("recipes").select("*", { count: "exact", head: true }),
    supabase
      .from("recipe_ingredients")
      .select("*", { count: "exact", head: true }),
  ]);

  return {
    ingredients: ingredientsCount || 0,
    recipes: recipesCount || 0,
    relations: relationsCount || 0,
  };
}

// Función principal
async function main() {
  try {
    console.log("\n📊 === ESTADO INICIAL ===");
    const initialStatus = await checkStatus();
    console.log(`Ingredientes: ${initialStatus.ingredients}`);
    console.log(`Recetas: ${initialStatus.recipes}`);
    console.log(`Relaciones: ${initialStatus.relations}`);

    // Migrar ingredientes
    const ingredientsInserted = await migrateIngredients();

    // Migrar recetas
    const recipesResult = await migrateRecipes();

    console.log("\n📊 === ESTADO FINAL ===");
    const finalStatus = await checkStatus();
    console.log(
      `Ingredientes: ${finalStatus.ingredients} (+${
        finalStatus.ingredients - initialStatus.ingredients
      })`
    );
    console.log(
      `Recetas: ${finalStatus.recipes} (+${
        finalStatus.recipes - initialStatus.recipes
      })`
    );
    console.log(
      `Relaciones: ${finalStatus.relations} (+${
        finalStatus.relations - initialStatus.relations
      })`
    );

    console.log("\n🎉 === MIGRACIÓN COMPLETADA ===");
    console.log(`✅ ${ingredientsInserted} ingredientes procesados`);
    console.log(`✅ ${recipesResult.recipes} recetas procesadas`);
    console.log(`✅ ${recipesResult.relations} relaciones creadas`);
  } catch (error) {
    console.error("\n❌ === ERROR EN MIGRACIÓN ===");
    console.error(error.message);
    process.exit(1);
  }
}

// Ejecutar
main();
