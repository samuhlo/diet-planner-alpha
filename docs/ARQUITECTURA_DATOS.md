# Arquitectura de Datos - Planificador de Dieta

## Visión General

La base de datos del Planificador de Dieta está diseñada para gestionar un sistema completo de planificación nutricional que incluye gestión de usuarios, recetas, suplementos, tips nutricionales y planificación de comidas. La arquitectura está implementada en Supabase (PostgreSQL) con Row Level Security (RLS) habilitado para garantizar la seguridad y privacidad de los datos.

### Características Principales

- **Gestión completa de usuarios** con perfiles nutricionales y seguimiento de objetivos
- **Catálogo extenso de recetas** con información nutricional detallada
- **Sistema de suplementos** con dosificación y beneficios
- **Tips y consejos nutricionales** categorizados por dificultad
- **Planificación semanal de comidas** personalizada
- **Sistema social** con valoraciones y comentarios
- **Gestión de precios** de ingredientes por supermercado

---

## Módulos del Sistema

### 📊 1. MÓDULO DE USUARIOS

#### 🏷️ **user_profiles** - Perfiles de Usuario

**Propósito**: Almacena la información personal y nutricional de cada usuario registrado.

| Campo                    | Tipo        | Descripción                                  | Restricciones                    |
| ------------------------ | ----------- | -------------------------------------------- | -------------------------------- |
| `id`                     | uuid        | Identificador único (vinculado a auth.users) | PK, NOT NULL                     |
| `full_name`              | text        | Nombre completo del usuario                  | -                                |
| `avatar_url`             | text        | URL de la imagen de perfil                   | -                                |
| `weight`                 | numeric     | Peso actual en kg                            | -                                |
| `height`                 | numeric     | Altura en cm                                 | -                                |
| `age`                    | integer     | Edad en años                                 | -                                |
| `gender`                 | text        | Género del usuario                           | CHECK: 'male', 'female', 'other' |
| `steps`                  | integer     | Promedio de pasos diarios                    | DEFAULT: 15000                   |
| `does_strength_training` | boolean     | Realiza entrenamiento de fuerza              | DEFAULT: false                   |
| `strength_training_days` | integer     | Días de entrenamiento por semana             | DEFAULT: 0                       |
| `created_at`             | timestamptz | Fecha de creación                            | NOT NULL, DEFAULT: now()         |
| `updated_at`             | timestamptz | Última actualización                         | NOT NULL, DEFAULT: now()         |

**Relaciones**:

- ← `user_goals`, `weight_entries`, `recipes`, `weekly_plans`, `tips`

#### 🎯 **user_goals** - Objetivos de Usuario

**Propósito**: Define los objetivos nutricionales y de peso de cada usuario.

| Campo           | Tipo        | Descripción                  | Restricciones                     |
| --------------- | ----------- | ---------------------------- | --------------------------------- |
| `id`            | uuid        | Identificador único          | PK, NOT NULL                      |
| `user_id`       | uuid        | Referencia al usuario        | FK → user_profiles.id             |
| `start_date`    | date        | Fecha de inicio del objetivo | -                                 |
| `end_date`      | date        | Fecha objetivo               | -                                 |
| `target_weight` | numeric     | Peso objetivo en kg          | -                                 |
| `goal_type`     | text        | Tipo de objetivo             | CHECK: 'lose', 'gain', 'maintain' |
| `is_active`     | boolean     | Objetivo activo              | DEFAULT: true                     |
| `created_at`    | timestamptz | Fecha de creación            | NOT NULL                          |
| `updated_at`    | timestamptz | Última actualización         | NOT NULL                          |

#### ⚖️ **weight_entries** - Registro de Peso

**Propósito**: Historial de seguimiento del peso del usuario para monitorear el progreso.

| Campo        | Tipo        | Descripción           | Restricciones         |
| ------------ | ----------- | --------------------- | --------------------- |
| `id`         | uuid        | Identificador único   | PK, NOT NULL          |
| `user_id`    | uuid        | Referencia al usuario | FK → user_profiles.id |
| `weight`     | numeric     | Peso registrado en kg | NOT NULL              |
| `date`       | date        | Fecha del pesaje      | NOT NULL              |
| `notes`      | text        | Notas adicionales     | -                     |
| `created_at` | timestamptz | Fecha de creación     | NOT NULL              |
| `updated_at` | timestamptz | Última actualización  | NOT NULL              |

