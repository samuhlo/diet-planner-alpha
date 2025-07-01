# 👤 Sistema de Perfil de Usuario

## Descripción General

Hemos implementado un sistema completo de gestión de perfil de usuario que centraliza todas las configuraciones y datos personales en una interfaz clara y organizada.

## 🚀 Características Principales

### 📋 Dos Pestañas Organizadas

#### 1. **Datos y Análisis**

- **Datos Físicos**: Peso, altura, edad, género
- **Actividad**: Sistema de pasos diarios (mantiene funcionamiento original)
- **Entrenamiento de Fuerza**: Checkbox y días por semana
- **Objetivos de Peso**: Tipo de objetivo, peso objetivo, fechas de inicio y fin
- **Análisis en Tiempo Real**: BMR, TDEE, análisis de realismo del objetivo
- **Validaciones**: Rangos lógicos para todos los campos numéricos
- **Persistencia Automática**: Los cambios se guardan directamente en Supabase
- **Sincronización**: Compatible con stores locales para análisis

#### 2. **Perfil Personal**

- **Información Personal**: Nombre completo y avatar
- **Gestión de Email**: Cambio de email con verificación
- **Cambio de Contraseña**: Verificación de contraseña actual y validaciones de seguridad
- **Vista Previa de Avatar**: Muestra la imagen del avatar en tiempo real

### 🎨 Interfaz de Usuario

- **Diseño con Tabs**: Navegación clara entre secciones
- **Mensajes de Estado**: Feedback inmediato de éxito/error
- **Validaciones en Tiempo Real**: Prevención de errores antes del envío
- **Diseño Responsive**: Funciona perfectamente en móvil y desktop
- **Consistencia Visual**: Siguiendo el theme de la aplicación

### 🔧 Funcionalidades Técnicas

- **Integración Completa con Supabase**: Tanto Auth como Database
- **Actualizaciones en Tiempo Real**: Los cambios se reflejan inmediatamente
- **Gestión de Estados**: Loading, error y success states
- **Validación de Contraseñas**: Verificación de contraseña actual antes del cambio
- **Manejo de Errores**: Mensajes claros para el usuario

## 📁 Estructura de Archivos

```
src/components/
├── common/
│   └── Tabs.tsx              # Componente reutilizable de pestañas
├── profile/
│   ├── UserProfile.tsx       # Componente principal del perfil
│   ├── AppDataForm.tsx       # Formulario para datos de la aplicación
│   └── ProfileDataForm.tsx   # Formulario para datos personales
└── ui/
    └── Header.tsx            # Actualizado con menú de usuario

src/pages/
└── profile.astro           # Página del perfil

src/types/
└── database.ts             # Tipos actualizados con nuevos campos
```

## 🎯 Acceso al Perfil

### Desde el Header

1. **Menú de Usuario**: Clic en el avatar/información del usuario
2. **Opción "Mi Perfil"**: Navegación directa desde el menú desplegable
3. **URL Directa**: `/profile`

### Estados de Autenticación

- **Usuario No Autenticado**: Redirección automática a login
- **Usuario Autenticado**: Acceso completo a todas las funcionalidades

## 🔄 Flujo de Uso

### 1. Configuración Inicial

1. Usuario hace login/signup
2. Accede a "Mi Perfil" desde el header
3. Completa sus datos en ambas pestañas

### 2. Gestión de Datos de la App

1. Navega a "Datos de la App"
2. Introduce peso, altura, edad, etc.
3. Configura objetivos de peso
4. Guarda cambios (se reflejan inmediatamente)

### 3. Gestión del Perfil Personal

1. Navega a "Perfil Personal"
2. Actualiza nombre y avatar
3. Cambia email (con verificación)
4. Actualiza contraseña (con validación)

## 🛡️ Seguridad y Validaciones

### Validaciones de Datos

- **Peso**: 1-500 kg
- **Altura**: 1-300 cm
- **Edad**: 1-120 años
- **Email**: Formato válido
- **Contraseña**: Mínimo 6 caracteres

### Seguridad

- **Verificación de Contraseña**: Reautenticación antes del cambio
- **Validación de Emails**: Confirmación por correo electrónico
- **Row Level Security**: Cada usuario solo ve sus datos
- **Sanitización**: Validación en frontend y backend

