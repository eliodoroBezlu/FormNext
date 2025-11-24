export const chartColors = {
  // =========================================================================
  // COLORES ESPECÍFICOS PARA TU DASHBOARD DE EXTINTORES
  // =========================================================================
  
  // 🥧 COLORES PARA GRÁFICAS DE TORTA/PIE - Por Área
  tortaPrimario: '#6f6bc2',      // 🔵 Púrpura azulado - Chancado
  tortaSecundario: '#69c98d',    // 🟢 Verde esmeralda - Molienda  
  tortaTerciario: '#ea7d29',     // 🟠 Naranja - Flotacion
  tortaCuaternario: '#3498db',   // 🔵 Azul - Otros áreas
  tortaQuinario: '#f39c12',      // 🟡 Amarillo - Áreas adicionales
  tortaSexto: '#9b59b6',         // 🟣 Púrpura intenso - Áreas extra
  tortaSeptimo: '#1abc9c',       // 🟢 Verde turquesa - Áreas especiales
  
  // 📊 COLORES PARA GRÁFICAS DE BARRAS - Estado por Ubicación
  barraTotal: '#6f6bc2',         // 🔵 Púrpura - Total de extintores
  barraInspeccionados: '#69c98d', // 🟢 Verde - Inspeccionados (éxito)
  barraActivos: '#3498db',       // 🔵 Azul - Activos (información)
  barraPendientes: '#ea7d29',    // 🟠 Naranja - Pendientes (advertencia)
  barraCompletados: '#27ae60',   // 🟢 Verde éxito - Completados
  barraEnProceso: '#f1c40f',     // 🟡 Amarillo proceso - En progreso
  
  // 📈 COLORES PARA MÉTRICAS PRINCIPALES (tarjetas superiores)
  metricaTotal: '#6f6bc2',       // 🔵 Púrpura - Total Extintores
  metricaInspeccionados: '#69c98d', // 🟢 Verde - Inspeccionados
  metricaPendientes: '#ea7d29',  // 🟠 Naranja - Pendientes
  metricaActivos: '#3498db',     // 🔵 Azul - Activos
  
  // 🚨 COLORES PARA ESTADOS Y ALERTAS
  estadoSuccess: '#27ae60',      // 🟢 Verde éxito - Completado
  estadoWarning: '#f39c12',      // 🟡 Amarillo advertencia - Pendiente
  estadoError: '#e74c3c',        // 🔴 Rojo error - Crítico
  estadoInfo: '#3498db',         // 🔵 Azul información - En progreso
  estadoNeutral: '#95a5a6',      // ⚫ Gris neutral - Inactivo

  // 🎨 COLORES BASE PARA LA APLICACIÓN
  colorAcento: '#ea7d29',        // 🟠 Naranja acento - Botones, highlights
  colorFondoOscuro: '#1e293b',   // ⚫ Fondo oscuro - Fondos principales
  colorFondoClaro: '#303952',    // 🔵 Fondo claro - Cards, contenedores
  colorFondoMedio: '#1b202e',    // ⚫ Fondo medio - Borders, separadores
  colorFondoDefault: '#0f172a',  // ⚫ Fondo default - App background
  colorPrimario: '#3b82f6',      // 🔵 Azul primario - Links, acciones principales
  colorSecundario: '#334155',    // 🔵 Gris azulado - Texto secundario
  colorTextoPrimario: '#ffffff', // ⚪ Texto primario - Texto principal
  colorTextoSecundario: '#94a3b8', // 🔵 Texto secundario - Texto menos importante
  colorBlancoVerdadero: '#ffffff', // ⚪ Blanco verdadero - Texto sobre oscuro
  colorFaltante: '#190f2aff',        // ⚫ "Blanco" (en modo oscuro) - Fondo claro

  // 🔧 COLORES TÉCNICOS Y COMPLEMENTARIOS
  colorError: '#e74c3c',         // 🔴 Error - Estados de falla
  colorInfo: '#3498db',          // 🔵 Info - Información general
  colorAdvertencia: '#f39c12',   // 🟡 Advertencia - Alertas medias
  colorExito: '#27ae60',         // 🟢 Éxito - Estados positivos
  colorPrimarioAlt: '#303952',   // 🔵 Primario alternativo - Variantes
  colorPapelBg: '#1e293b',       // ⚫ Fondo de papel - Background de cards

} as const;

// =============================================================================
// ARRAYS ORGANIZADOS PARA USO DIRECTO EN GRÁFICAS
// =============================================================================

// 🥧 COLORS PARA GRÁFICA DE TORTA - Por Área (7 colores)
export const tortaColors = [
  chartColors.tortaPrimario,     // Chancado
  chartColors.tortaSecundario,   // Molienda
  chartColors.tortaTerciario,    // Flotacion
  chartColors.tortaCuaternario,  // Otras áreas
  chartColors.tortaQuinario,     // Áreas adicionales
  chartColors.tortaSexto,        // Áreas extra
  chartColors.tortaSeptimo,      // Áreas especiales
];

// 📊 COLORS PARA GRÁFICA DE BARRAS - Estado por Ubicación (6 colores)
export const barraColors = [
  chartColors.barraTotal,        // Barra Total
  chartColors.barraInspeccionados, // Barra Inspeccionados
  chartColors.barraActivos,      // Barra Activos
  chartColors.barraPendientes,   // Barra Pendientes
  chartColors.barraCompletados,  // Barra Completados
  chartColors.barraEnProceso,    // Barra En Proceso
];

// 🎯 COLORS PARA MÉTRICAS PRINCIPALES (tarjetas)
export const metricaColors = [
  chartColors.metricaTotal,      // Métrica Total
  chartColors.metricaInspeccionados, // Métrica Inspeccionados
  chartColors.metricaPendientes, // Métrica Pendientes
  chartColors.metricaActivos,    // Métrica Activos
];

// 🚨 COLORS PARA ESTADOS (alertas y progresos)
export const estadoColors = {
  success: chartColors.estadoSuccess,
  warning: chartColors.estadoWarning,
  error: chartColors.estadoError,
  info: chartColors.estadoInfo,
  neutral: chartColors.estadoNeutral,
};