---

### 🍽️ 2. MÓDULO DE RECETAS

#### 📖 **recipes** - Recetas

**Propósito**: Catálogo central de todas las recetas con información nutricional completa.

| Campo          | Tipo        | Descripción                  | Restricciones                                            |
| -------------- | ----------- | ---------------------------- | -------------------------------------------------------- |
| `id`           | uuid        | Identificador único          | PK, NOT NULL                                             |
| `author_id`    | uuid        | Creador de la receta         | FK → user_profiles.id, NOT NULL                          |
| `title`        | text        | Nombre de la receta          | NOT NULL                                                 |
| `description`  | text        | Descripción breve            | -                                                        |
| `instructions` | text        | Instrucciones de preparación | -                                                        |
| `image_url`    | text        | URL de la imagen             | -                                                        |
| `is_public`    | boolean     | Receta pública               | DEFAULT: false                                           |
| `source_name`  | text        | Nombre de la fuente          | -                                                        |
| `source_url`   | text        | URL de la fuente             | -                                                        |
| `meal_type`    | text        | Tipo de comida               | CHECK: 'Desayuno', 'Almuerzo', 'Cena', 'Snack', 'Postre' |
| `tags`         | text[]      | Etiquetas de categorización  | DEFAULT: {}                                              |
| `calories`     | integer     | Calorías por porción         | -                                                        |
| `protein`      | numeric     | Proteínas en gramos          | -                                                        |
| `carbs`        | numeric     | Carbohidratos en gramos      | -                                                        |
| `fat`          | numeric     | Grasas en gramos             | -                                                        |
| `servings`     | integer     | Número de porciones          | DEFAULT: 1                                               |
| `prep_time`    | integer     | Tiempo de preparación (min)  | -                                                        |
| `cook_time`    | integer     | Tiempo de cocción (min)      | -                                                        |
| `difficulty`   | text        | Nivel de dificultad          | CHECK: 'Fácil', 'Medio', 'Difícil'                       |
| `source_id`    | text        | Referencia a fuente          | FK → recipe_sources.id                                   |
| `created_at`   | timestamptz | Fecha de creación            | DEFAULT: now()                                           |
| `updated_at`   | timestamptz | Última actualización         | DEFAULT: now()                                           |

**Relaciones**:

- ← `recipe_ingredients`, `recipe_ratings`, `recipe_comments`, `plan_entries`
- → `recipe_sources`

#### 📚 **recipe_sources** - Fuentes de Recetas

**Propósito**: Catálogo de fuentes de donde provienen las recetas (libros, webs, revistas).

| Campo         | Tipo        | Descripción              | Restricciones                                             |
| ------------- | ----------- | ------------------------ | --------------------------------------------------------- |
| `id`          | text        | Identificador único      | PK, NOT NULL                                              |
| `name`        | text        | Nombre de la fuente      | NOT NULL                                                  |
| `authors`     | text        | Autores/editores         | -                                                         |
| `url`         | text        | URL si es digital        | -                                                         |
| `year`        | integer     | Año de publicación       | -                                                         |
| `type`        | text        | Tipo de fuente           | CHECK: 'book', 'website', 'magazine', 'personal', 'other' |
| `description` | text        | Descripción de la fuente | -                                                         |
| `created_at`  | timestamptz | Fecha de creación        | DEFAULT: now()                                            |

#### 🥬 **ingredients** - Ingredientes

**Propósito**: Catálogo maestro centralizado de todos los ingredientes disponibles.

| Campo              | Tipo        | Descripción             | Restricciones    |
| ------------------ | ----------- | ----------------------- | ---------------- |
| `id`               | uuid        | Identificador único     | PK, NOT NULL     |
| `name`             | text        | Nombre del ingrediente  | NOT NULL, UNIQUE |
| `nutritional_info` | jsonb       | Información nutricional | -                |
| `created_at`       | timestamptz | Fecha de creación       | DEFAULT: now()   |

**Relaciones**:

- ← `recipe_ingredients`, `ingredient_prices`

#### 🔗 **recipe_ingredients** - Ingredientes de Recetas

**Propósito**: Tabla de unión que define la relación muchos a muchos entre recetas e ingredientes.

