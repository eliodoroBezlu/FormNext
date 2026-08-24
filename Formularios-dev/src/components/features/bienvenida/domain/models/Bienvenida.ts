/**
 * Pantalla que se ve al entrar al sistema.
 *
 * TypeScript puro: sin React y sin MUI (regla 7 del CLAUDE.md). Aquí viven los
 * tipos, el catálogo y —lo importante— **cómo se decide qué se muestra**, que
 * es la única lógica de verdad del módulo.
 */

/** Claves del catálogo. Espeja `CATALOGO_ANIMACIONES` del backend. */
export type ClaveAnimacion =
  | "circular"
  | "barra"
  | "puntos"
  | "logo"
  | "casco"
  | "ninguna";

export interface OpcionAnimacion {
  clave: ClaveAnimacion;
  etiqueta: string;
  descripcion: string;
}

/**
 * El catálogo es **cerrado** y vive en el código, no en la base.
 *
 * No es una limitación por comodidad: la CSP del proyecto es
 * `default-src 'self'`, y un SVG subido por un usuario es código ejecutable.
 * La pantalla previa al login es el peor sitio posible para aceptar eso. Si
 * hace falta una animación nueva, se añade aquí, revisada.
 */
export const CATALOGO_ANIMACIONES: readonly OpcionAnimacion[] = [
  {
    clave: "circular",
    etiqueta: "Círculo",
    descripcion: "El indicador clásico. Discreto y reconocible.",
  },
  {
    clave: "barra",
    etiqueta: "Barra",
    descripcion: "Una línea de progreso en la parte superior.",
  },
  {
    clave: "puntos",
    etiqueta: "Puntos",
    descripcion: "Tres puntos que laten por turnos.",
  },
  {
    clave: "logo",
    etiqueta: "Logotipo",
    descripcion: "El logo con un latido suave. Requiere logo configurado.",
  },
  {
    clave: "casco",
    etiqueta: "Casco",
    descripcion: "Un casco de seguridad dibujándose.",
  },
  {
    clave: "ninguna",
    etiqueta: "Sin animación",
    descripcion: "Solo el mensaje. Es lo que se usa si el equipo pide menos movimiento.",
  },
] as const;

export interface BienvenidaDeArea {
  area: string;
  mensaje?: string;
  submensaje?: string;
  animacion?: ClaveAnimacion;
}

export interface ConfigBienvenida {
  activa: boolean;
  mensaje: string;
  submensaje?: string;
  animacion: ClaveAnimacion;
  logoUrl?: string;
  duracionMinimaMs: number;
  duracionMaximaMs: number;
  consejos: string[];
  mantenimiento: { activo: boolean; mensaje?: string };
  porArea: BienvenidaDeArea[];
}

/**
 * El suelo del que nunca se baja.
 *
 * Si la red falla, si la respuesta llega corrupta o si es la primera vez en
 * este dispositivo, se usa esto. **La pantalla de bienvenida jamás debe
 * impedir entrar al sistema**: es decoración sobre un proceso crítico.
 */
export const BIENVENIDA_POR_DEFECTO: ConfigBienvenida = {
  activa: true,
  mensaje: "Sistema de Inspecciones",
  submensaje: "Preparando su sesión…",
  animacion: "circular",
  duracionMinimaMs: 600,
  duracionMaximaMs: 8000,
  consejos: [],
  mantenimiento: { activo: false },
  porArea: [],
};

/** Lo que finalmente se pinta, ya resuelto. */
export interface BienvenidaResuelta {
  mensaje: string;
  submensaje?: string;
  animacion: ClaveAnimacion;
  logoUrl?: string;
  consejo?: string;
  esMantenimiento: boolean;
  duracionMinimaMs: number;
  duracionMaximaMs: number;
}

const esClaveValida = (valor: unknown): valor is ClaveAnimacion =>
  CATALOGO_ANIMACIONES.some((a) => a.clave === valor);

/**
 * Normaliza lo que llegó del servidor.
 *
 * La respuesta se cachea en el navegador y puede quedar de una versión
 * anterior del sistema, así que no se da por buena: cada campo se comprueba y
 * cae al valor por defecto si no encaja. Una animación desconocida —de una
 * versión futura, o de una caché vieja— dejaría la pantalla en blanco.
 */
