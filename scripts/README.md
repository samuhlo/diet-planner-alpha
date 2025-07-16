# 📋 Migración de Datos Locales a Supabase

## 🎯 Qué hace este script

El script `migrate-local-data.ts` migra todos tus datos locales (recetas, suplementos y tips) a las tablas de Supabase que acabamos de crear.

## ⚙️ Configuración

### 1. Variables de entorno necesarias:

```bash
# Obligatorio: Service Role Key de Supabase
export SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"

# Opcional: Tu User ID (si no lo defines, usa uno por defecto)
export AUTHOR_USER_ID="tu-user-uuid"
```

### 2. Obtener las claves:

**Service Role Key:**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Settings → API → Service Role Key (secret) → Copiar

**Tu User ID:**

```sql
-- Ejecuta esto en el SQL Editor de Supabase
SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com';
```

## 🚀 Ejecutar la migración (NUEVO MÉTODO SIMPLIFICADO)

### Paso 1: Compilar datos TypeScript

```bash
# Compilar tus datos TypeScript a JSON
node scripts/compile-data.cjs
```

### Paso 2: Configurar Service Role Key

```bash
# Obtén tu Service Role Key desde Supabase Dashboard
export SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"

# Opcional: Tu user ID (si no, usa el predeterminado)
export AUTHOR_USER_ID="tu-user-uuid"
```

### Paso 3: Ejecutar migración

```bash
# Ejecutar migración final
node scripts/migrate-final.cjs
```

---

## 📚 Métodos alternativos (si el principal no funciona)

### Método TypeScript (requiere ts-node)

```bash
# Instalar ts-node
npm install -g ts-node

# Ejecutar
npx ts-node scripts/migrate-local-data.ts
```

### Método CommonJS básico

```bash
# Ejecutar versión básica
node scripts/migrate-data-alternative.cjs
```

## 📊 Resultado esperado

```
🚀 Iniciando migración de datos locales a Supabase...
👤 Usuario autor: 36c99997-9503-442e-ba81-e9e7ad9be777

🍽️ === MIGRANDO RECETAS ===
📦 Preparando 1691 recetas...
📈 Progreso: 50/1691 recetas procesadas...
✅ Recetas completadas: 1691 insertadas, 0 omitidas

💊 === MIGRANDO SUPLEMENTOS ===
📦 Preparando 258 suplementos...
✅ 258 suplementos migrados

💡 === MIGRANDO CONSEJOS Y TIPS ===
📦 Preparando 109 tips...
✅ 109 tips migrados

🎉 === MIGRACIÓN COMPLETADA ===
📊 Resultados:
   🍽️  Recetas: 1691
   💊 Suplementos: 258
   💡 Tips: 109
   🔢 Total de registros: 2058
```

## ✅ Verificar que funcionó

Ejecuta estas consultas en el SQL Editor de Supabase:

```sql
-- Contar todos los datos migrados
SELECT
  'recipes' as tabla, COUNT(*) as total FROM recipes
UNION ALL
SELECT 'supplements', COUNT(*) FROM supplements
UNION ALL
SELECT 'tips', COUNT(*) FROM tips;

-- Ver distribución de recetas por tipo
SELECT meal_type, COUNT(*)
FROM recipes
GROUP BY meal_type
ORDER BY COUNT(*) DESC;
```

## 🔧 Si hay errores

- **"Error: SUPABASE_SERVICE_ROLE_KEY not found"** → Configura la variable de entorno
- **"Permission denied"** → Verifica que el service role key sea correcto
- **"User not found"** → Verifica que el AUTHOR_USER_ID exista en la tabla auth.users

¡Ya tienes todos tus datos locales migrados a Supabase! 🎉