| Campo           | Tipo    | Descripción              | Restricciones           |
| --------------- | ------- | ------------------------ | ----------------------- |
| `recipe_id`     | uuid    | Referencia a receta      | PK, FK → recipes.id     |
| `ingredient_id` | uuid    | Referencia a ingrediente | PK, FK → ingredients.id |
| `quantity`      | numeric | Cantidad necesaria       | NOT NULL                |
| `unit`          | text    | Unidad de medida         | NOT NULL                |

#### ⭐ **recipe_ratings** - Valoraciones de Recetas

**Propósito**: Sistema de valoración de recetas por parte de los usuarios.

| Campo        | Tipo        | Descripción          | Restricciones                      |
| ------------ | ----------- | -------------------- | ---------------------------------- |
| `recipe_id`  | uuid        | Referencia a receta  | PK, FK → recipes.id                |
| `user_id`    | uuid        | Usuario que valora   | PK, FK → user_profiles.id          |
| `rating`     | integer     | Puntuación (1-5)     | CHECK: rating >= 1 AND rating <= 5 |
| `created_at` | timestamptz | Fecha de valoración  | DEFAULT: now()                     |
| `updated_at` | timestamptz | Última actualización | DEFAULT: now()                     |

#### 💬 **recipe_comments** - Comentarios de Recetas

**Propósito**: Sistema de comentarios y conversaciones sobre las recetas.

| Campo               | Tipo        | Descripción                   | Restricciones                   |
| ------------------- | ----------- | ----------------------------- | ------------------------------- |
| `id`                | uuid        | Identificador único           | PK, NOT NULL                    |
| `recipe_id`         | uuid        | Referencia a receta           | FK → recipes.id, NOT NULL       |
| `user_id`           | uuid        | Usuario comentarista          | FK → user_profiles.id, NOT NULL |
| `parent_comment_id` | uuid        | Comentario padre (respuestas) | FK → recipe_comments.id         |
| `content`           | text        | Contenido del comentario      | NOT NULL                        |
| `created_at`        | timestamptz | Fecha de creación             | DEFAULT: now()                  |
| `updated_at`        | timestamptz | Última actualización          | DEFAULT: now()                  |

---

### 📅 3. MÓDULO DE PLANIFICACIÓN

#### 📋 **weekly_plans** - Planes Semanales

**Propósito**: Define la cabecera de un plan semanal de comidas para un usuario.

| Campo        | Tipo | Descripción                  | Restricciones                   |
| ------------ | ---- | ---------------------------- | ------------------------------- |
| `id`         | uuid | Identificador único          | PK, NOT NULL                    |
| `user_id`    | uuid | Propietario del plan         | FK → user_profiles.id, NOT NULL |
| `start_date` | date | Fecha de inicio de la semana | NOT NULL                        |
| `name`       | text | Nombre del plan              | -                               |

**Relaciones**:

- ← `plan_entries`

#### 🍽️ **plan_entries** - Entradas del Plan

**Propósito**: Cada una de las comidas asignadas dentro de un plan semanal.

| Campo        | Tipo    | Descripción          | Restricciones                                            |
| ------------ | ------- | -------------------- | -------------------------------------------------------- |
| `id`         | uuid    | Identificador único  | PK, NOT NULL                                             |
| `plan_id`    | uuid    | Referencia al plan   | FK → weekly_plans.id, NOT NULL                           |
| `recipe_id`  | uuid    | Receta asignada      | FK → recipes.id, NOT NULL                                |
| `entry_date` | date    | Fecha específica     | NOT NULL                                                 |
| `meal_type`  | text    | Tipo de comida       | CHECK: 'desayuno', 'almuerzo', 'cena', 'snack', 'postre' |
| `diners`     | integer | Número de comensales | DEFAULT: 1, CHECK: diners > 0                            |

---

### 💊 4. MÓDULO DE SUPLEMENTOS

#### 🧪 **supplements** - Suplementos

**Propósito**: Catálogo de suplementos nutricionales con información detallada.