## 🔄 Migración desde el Sistema Anterior

### Cambios Realizados

1. **Integración Completa**: Se respetó completamente la funcionalidad existente
2. **Sistema de Pasos**: Mantiene el funcionamiento original (pasos diarios, no niveles)
3. **Entrenamiento de Fuerza**: Conserva checkbox y días por semana
4. **Análisis de Objetivos**: Integra el ObjectiveAnalysis existente
5. **Stores Locales**: Mantiene compatibilidad para análisis en tiempo real

### Elementos Eliminados

- ❌ **Sección "Mis Datos"** del navigation principal
- ❌ **UserData.astro** y componentes duplicados
- ❌ **Navegación dispersa** reemplazada por perfil centralizado

### Compatibilidad

- ✅ **UserDataForm**: Funcionalidad integrada en AppDataForm
- ✅ **GoalForm**: Lógica integrada en la sección de objetivos
- ✅ **ObjectiveAnalysis**: Incluido en tiempo real
- ✅ **Stores**: Sincronización automática con localStorage para compatibilidad

### 🔧 Problema de Sincronización SOLUCIONADO

**❌ Problema anterior**: La aplicación usaba localStorage como fuente principal, causando inconsistencias.

**✅ Solución implementada**:

1. **Base de datos como fuente única**: Todos los datos se cargan desde Supabase
2. **Campos agregados a BD**: `steps`, `does_strength_training`, `strength_training_days`
3. **Sincronización correcta**: localStorage solo para compatibilidad temporal
4. **Persistencia real**: Todos los cambios se guardan inmediatamente en BD

> ⚠️ **MIGRACIÓN REQUERIDA**: Ver `MIGRATION_INSTRUCTIONS.md` para aplicar los cambios de BD necesarios.

## 🔗 Integración con Base de Datos

### Tabla Actualizada: `user_profiles`

```sql
- full_name: TEXT           -- Nuevo campo
- avatar_url: TEXT          -- Nuevo campo
- weight: NUMERIC
- height: NUMERIC
- age: INTEGER
- activity_level: TEXT
- gender: TEXT
```

### Funciones Utilizadas

- `getUserProfile()`: Obtener datos del perfil
- `updateUserProfile()`: Actualizar información personal
- `createUserGoal()`: Crear nuevos objetivos
- `updateUserGoal()`: Actualizar objetivos existentes
- `getActiveUserGoal()`: Obtener objetivo activo

## 📱 Experiencia de Usuario

### Ventajas del Nuevo Sistema

1. **Centralización**: Todo en un solo lugar
2. **Organización**: Separación clara entre tipos de datos
3. **Feedback Inmediato**: Confirmaciones y errores claros
4. **Persistencia**: Los cambios se guardan automáticamente
5. **Navegación Intuitiva**: Fácil acceso desde cualquier parte

### Mejoras sobre el Sistema Anterior

- ❌ **Antes**: Sección "Mis Datos" separada y dispersa
- ✅ **Ahora**: Todo centralizado en perfil accesible desde header
- ❌ **Antes**: Análisis separado del formulario de datos
- ✅ **Ahora**: Análisis en tiempo real mientras editas
- ❌ **Antes**: Navegación confusa entre diferentes secciones
- ✅ **Ahora**: Tabs claros que agrupan funcionalidad relacionada
- ❌ **Antes**: Sin persistencia automática en Supabase
- ✅ **Ahora**: Guarda automáticamente y sincroniza stores locales
- ❌ **Antes**: Feedback limitado al usuario
- ✅ **Ahora**: Mensajes claros de estado y validaciones

## 🚀 Para Desarrolladores

### Expandir Funcionalidad

El sistema está diseñado para ser extensible:

1. **Nuevas Pestañas**: Agregar fácilmente más secciones
2. **Nuevos Campos**: Extender formularios existentes
3. **Validaciones**: Agregar reglas de validación personalizadas
4. **Integraciones**: Conectar con servicios externos (subida de archivos, etc.)

### Ejemplo de Nueva Pestaña

```tsx
const tabs = [
  // ... tabs existentes
  {
    id: "notifications",
    label: "Notificaciones",
    content: <NotificationSettings />,
  },
];
```

¡El sistema de perfil está completamente funcional y listo para usar! 🎉
