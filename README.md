# 🍏 Planificador de Dieta ALPHA

Una aplicación web moderna para planificar y gestionar tu alimentación diaria, diseñada con Astro, Preact y NanoStores para un rendimiento óptimo y gestión de estado eficiente.

[![Astro](https://img.shields.io/badge/Astro-5.0-FF5D01?logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Preact](https://img.shields.io/badge/Preact-10.0-673AB8?logo=preact)](https://preactjs.com/)
[![NanoStores](https://img.shields.io/badge/NanoStores-0.9-4F46E5)](https://github.com/nanostores/nanostores)

## 🚀 Características Principales

- 📅 Planificación semanal de comidas interactiva
- 📊 Seguimiento de macronutrientes y calorías
- 📈 Gráficos de progreso de peso y objetivos
- 🎯 Gestión de objetivos de peso personalizados
- 🔄 Sincronización automática con localStorage
- 📱 Diseño responsive para todos los dispositivos
- ⚡ Rendimiento optimizado con Astro
- 🛠️ Panel de administración de comidas y suplementos

## 🆕 Novedades

- **Sistema de Gestión de Estado** con NanoStores para una experiencia de usuario fluida
- **Persistencia de Datos** - Tus planes y configuraciones se guardan automáticamente
- **Modo Edición** - Edita tus objetivos y preferencias fácilmente
- **Análisis Nutricional** - Visualiza tu ingesta calórica y de macronutrientes
- **Soporte Offline** - Accede a tus planes sin conexión

## 🛠️ Tecnologías Utilizadas

- **Framework**: Astro 5.0
- **UI**: Tailwind CSS 3.4
- **Componentes**: Preact 10.0
- **Gestión de Estado**: NanoStores
- **Gráficos**: Chart.js 4.4
- **Tipado**: TypeScript
- **Formateo de Código**: Prettier + ESLint

## 📦 Estructura del Proyecto

```
/src/
├── components/    # Componentes reutilizables
│   ├── ui/        # Componentes de UI básicos
│   └── planner/   # Componentes del planificador
├── data/          # Datos de comidas y suplementos
├── hooks/         # Custom Hooks
├── layouts/       # Plantillas de diseño
├── pages/         # Páginas de la aplicación
├── stores/        # Stores de NanoStores
│   ├── planStore.ts      # Gestión del plan de comidas
│   └── userProfileStore.ts # Perfil y objetivos del usuario
└── styles/        # Estilos globales
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

| Comando             | Descripción                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Inicia el servidor de desarrollo         |
| `npm run build`     | Genera la versión de producción estática |
| `npm run preview`   | Previsualiza la versión de producción    |
| `npm run format`    | Formatea el código automáticamente       |
| `npm run lint`      | Ejecuta el linter                        |
| `npm run astro ...` | Ejecuta comandos de la CLI de Astro      |

## 📝 Uso

1. **Configura tu perfil** - Ingresa tus datos personales y objetivos
2. **Planifica tus comidas** - Arrastra y suelta comidas en el planificado
3. **Ajusta tus objetivos** - Modifica tus objetivos de peso y nutrición
4. **Revisa tu progreso** - Visualiza tus estadísticas y ajusta según sea necesario
5. **Genera tu lista de compras** - Basada en tu planificación semanal

## 📬 Contacto

¿Preguntas o sugerencias? ¡No dudes en abrir un issue o contactarme directamente!

---

Desarrollado con ❤️ por Samuhlo | [@samuhlo](https://github.com/samuhlo)