| Campo         | Tipo        | Descripción                     | Restricciones  |
| ------------- | ----------- | ------------------------------- | -------------- |
| `id`          | text        | Identificador único             | PK, NOT NULL   |
| `name`        | text        | Nombre del suplemento           | NOT NULL       |
| `description` | text        | Descripción detallada           | -              |
| `type`        | text        | Tipo (proteína, vitamina, etc.) | -              |
| `category`    | text        | Categoría funcional             | -              |
| `tags`        | text[]      | Etiquetas                       | DEFAULT: {}    |
| `calories`    | integer     | Calorías por porción            | -              |
| `protein`     | numeric     | Proteínas en gramos             | -              |
| `carbs`       | numeric     | Carbohidratos en gramos         | -              |
| `fat`         | numeric     | Grasas en gramos                | -              |
| `dosage`      | text        | Dosificación recomendada        | -              |
| `timing`      | text        | Momento de toma recomendado     | -              |
| `serving`     | text        | Porción recomendada             | -              |
| `benefits`    | text[]      | Lista de beneficios             | DEFAULT: {}    |
| `image_url`   | text        | URL de la imagen                | -              |
| `brand`       | text        | Marca del suplemento            | -              |
| `price`       | numeric     | Precio aproximado               | -              |
| `link`        | text        | Enlace de compra                | -              |
| `is_active`   | boolean     | Suplemento activo               | DEFAULT: true  |
| `created_at`  | timestamptz | Fecha de creación               | DEFAULT: now() |
| `updated_at`  | timestamptz | Última actualización            | DEFAULT: now() |

---

### 💡 5. MÓDULO DE TIPS

#### 📝 **tips** - Consejos Nutricionales

**Propósito**: Base de conocimiento de consejos y tips nutricionales para usuarios.

| Campo              | Tipo        | Descripción                      | Restricciones                                   |
| ------------------ | ----------- | -------------------------------- | ----------------------------------------------- |
| `id`               | text        | Identificador único              | PK, NOT NULL                                    |
| `title`            | text        | Título del consejo               | NOT NULL                                        |
| `content`          | text        | Contenido en HTML                | NOT NULL                                        |
| `tags`             | text[]      | Etiquetas de categorización      | DEFAULT: {}                                     |
| `category`         | text        | Categoría principal              | -                                               |
| `difficulty_level` | text        | Nivel de dificultad              | CHECK: 'Principiante', 'Intermedio', 'Avanzado' |
| `time_to_read`     | integer     | Tiempo estimado de lectura (min) | -                                               |
| `author_id`        | uuid        | Autor del tip                    | FK → user_profiles.id                           |
| `is_featured`      | boolean     | Destacado en principal           | DEFAULT: false                                  |
| `is_active`        | boolean     | Tip activo                       | DEFAULT: true                                   |
| `views_count`      | integer     | Contador de visualizaciones      | DEFAULT: 0                                      |
| `likes_count`      | integer     | Contador de likes                | DEFAULT: 0                                      |
| `created_at`       | timestamptz | Fecha de creación                | DEFAULT: now()                                  |
| `updated_at`       | timestamptz | Última actualización             | DEFAULT: now()                                  |

**Funciones Especiales**:

- `increment_tip_views(tip_id)`: Incrementa contador de visualizaciones
- `increment_tip_likes(tip_id)`: Incrementa contador de likes

---

### 🛒 6. MÓDULO DE PRECIOS

#### 🏪 **supermarkets** - Supermercados

**Propósito**: Catálogo de supermercados disponibles para comparar precios.

| Campo      | Tipo | Descripción             | Restricciones    |
| ---------- | ---- | ----------------------- | ---------------- |
| `id`       | uuid | Identificador único     | PK, NOT NULL     |
| `name`     | text | Nombre del supermercado | NOT NULL, UNIQUE |
| `logo_url` | text | URL del logo            | -                |

**Relaciones**:

- ← `ingredient_prices`

#### 💰 **ingredient_prices** - Precios de Ingredientes

**Propósito**: Almacena el precio de cada ingrediente en diferentes supermercados.

| Campo            | Tipo        | Descripción                | Restricciones                  |
| ---------------- | ----------- | -------------------------- | ------------------------------ |
| `id`             | uuid        | Identificador único        | PK, NOT NULL                   |
| `ingredient_id`  | uuid        | Referencia al ingrediente  | FK → ingredients.id, NOT NULL  |
| `supermarket_id` | uuid        | Referencia al supermercado | FK → supermarkets.id, NOT NULL |
| `price`          | numeric     | Precio del ingrediente     | NOT NULL                       |
| `unit`           | text        | Unidad de precio           | NOT NULL                       |
| `last_updated`   | timestamptz | Última actualización       | DEFAULT: now()                 |

