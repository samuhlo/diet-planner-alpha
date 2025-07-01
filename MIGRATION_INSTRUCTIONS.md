# 🚨 MIGRACIÓN URGENTE REQUERIDA

## Problema Identificado

La aplicación estaba usando localStorage como fuente principal de datos en lugar de la base de datos, causando inconsistencias y pérdida de datos importantes.

## Cambios Realizados

1. ✅ **Actualización de tipos TypeScript** - Agregados campos faltantes
2. ✅ **Corrección de AppDataForm** - Ahora usa BD como fuente principal
3. ✅ **Sincronización mejorada** - Los stores locales solo para compatibilidad temporal
4. 🔄 **PENDIENTE: Aplicar migración SQL** - Agregar campos faltantes a la BD

## INSTRUCCIONES PARA APLICAR LA MIGRACIÓN

### Opción 1: Dashboard de Supabase (Recomendado)

1. Ve al dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto: `xxrvomakgtytyxmrlgip`
3. Ve a **SQL Editor**
4. Ejecuta el siguiente SQL:

```sql
-- Migration: Add activity fields to user_profiles table
-- These fields are essential for the app's functionality (analysis, calculations, etc.)

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS steps INTEGER DEFAULT 15000,
ADD COLUMN IF NOT EXISTS does_strength_training BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS strength_training_days INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.steps IS 'Daily steps average for activity calculation';
COMMENT ON COLUMN user_profiles.does_strength_training IS 'Whether user does strength training';
COMMENT ON COLUMN user_profiles.strength_training_days IS 'Number of strength training days per week (0-4)';

-- Update existing rows to have default values if they have NULL
UPDATE user_profiles
SET
  steps = COALESCE(steps, 15000),
  does_strength_training = COALESCE(does_strength_training, FALSE),
  strength_training_days = COALESCE(strength_training_days, 0)
WHERE steps IS NULL OR does_strength_training IS NULL OR strength_training_days IS NULL;
```

### Opción 2: CLI de Supabase

Si tienes el CLI configurado:

```bash
supabase migration new add_activity_fields
# Copia el contenido del archivo: supabase/migrations/add_activity_fields.sql
supabase db push
```

## Campos Agregados

- **`steps`**: Pasos diarios promedio (INTEGER, default: 15000)
- **`does_strength_training`**: Si hace entrenamiento de fuerza (BOOLEAN, default: FALSE)
- **`strength_training_days`**: Días de entrenamiento por semana (INTEGER, default: 0)

## Verificación

Después de aplicar la migración, verifica que:

1. Los campos aparecen en la tabla `user_profiles`
2. Los datos existentes tienen valores por defecto
3. La aplicación carga datos desde la BD (no localStorage)

## Beneficios Inmediatos

✅ **Persistencia real**: Datos guardados en BD, no localStorage  
✅ **Sincronización perfecta**: BD como fuente única de verdad  
✅ **Sin pérdida de datos**: Todos los campos necesarios persisten  
✅ **Análisis correcto**: ObjectiveAnalysis con datos reales de BD

## ⚠️ IMPORTANTE

**NO uses la aplicación hasta aplicar esta migración**. Los datos podrían no sincronizarse correctamente.

Una vez aplicada la migración, la aplicación funcionará perfectamente con:

- Datos cargados desde la base de datos
- Sincronización automática
- Análisis de objetivos en tiempo real
- Sin dependencia del localStorage para datos críticos
