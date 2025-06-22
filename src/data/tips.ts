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
  {
    id: "hidratacion-constante",
    title: "Hidratación: Tu Botella, Tu Aliada",
    content: `<p>Lleva siempre contigo una <strong>botella de agua reutilizable</strong>. Tener agua a la vista y al alcance de la mano te recordará beber constantemente a lo largo del día, manteniendo tu cuerpo y mente hidratados.</p>`,
    tags: ["Hidratación", "Hábitos Saludables"],
  },
  {
    id: "plato-harvard",
    title: 'Visualiza tu Plato Ideal con el "Plato de Harvard"',
    content: `<p>Al preparar tus comidas principales, divide tu plato mentalmente: <strong>la mitad para verduras y hortalizas</strong>, un cuarto para proteínas de calidad (pescado, legumbres, pollo) y el otro cuarto para granos integrales (arroz integral, quinoa, pan integral).</p>`,
    tags: ["Nutrición", "Planificación", "Control de Porciones"],
  },
  {
    id: "mindful-eating-inicio",
    title: "Mindful Eating: El Primer Bocado Consciente",
    content: `<p>Antes de empezar a comer, tómate un segundo. Observa los colores y olores de tu comida. Mastica el primer bocado lentamente, saboreándolo de verdad. Este simple acto <strong>conecta tu mente con tu cuerpo</strong> y mejora la digestión.</p>`,
    tags: ["Mindful Eating", "Hábitos Saludables"],
  },
  {
    id: "etiquetas-azucar",
    title: "Lee Etiquetas: Cuidado con el Azúcar Oculto",
    content: `<p>Al leer una etiqueta nutricional, no te fijes solo en las calorías. Revisa la línea de <strong>"azúcares" o "azúcares añadidos"</strong>. Te sorprenderá la cantidad de azúcar que se esconde en salsas, cereales y productos procesados.</p>`,
    tags: ["Compra", "Nutrición", "Control Calórico"],
  },
  {
    id: "mito-carbohidratos",
    title: "Mito Nutricional: Los Carbohidratos No Son el Enemigo",
    content: `<p>Tu cuerpo necesita carbohidratos para obtener energía. La clave está en elegirlos bien: prioriza las <strong>fuentes integrales y ricas en fibra</strong> como las legumbres, la avena o las patatas, en lugar de harinas y azúcares refinados.</p>`,
    tags: ["Mitos", "Nutrición", "Energía"],
  },
  {
    id: "suplementos-con-cabeza",
    title: "Suplementación: Siempre Bajo Consejo Profesional",
    content: `<p>Los suplementos no sustituyen una dieta equilibrada. Antes de tomar vitaminas, minerales o cualquier otro suplemento, <strong>consulta siempre a tu médico o a un dietista-nutricionista</strong> para evitar riesgos y asegurarte de que realmente lo necesitas.</p>`,
    tags: ["Suplementación", "Salud", "Seguridad"],
  },
  {
    id: "dieta-mediterranea",
    title: "Inspírate en la Dieta Mediterránea",
    content: `<p>Añade más <strong>pescado azul</strong> (sardinas, caballa), legumbres y frutos secos a tu semana. Usa el <strong>aceite de oliva virgen extra</strong> como grasa principal y basa tus platos en verduras y productos de temporada. Es un patrón de alimentación delicioso y cardiosaludable.</p>`,
    tags: ["Dieta Mediterránea", "Salud Cardiovascular", "Cocina Práctica"],
  },
  {
    id: "sin-distracciones",
    title: "Mindful Eating: Come Sin Pantallas",
    content: `<p>Intenta comer sin la distracción del móvil, la televisión o el ordenador. Prestar atención plena a tu comida te ayuda a <strong>reconocer mejor las señales de saciedad</strong>, disfrutar más de los sabores y evitar comer en exceso de forma automática.</p>`,
    tags: ["Mindful Eating", "Control de Porciones", "Hábitos Saludables"],
  },
  {
    id: "productos-locales-galicia",
    title: "Apuesta por lo Local: Sabores de Galicia",
    content: `<p>Aprovecha la riqueza de los <strong>productos gallegos de temporada</strong>. Visita el mercado local para encontrar las verduras, frutas y pescados más frescos. Comer local no solo apoya la economía, sino que garantiza la máxima calidad y sabor en tu plato.</p>`,
    tags: ["Compra", "Sostenibilidad", "Galicia"],
  },
];
