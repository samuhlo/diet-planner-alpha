# 🍏 Planificador de Dieta ALPHA

Una aplicación web moderna para planificar y gestionar tu alimentación diaria, diseñada con Astro, Preact y NanoStores para un rendimiento óptimo y gestión de estado eficiente.

[![Astro](https://img.shields.io/badge/Astro-5.9-FF5D01?logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Preact](https://img.shields.io/badge/Preact-10.26-673AB8?logo=preact)](https://preactjs.com/)
[![NanoStores](https://img.shields.io/badge/NanoStores-1.0-4F46E5)](https://github.com/nanostores/nanostores)

## 🚀 Características Principales

- 🔐 **Sistema de autenticación unificado** con OAuth (Google, GitHub) y email/contraseña
- 📅 Planificación semanal de comidas interactiva
- 📊 Seguimiento de macronutrientes y calorías
- 📈 Gráficos de progreso de peso y objetivos
- 🎯 Gestión de objetivos de peso personalizados
- 🗑️ **Eliminación completa de cuenta** con reutilización OAuth
- 🔄 Sincronización automática con Supabase
- 📱 Diseño responsive para todos los dispositivos
- ⚡ Rendimiento optimizado con Astro
- 🛠️ Panel de administración de comidas y suplementos
- **Soporte Offline** - Accede a tus planes sin conexión

## 🆕 Novedades

- **Sistema de Gestión de Estado** con NanoStores para una experiencia de usuario fluida
- **Persistencia de Datos** - Tus planes y configuraciones se guardan automáticamente
- **Modo Edición** - Edita tus objetivos y preferencias fácilmente
- **Análisis Nutricional** - Visualiza tu ingesta calórica y de macronutrientes

## 🛠️ Tecnologías Utilizadas

- **Framework**: Astro 5.9
- **UI**: Tailwind CSS 3.4
- **Componentes**: Preact 10.26
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth (OAuth + Email/Password)
- **Gestión de Estado**: NanoStores
- **Gráficos**: Chart.js 4.4
- **Tipado**: TypeScript
- **Ejecución de Scripts**: tsx
- **Formateo de Código**: Prettier + ESLint

## 📦 Estructura del Proyecto

```
/src/
├── components/    # Componentes de Preact y Astro reutilizables
│   ├── auth/          # Sistema de autenticación unificado (OAuth + Email)
│   ├── common/        # Componentes genéricos (ErrorBoundary, Selectores)
│   ├── gallery/       # Galerías para recetas y consejos
│   ├── modals/        # Modales de la aplicación (detalle de receta, lista de compra)
│   ├── planner/       # Componentes principales del planificador interactivo
│   ├── profile/       # Gestión de perfil y configuración de cuenta
│   ├── progress/      # Componentes para seguimiento de progreso y objetivos
│   ├── recipes/       # Componentes para visualizar y buscar recetas
│   ├── setup/         # Flujo de configuración inicial del usuario
│   ├── supplements/   # Componentes para visualizar y buscar suplementos
│   ├── tips/          # Componentes para visualizar y buscar consejos
│   └── ui/            # Componentes de UI básicos (Header, Navegación)
├── config/        # Constantes de configuración (nutricionales, de la app)
├── data/          # Datos estáticos (ingredientes, recetas, suplementos, consejos)
├── hooks/         # Custom Hooks de Preact (useBrowser, useNutritionalCalculations)
├── layouts/       # Plantillas de página de Astro
├── pages/         # Páginas de la aplicación (rutas)
├── services/      # Lógica de negocio y servicios (cálculos nutricionales)
├── stores/        # Stores de NanoStores para el manejo de estado global
│   ├── authStore.ts       # Estado de autenticación y sesión
│   ├── modalStore.ts      # Estado de los modales
│   ├── planStore.ts       # Estado del planificador semanal
│   └── userProfileStore.ts # Estado del perfil de usuario y objetivos
├── styles/        # Estilos globales (CSS)
├── types/         # Definiciones de tipos de TypeScript
└── utils/         # Funciones de utilidad (formateadores, utilidades de recetas)
```

## 🚀 Cómo Empezar

### Prerrequisitos

- Node.js 18+
- npm 9+

### Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/planificador-dieta.git
   cd planificador-dieta
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abre tu navegador en [http://localhost:4321](http://localhost:4321)

## 🛠 Comandos Disponibles

| Comando           | Descripción                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo         |
| `npm run build`   | Genera la versión de producción estática |
| `npm run preview` | Previsualiza la versión de producción    |
| `npm run astro`   | Ejecuta comandos de la CLI de Astro      |

## 📝 Uso

1. **Configura tu perfil** - Ingresa tus datos personales y objetivos
2. **Planifica tus comidas** - Arrastra y suelta comidas en el planificado
3. **Ajusta tus objetivos** - Modifica tus objetivos de peso y nutrición

## 📬 Contacto

¿Preguntas o sugerencias? ¡No dudes en abrir un issue o contactarme directamente!

---

Desarrollado con ❤️ por Samuhlo | [@samuhlo](https://github.com/samuhlo)