---

## 🔒 Políticas de Seguridad (RLS)

### Configuración General

- **Row Level Security (RLS)**: Habilitado en todas las tablas
- **Autenticación**: Integración con Supabase Auth
- **Autorización**: Políticas granulares por tabla

### Políticas Principales

#### 👤 **user_profiles**

- ✅ **Lectura**: Solo el propio perfil
- ✅ **Escritura**: Solo el propio perfil
- ✅ **Actualización**: Solo el propio perfil

#### 📖 **recipes**

- ✅ **Lectura**: Recetas públicas + propias recetas
- ✅ **Escritura**: Solo usuarios autenticados
- ✅ **Actualización**: Solo el autor

#### 💊 **supplements**

- ✅ **Lectura**: Acceso público
- ❌ **Escritura**: Restringido a administradores

#### 💡 **tips**

- ✅ **Lectura**: Tips activos públicos
- ✅ **Escritura**: Solo usuarios autenticados
- ✅ **Actualización**: Solo el autor

#### 📅 **weekly_plans / plan_entries**

- ✅ **Lectura**: Solo planes propios
- ✅ **Escritura**: Solo usuarios autenticados
- ✅ **Actualización**: Solo el propietario

#### 💬 **recipe_comments / recipe_ratings**

- ✅ **Lectura**: Comentarios de recetas públicas
- ✅ **Escritura**: Solo usuarios autenticados
- ✅ **Actualización**: Solo el autor

---

## 📊 Índices de Performance

### Índices Principales

```sql
-- Búsqueda de recetas por tipo de comida
CREATE INDEX idx_recipes_meal_type ON recipes(meal_type);

-- Búsqueda de recetas por tags
CREATE INDEX idx_recipes_tags ON recipes USING GIN(tags);

-- Búsqueda de recetas por calorías
CREATE INDEX idx_recipes_calories ON recipes(calories);

-- Búsqueda de tips por tags
CREATE INDEX idx_tips_tags ON tips USING GIN(tags);

-- Planes por usuario y fecha
CREATE INDEX idx_weekly_plans_user_date ON weekly_plans(user_id, start_date);

-- Entradas por plan y fecha
CREATE INDEX idx_plan_entries_plan_date ON plan_entries(plan_id, entry_date);
```

---

## 🔄 Triggers y Funciones

### Triggers Automáticos

- **updated_at**: Auto-actualización en todas las tablas principales
- **increment_tip_views()**: Función para incrementar visualizaciones
- **increment_tip_likes()**: Función para incrementar likes

### Funciones Personalizadas

```sql
-- Incrementar visualizaciones de tips
CREATE FUNCTION increment_tip_views(tip_id text)
RETURNS void AS $$
BEGIN
  UPDATE tips SET views_count = views_count + 1 WHERE id = tip_id;
END;
$$ LANGUAGE plpgsql;

-- Incrementar likes de tips
CREATE FUNCTION increment_tip_likes(tip_id text)
RETURNS void AS $$
BEGIN
  UPDATE tips SET likes_count = likes_count + 1 WHERE id = tip_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 Métricas de Datos

### Volumen Esperado

- **Recetas**: ~1,691 recetas iniciales
- **Suplementos**: ~258 suplementos
- **Tips**: ~109 consejos nutricionales
- **Ingredientes**: ~500+ ingredientes únicos
- **Usuarios**: Escalable sin límite

### Consideraciones de Escalabilidad

- Particionado por fecha en `weight_entries` y `plan_entries`
- Archivado automático de planes antiguos
- Índices optimizados para consultas frecuentes
- Cache en aplicación para datos estáticos

---

## 🛠️ Mantenimiento

### Respaldos

- **Frecuencia**: Diario automático por Supabase
- **Retención**: 7 días point-in-time recovery
- **Exportación**: Mensual para datos críticos

### Monitoreo

- **Performance**: Query performance insights
- **Crecimiento**: Monitoreo de storage y connections
- **Seguridad**: Logs de acceso y cambios

### Limpieza de Datos

- Planes semanales > 6 meses: Archivar
- Comentarios spam: Revisión manual
- Precios desactualizados: Limpieza automática

---

_Documentación generada para el proyecto Planificador de Dieta_  
_Última actualización: Diciembre 2024_
