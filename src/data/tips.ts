// src/data/tips.ts
import type { Tip } from "../types";

// Datos de tips - solo información, sin funciones de utilidad
export const allTips: Tip[] = [
  {
    id: "batido-verde",
    title: 'Potencia tus Batidos con "Verde Escondido"',
    content: `<p>Añade un puñado pequeño de <strong>espinacas frescas</strong> a tus batidos. Su sabor es prácticamente imperceptible una vez mezclado, pero añade fibra, vitaminas y minerales sin apenas calorías.</p>`,
    tags: ["Batidos", "Nutrición"],
  },
  {
    id: "batido-cremoso",
    title: "Cremosidad y Grasas Saludables para tus Batidos",
    content: `<p>Para una textura más cremosa y un aporte de grasas saludables, añade <strong>medio aguacate pequeño</strong> o una cucharada de <strong>semillas de chía o lino</strong>. Úsalos con moderación para controlar las calorías.</p>`,
    tags: ["Batidos", "Control Calórico"],
  },
  {
    id: "snack-lacteos",
    title: "Tentempié: Lácteos Proteicos",
    content: `<p>Un bol de 150-200g de <strong>yogur griego natural 0%</strong> o <strong>queso fresco batido 0%</strong> es un tentempié ideal. Puedes acompañarlo con un puñado de frutos rojos (fresas, arándanos) para un toque antioxidante y bajo en azúcar.</p>`,
    tags: ["Tentempiés", "Proteína"],
  },
  {
    id: "snack-huevos",
    title: "Tentempié: Huevos Cocidos",
    content: `<p>Un huevo duro es el tentempié perfecto: fácil de transportar, saciante y puramente proteico. Es una gran estrategia cocer varios al inicio de la semana para tenerlos siempre a mano.</p>`,
    tags: ["Tentempiés", "Batch Cooking", "Proteína"],
  },
  {
    id: "compra-planificada",
    title: "Compra Inteligente: Planificación Semanal",
    content: `<p>Antes de ir al supermercado, diseña tu menú y elabora una <strong>lista de la compra detallada</strong>. Ceñirte a ella evita compras impulsivas, reduce el desperdicio y te asegura tener todo lo necesario, ahorrando tiempo y dinero.</p>`,
    tags: ["Compra", "Ahorro"],
  },
  {
    id: "batch-cooking-verduras",
    title: "Batch Cooking: Verduras Asadas",
    content: `<p>Dedica un tiempo el fin de semana a preparar una bandeja grande de verduras asadas (pimientos, cebolla, calabacín, brócoli...). Serán la guarnición perfecta, base para ensaladas o relleno de tortillas durante toda la semana.</p>`,
    tags: ["Batch Cooking", "Cocina Práctica"],
  },
  {
    id: "control-grasas",
    title: "Control Calórico: Ajuste de Grasas Añadidas",
    content: `<p>Las grasas son muy densas calóricamente. Es vital <strong>medir el aceite de oliva con cuchara</strong> (o usar un pulverizador) en lugar de verterlo directamente. Un pequeño gesto puede ahorrar cientos de calorías a la semana.</p>`,
    tags: ["Control Calórico", "Ahorro"],
  },
  {
    id: "control-porciones",
    title: "Control Calórico: La Importancia de las Porciones",
    content: `<p>Es la herramienta más directa y efectiva. Aunque los ingredientes sean saludables, la cantidad importa. Sé estricto con las cantidades de proteínas y carbohidratos, y recuerda que las verduras no amiláceas pueden consumirse con más libertad. Usar platos de tamaño moderado ayuda visualmente.</p>`,
    tags: ["Control Calórico", "Cocina Práctica"],
  },
];