export const normalizar = (crudo: unknown): ConfigBienvenida => {
  if (!crudo || typeof crudo !== "object") return BIENVENIDA_POR_DEFECTO;
  const c = crudo as Record<string, unknown>;

  const numero = (valor: unknown, porDefecto: number): number =>
    typeof valor === "number" && Number.isFinite(valor) && valor >= 0
      ? valor
      : porDefecto;

  return {
    activa: c.activa !== false,
    mensaje:
      typeof c.mensaje === "string" && c.mensaje.trim()
        ? c.mensaje
        : BIENVENIDA_POR_DEFECTO.mensaje,
    submensaje:
      typeof c.submensaje === "string" ? c.submensaje : undefined,
    animacion: esClaveValida(c.animacion)
      ? c.animacion
      : BIENVENIDA_POR_DEFECTO.animacion,
    logoUrl: typeof c.logoUrl === "string" ? c.logoUrl : undefined,
    duracionMinimaMs: numero(
      c.duracionMinimaMs,
      BIENVENIDA_POR_DEFECTO.duracionMinimaMs,
    ),
    duracionMaximaMs: numero(
      c.duracionMaximaMs,
      BIENVENIDA_POR_DEFECTO.duracionMaximaMs,
    ),
    consejos: Array.isArray(c.consejos)
      ? c.consejos.filter((t): t is string => typeof t === "string")
      : [],
    mantenimiento:
      c.mantenimiento && typeof c.mantenimiento === "object"
        ? {
            activo:
              (c.mantenimiento as Record<string, unknown>).activo === true,
            mensaje:
              typeof (c.mantenimiento as Record<string, unknown>).mensaje ===
              "string"
                ? ((c.mantenimiento as Record<string, unknown>)
                    .mensaje as string)
                : undefined,
          }
        : { activo: false },
    porArea: Array.isArray(c.porArea)
      ? (c.porArea as Record<string, unknown>[])
          .filter((a) => typeof a?.area === "string")
          .map((a) => ({
            area: a.area as string,
            mensaje: typeof a.mensaje === "string" ? a.mensaje : undefined,
            submensaje:
              typeof a.submensaje === "string" ? a.submensaje : undefined,
            animacion: esClaveValida(a.animacion) ? a.animacion : undefined,
          }))
      : [],
  };
};

const mismaArea = (a: string, b: string): boolean =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Decide qué se muestra, en este orden:
 *
 * 1. **Mantenimiento**, si está activo: pisa todo lo demás. Es un aviso de
 *    operación, no un saludo.
 * 2. **Lo del área** de la persona, campo a campo.
 * 3. **Lo general**.
 *
 * El área se pasa desde fuera y puede venir vacía: en la primera entrada de un
 * dispositivo todavía no se sabe quién entra —la pantalla se dibuja *mientras*
 * se valida la sesión—, así que se muestra el mensaje general. A partir de la
 * segunda ya se recuerda.
 */
export const resolver = (
  config: ConfigBienvenida,
  area?: string,
): BienvenidaResuelta => {
  const base = {
    logoUrl: config.logoUrl,
    duracionMinimaMs: config.duracionMinimaMs,
    duracionMaximaMs: config.duracionMaximaMs,
  };

  if (config.mantenimiento.activo) {
    return {
      ...base,
      mensaje: config.mantenimiento.mensaje?.trim() || "Sistema en mantenimiento",
      submensaje: "Vuelva a intentarlo en unos minutos.",
      animacion: "ninguna",
      esMantenimiento: true,
    };
  }

  const delArea = area
    ? config.porArea.find((a) => mismaArea(a.area, area))
    : undefined;

  return {
    ...base,
    mensaje: delArea?.mensaje?.trim() || config.mensaje,
    submensaje: delArea?.submensaje?.trim() || config.submensaje,
    animacion: delArea?.animacion ?? config.animacion,
    consejo: elegirConsejo(config.consejos),
    esMantenimiento: false,
  };
};

/**
 * Un consejo al azar, o ninguno si la lista está vacía.
 *
 * Se elige al resolver y no al pintar: si se sorteara en cada render, el texto
 * cambiaría solo mientras la persona lo está leyendo.
 */
export const elegirConsejo = (consejos: string[]): string | undefined => {
  const utiles = consejos.filter((c) => c.trim());
  if (utiles.length === 0) return undefined;
  return utiles[Math.floor(Math.random() * utiles.length)];
};
