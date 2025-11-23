# Arquitectura de Datos - Planificador de Dieta

## Índice

1. [Visión General](#visión-general)
2. [Esquema de Base de Datos](#esquema-de-base-de-datos)
3. [Recetas, Ingredientes y Suplementos](#recetas-ingredientes-y-suplementos)
   3.1. [Tablas en Supabase](#tablas-en-supabase)
   3.2. [Tipos TypeScript](#tipos-typescript)
   3.3. [Funcionamiento de los Services](#funcionamiento-de-los-services)
   3.4. [Flujo de Datos y Uso](#flujo-de-datos-y-uso)
4. [Configuración de Supabase](#configuración-de-supabase)
5. [Servicios de Base de Datos](#servicios-de-base-de-datos)
6. [Gestión de Estado](#gestión-de-estado)
7. [Sistema de Autenticación](#sistema-de-autenticación)
8. [Migración de Datos](#migración-de-datos)
9. [Flujo de Datos](#flujo-de-datos)
10. [Seguridad y Permisos](#seguridad-y-permisos)
11. [Mejores Prácticas](#mejores-prácticas)

---

## Visión General

El Planificador de Dieta utiliza **Supabase** como backend principal, combinando:

- **PostgreSQL** como base de datos relacional
- **Autenticación integrada** con múltiples proveedores OAuth
- **Row Level Security (RLS)** para seguridad de datos
- **Tiempo real** para sincronización entre dispositivos
- **Migración automática** desde localStorage

### Tecnologías Utilizadas

- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: Base de datos relacional
- **TypeScript**: Tipos seguros para la base de datos
- **Nanostores**: Gestión de estado reactivo
- **OAuth**: Autenticación con Google, GitHub, Apple

---

## Esquema de Base de Datos

### Tablas Principales

#### 1. `user_profiles`

Almacena la información personal y características físicas del usuario.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  weight DECIMAL,
  height DECIMAL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  steps INTEGER DEFAULT 15000,
  does_strength_training BOOLEAN DEFAULT FALSE,
  strength_training_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Características:**

- Clave primaria vinculada a `auth.users`
- Validación de género mediante CHECK constraint
- Valores por defecto para campos opcionales
- Timestamps automáticos para auditoría

#### 2. `user_goals`

Gestiona los objetivos nutricionales y de peso del usuario.

```sql
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  target_weight DECIMAL,
  goal_type TEXT CHECK (goal_type IN ('lose', 'gain', 'maintain')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Características:**

- Múltiples objetivos por usuario (histórico)
- Un objetivo activo por usuario mediante `is_active`
- Tipos de objetivo validados
- Fechas de inicio y fin para seguimiento temporal

#### 3. `weight_entries`

Registro histórico del peso del usuario.

```sql
CREATE TABLE weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  weight DECIMAL NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

**Características:**

- Una entrada por día por usuario (UNIQUE constraint)
- Upsert automático para sobrescribir entradas del mismo día
- Notas opcionales para contexto adicional

### Tipos TypeScript

```typescript
// Tipos principales de la base de datos
interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: "male" | "female" | "other" | null;
  steps: number | null;
  does_strength_training: boolean | null;
  strength_training_days: number | null;
  created_at: string;
  updated_at: string;
}

interface UserGoal {
  id: string;
  user_id: string;
  start_date: string | null;
  end_date: string | null;
  target_weight: number | null;
  goal_type: "lose" | "gain" | "maintain" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## Recetas, Ingredientes y Suplementos

### 3.1. Tablas en Supabase

#### `recipes`

- **Campos principales:**
  - `id` (UUID, PK)
  - `nombre`/`name` (string)
  - `tipo` (enum: 'Desayuno', 'Almuerzo', 'Cena', 'Snack', 'Postre')
  - `tags` (array)
  - `calorias`, `p` (proteínas), `c` (carbohidratos), `f` (grasas)
  - `ingredientes` (array de objetos `{ n, q, u }`)
  - `preparacion` (string)
  - `description` (string)
  - `source` (relación a `recipe_sources`)
  - `created_at`, `updated_at`

#### `ingredients`

- **Campos principales:**
  - `id` (string, PK)
  - `nombre` (string)
  - `categoria` (string)
  - `unidad_base` (string)
  - `precio_por_unidad_base` (number)
  - `info_compra` (objeto: `{ precioTotal, formato, cantidadTotalEnUnidadBase }`)
  - `equivalencias` (mapa de unidades)
  - `created_at`, `updated_at`

#### `supplements`

- **Campos principales:**
  - `id` (string, PK)
  - `name` (string)
  - `description` (string)
  - `type` (string)
  - `tags` (array)
  - `dosage`, `timing` (string)
  - `calories`, `protein`, `carbs`, `fat` (number)
  - `benefits` (array)
  - `brand`, `price` (string/number)
  - `nutritionalInfo` (objeto)
  - `created_at`, `updated_at`

#### `tips`

- **Campos principales:**
  - `id` (string, PK)
  - `title` (string)
  - `content` (string)
  - `tags` (array)
  - `created_at`, `updated_at`

#### `recipe_sources`

- **Campos principales:**
  - `id` (string, PK)
  - `name` (string)
  - `authors` (string)
  - `type` (enum: 'book', 'website', 'magazine', 'personal', 'other')
  - `url` (string)
  - `year` (number)

---

### 3.2. Tipos TypeScript

```typescript
// Recipe
interface Recipe {
  id: string;
  name: string;
  nombre: string;
  tipo: "Desayuno" | "Almuerzo" | "Cena" | "Snack" | "Postre";
  tags: string[];
  calorias: number;
  p: number; // Proteínas
  c: number; // Carbohidratos
  f: number; // Grasas
  ingredientes: { n: string; q: number; u: string }[];
  preparacion?: string;
  source?: RecipeSource;
  description?: string;
  nutritionalInfo?: NutritionalInfo;
}

// ExtractedIngredient
interface ExtractedIngredient {
  id: string;
  nombre: string;
  categoria: string;
  unidadBase: string;
  precioPorUnidadBase: number;
  infoCompra: {
    precioTotal: number;
    formato: string;
    cantidadTotalEnUnidadBase: number;
  };
  equivalencias: Record<string, number>;
}

// RecipeSource
interface RecipeSource {
  id: string;
  name: string;
  authors?: string;
  url?: string;
  year?: number;
  type: "book" | "website" | "magazine" | "personal" | "other";
}
```

---

### 3.3. Funcionamiento de los Services

#### `contentDataService.ts`

- Proporciona funciones para obtener datos de Supabase:
  - `getRecipesFromSupabase()`: Obtiene todas las recetas, incluyendo la fuente (`recipe_sources`).
  - `getIngredientsFromSupabase()`: Obtiene todos los ingredientes.
  - `getSupplementsFromSupabase()`: Obtiene todos los suplementos.
  - `getTipsFromSupabase()`: Obtiene todos los tips.
- Implementa **caché en memoria** para evitar llamadas repetidas en intervalos cortos.
- Permite filtrar recetas por tipo y ingredientes por categoría.

#### `dataAdapter.ts`

- Abstrae la obtención de datos para que la app funcione tanto online (Supabase) como offline (datos locales).
- Si Supabase no está disponible, usa los datos locales de `/src/data/`.
- Funciones principales:
  - `getAllMeals()`: Devuelve todas las recetas (remotas o locales).
  - `getExtractedIngredients()`: Devuelve todos los ingredientes.
  - `getAllContentData()`: Devuelve todos los datos relevantes para la app (recetas, suplementos, tips, ingredientes, fuentes).

#### **Estructura de datos local**

- `/src/data/recipes.ts`: Array de recetas con todos los campos.
- `/src/data/ingredients.ts`: Array de ingredientes extraídos de las recetas.
- `/src/data/recipeSources.ts`: Fuentes de recetas centralizadas.

---

### 3.4. Flujo de Datos y Uso

1. **Carga inicial**:

   - Se verifica si Supabase está disponible.
   - Si está disponible, se obtienen los datos remotos y se cachean.
   - Si no, se usan los datos locales.

2. **Obtención de recetas/ingredientes**:

   - Se llama a los services (`getAllMeals`, `getExtractedIngredients`).
   - Los datos se transforman al formato local esperado por la app.

3. **Uso en la app**:

   - Los componentes consumen los datos a través de los stores y los services.
   - Se pueden filtrar, buscar y mostrar detalles de recetas, ingredientes, suplementos y tips.

4. **Actualización**:
   - (Actualmente, la edición/creación de recetas e ingredientes es solo posible en Supabase directamente o mediante scripts, no desde la UI).

#### Resumen visual del flujo

```
┌──────────────┐
│ Supabase DB  │
└─────┬────────┘
      │
      ▼
┌────────────────────────────┐
│ contentDataService.ts      │
│  - getRecipesFromSupabase  │
│  - getIngredientsFromSupabase │
└─────┬──────────────────────┘
      │
      ▼
┌────────────────────────────┐
│ dataAdapter.ts             │
│  - getAllMeals             │
│  - getExtractedIngredients │
└─────┬──────────────────────┘
      │
      ▼
┌──────────────┐
│ Componentes  │
└──────────────┘
```

---

## Configuración de Supabase

### Cliente Supabase (`src/lib/supabase.ts`)

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: "supabase-auth-token",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  }
);
```

### Variables de Entorno Requeridas

```env
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

### Verificación de Configuración

El sistema incluye verificación automática de:

- ✅ Presencia de variables de entorno
- ✅ Formato válido de URL
- ✅ Longitud correcta de claves
- ✅ Conexión con el servidor

---

## Servicios de Base de Datos

### Arquitectura de Servicios

El acceso a datos está centralizado en `src/services/databaseService.ts`:

#### Operaciones CRUD Principales

**Perfiles de Usuario:**

```typescript
// Obtener perfil
const profile = await getUserProfile(userId);

// Crear o actualizar perfil
const profile = await createOrUpdateUserProfile(userId, profileData);

// Actualizar perfil existente
const updatedProfile = await updateUserProfile(userId, updates);
```

**Gestión de Objetivos:**

```typescript
// Obtener objetivo activo
const activeGoal = await getActiveUserGoal(userId);

// Crear nuevo objetivo (desactiva anteriores automáticamente)
const goal = await createUserGoal(goalData);

// Cambiar objetivo activo
const success = await setActiveGoal(userId, goalId);
```

**Registro de Peso:**

```typescript
// Crear/actualizar entrada de peso (upsert por fecha)
const entry = await createWeightEntry({
  user_id: userId,
  weight: 70.5,
  date: "2024-01-15",
});

// Obtener último peso registrado
const latestWeight = await getLatestWeight(userId);

// Obtener historial completo
const weightHistory = await getWeightEntries(userId);
```

#### Función Auxiliar Completa

```typescript
// Obtener todos los datos de usuario en una sola llamada
const completeData = await getCompleteUserData(userId);

// Retorna:
// {
//   profile: UserProfile | null,
//   goals: UserGoal[],
//   activeGoal: UserGoal | null,
//   weightEntries: WeightEntry[],
//   latestWeight: WeightEntry | null
// }
```

---

## Gestión de Estado

### Arquitectura con Nanostores

#### Store de Autenticación (`src/stores/authStore.ts`)

```typescript
// Estados reactivos
export const $user = atom<User | null>(null);
export const $session = atom<Session | null>(null);
export const $loading = atom<boolean>(true);
export const $isAuthenticated = computed($user, (user) => !!user);
```

#### Store de Perfil de Usuario (`src/stores/userProfileStore.ts`)

```typescript
// Datos del usuario con persistencia automática
export const $userData = map<UserData | null>(null);
export const $userGoal = map<UserGoal>(defaultGoal);
export const $weightLog = map<Record<string, WeightEntry>>({});

// Computed store para objetivos nutricionales
export const $nutritionalGoals = computed(
  [$userData, $userGoal],
  (userData, userGoal) => {
    // Cálculo automático de:
    // - Calorías objetivo
    // - Proteínas recomendadas
    // - Distribución de macronutrientes
  }
);
```

#### Store del Planificador (`src/stores/planStore.ts`)

```typescript
// Plan semanal con persistencia en localStorage
export const $plan = map<WeeklyPlan>({});

// Funciones de actualización
updateMealPlan(dayId, mealType, mealPlan);
updateSnackPlan(dayId, snackPlan);
updateSupplementPlan(dayId, supplementPlan);
```

### Sincronización Automática

#### Persistencia Local

- **localStorage**: Backup local de datos críticos
- **Sincronización bidireccional**: Supabase ↔ localStorage
- **Offline-first**: Funcionalidad básica sin conexión

#### Flujo de Sincronización

1. **Login**: Cargar datos desde Supabase → stores locales
2. **Modificaciones**: Actualizar Supabase + localStorage simultáneamente
3. **Logout**: Limpiar stores y localStorage
4. **Reconexión**: Sincronizar cambios pendientes

---

## Sistema de Autenticación

### Proveedores Soportados

#### OAuth Providers

- **Google**: `signInWithOAuth('google')`
- **GitHub**: `signInWithOAuth('github')`
- **Apple**: `signInWithOAuth('apple')`

#### Email/Password

```typescript
// Registro
const result = await signUp(email, password);

// Login
const result = await signIn(email, password);

// Recuperación de contraseña
const result = await resetPassword(email);
```

### Gestión de Sesiones

#### Configuración de Sesión

```typescript
// Configuración automática
autoRefreshToken: true,    // Renovación automática
persistSession: true,      // Persistencia entre sesiones
detectSessionInUrl: true,  // Detección de callbacks OAuth
```

#### Listeners de Estado

```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  switch (event) {
    case "SIGNED_IN":
      // Cargar datos de usuario
      await loadUserDataFromSupabase(session.user.id);
      break;
    case "SIGNED_OUT":
      // Limpiar datos locales
      clearLocalStorage();
      break;
  }
});
```

### Eliminación de Cuenta

```typescript
// Función RPC en Supabase para eliminación completa
const { data, error } = await supabase.rpc("delete_user_account");

// Limpieza automática de:
// - Perfil de usuario
// - Objetivos relacionados
// - Registros de peso
// - Sesión activa
// - Datos OAuth (si aplica)
```

---

## Migración de Datos

### Sistema de Migración Automática

El sistema migra automáticamente datos desde localStorage a Supabase durante el primer login.

#### Proceso de Migración (`src/services/migrationService.ts`)

```typescript
export const migrateLocalDataToSupabase = async (
  userId: string,
  userEmail: string
) => {
  // 1. Verificar datos existentes en Supabase
  const existingProfile = await getUserProfile(userId);

  // 2. Obtener datos locales
  const localData = getLocalStorageData();

  // 3. Migrar perfil (si no existe o está incompleto)
  if (localData.userData && needsProfileMigration(existingProfile)) {
    await migrateUserProfile(localData.userData, userId, userEmail);
  }

  // 4. Migrar objetivos
  if (localData.userGoal) {
    await migrateUserGoal(localData.userGoal, userId);
  }

  // 5. Migrar registros de peso
  if (localData.weightLog) {
    await migrateWeightEntries(localData.weightLog, userId);
  }

  // 6. Limpiar localStorage tras migración exitosa
  clearLocalStorageData();
};
```

#### Conversión de Formatos

```typescript
// localStorage → Supabase
const convertUserDataToProfile = (
  userData: LocalUserData
): UserProfileInsert => ({
  id: userId,
  email: userEmail,
  weight: userData.weight,
  height: userData.height,
  age: userData.age,
  gender: userData.gender,
  steps: userData.steps,
  does_strength_training: userData.doesStrengthTraining,
  strength_training_days: userData.strengthTrainingDays,
});
```

#### Detección de Datos Pendientes

```typescript
export const hasLocalDataToMigrate = (): boolean => {
  const localData = getLocalStorageData();

  return !!(
    (localData.userData && localData.userData.weight) ||
    (localData.userGoal && localData.userGoal.startDate) ||
    (localData.weightLog && Object.keys(localData.weightLog).length > 0)
  );
};
```

---

## Flujo de Datos

### Diagrama de Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │   NANOSTORES     │    │   SUPABASE      │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │◄┼────┼►│ Auth Store   │◄┼────┼►│ auth.users  │ │
│ └─────────────┘ │    │ └──────────────┘ │    │ └─────────────┘ │
│                 │    │                  │    │                 │
│ ┌─────────────┐ │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ │ Profile     │◄┼────┼►│ Profile Store│◄┼────┼►│user_profiles│ │
│ │ Forms       │ │    │ └──────────────┘ │    │ └─────────────┘ │
│ └─────────────┘ │    │                  │    │                 │
│                 │    │ ┌──────────────┐ │    │ ┌─────────────┐ │
│ ┌─────────────┐ │    │ │ Plan Store   │◄┼────┼►│ localStorage│ │
│ │ Planner     │◄┼────┼►│              │ │    │ └─────────────┘ │
│ │ Components  │ │    │ └──────────────┘ │    │                 │
│ └─────────────┘ │    │                  │    │ ┌─────────────┐ │
└─────────────────┘    └──────────────────┘    │ │user_goals   │ │
                                               │ │weight_entries│ │
                                               │ └─────────────┘ │
                                               └─────────────────┘
```

### Flujos de Datos Principales

#### 1. Autenticación y Carga Inicial

```
Usuario Login → Auth Store → Database Service → Load User Data → Profile Store
```

#### 2. Actualización de Perfil

```
Form Update → Profile Store → Database Service → Supabase → localStorage backup
```

#### 3. Planificación de Comidas

```
Planner Update → Plan Store → localStorage → (Sin sincronización a Supabase)
```

#### 4. Registro de Peso

```
Weight Entry → Profile Store → Database Service → Supabase + localStorage
```

---

## Seguridad y Permisos

### Row Level Security (RLS)

#### Políticas Implementadas

```sql
-- user_profiles: Los usuarios solo pueden acceder a sus propios datos
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- user_goals: Acceso restringido por user_id
CREATE POLICY "Users can manage own goals" ON user_goals
  FOR ALL USING (auth.uid() = user_id);

-- weight_entries: Acceso restringido por user_id
CREATE POLICY "Users can manage own weight entries" ON weight_entries
  FOR ALL USING (auth.uid() = user_id);
```

### Validación de Datos

#### Nivel de Base de Datos

- **CHECK constraints**: Validación de tipos de objetivo y género
- **UNIQUE constraints**: Prevención de duplicados
- **NOT NULL**: Campos obligatorios
- **Foreign Keys**: Integridad referencial

#### Nivel de Aplicación

```typescript
// Validación de entrada en servicios
const validateUserData = (data: UserProfileUpdate) => {
  if (data.weight && (data.weight < 20 || data.weight > 300)) {
    throw new Error("Peso debe estar entre 20 y 300 kg");
  }

  if (data.height && (data.height < 100 || data.height > 250)) {
    throw new Error("Altura debe estar entre 100 y 250 cm");
  }
};
```

### Manejo de Errores

```typescript
// Errores tipados de Supabase
if (error) {
  switch (error.code) {
    case "PGRST116":
      // Registro no encontrado - normal
      return null;
    case "23505":
      // Violación de constraint único
      throw new Error("Ya existe un registro para esta fecha");
    default:
      console.error("Error de base de datos:", error);
      throw new Error("Error al acceder a los datos");
  }
}
```

---

## Mejores Prácticas

### Gestión de Estado

#### 1. Separación de Responsabilidades

- **Auth Store**: Solo autenticación y sesiones
- **Profile Store**: Datos de usuario y objetivos nutricionales
- **Plan Store**: Planificación de comidas (local únicamente)

#### 2. Computed Stores para Cálculos

```typescript
// Objetivos nutricionales calculados automáticamente
export const $nutritionalGoals = computed(
  [$userData, $userGoal],
  (userData, userGoal) => NutritionService.calculateGoals(userData, userGoal)
);
```

#### 3. Persistencia Inteligente

- **Datos críticos**: Supabase + localStorage
- **Datos temporales**: Solo localStorage
- **Cache**: Invalidación automática al cambiar usuario

### Performance

#### 1. Carga Lazy de Datos

```typescript
// Cargar datos solo cuando se necesiten
const loadUserDataOnDemand = async (userId: string) => {
  if (!lastLoadedUserId || lastLoadedUserId !== userId) {
    await loadUserDataFromSupabase(userId);
  }
};
```

#### 2. Batch Operations

```typescript
// Cargar todos los datos relacionados en una operación
const completeData = await Promise.all([
  getUserProfile(userId),
  getUserGoals(userId),
  getWeightEntries(userId),
]);
```

#### 3. Optimización de Queries

```typescript
// Usar single() para consultas que esperan un resultado
const profile = await supabase
  .from("user_profiles")
  .select("*")
  .eq("id", userId)
  .single(); // Más eficiente que usar [0]
```

### Manejo de Errores

#### 1. Graceful Degradation

```typescript
// Continuar funcionando aunque falle la carga de datos
try {
  await loadUserDataFromSupabase(userId);
} catch (error) {
  console.warn("Error cargando datos remotos, usando datos locales");
  // La aplicación sigue funcionando con datos locales
}
```

#### 2. Retry Logic

```typescript
const retryOperation = async (
  operation: () => Promise<any>,
  maxRetries = 3
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, i))
      );
    }
  }
};
```

### Seguridad

#### 1. Validación Defensiva

```typescript
// Siempre validar IDs de usuario
const ensureUserAccess = (userId: string, sessionUserId: string) => {
  if (userId !== sessionUserId) {
    throw new Error("Acceso no autorizado");
  }
};
```

#### 2. Limpieza de Datos Sensibles

```typescript
// Limpiar datos al cerrar sesión
export const signOut = async () => {
  // ... logout logic
  clearLocalStorage();
  clearUserStores();
  // Limpiar también cookies OAuth si es necesario
};
```

---

## Conclusión

Esta arquitectura proporciona:

✅ **Escalabilidad**: Arquitectura modular y servicios bien definidos  
✅ **Seguridad**: RLS, validación de datos y manejo seguro de sesiones  
✅ **Performance**: Carga lazy, batch operations y caching inteligente  
✅ **Experiencia de Usuario**: Funcionalidad offline y sincronización automática  
✅ **Mantenibilidad**: Código tipado, separación de responsabilidades y documentación

La implementación actual es robusta y está preparada para escalar con el crecimiento de la aplicación y la base de usuarios.
