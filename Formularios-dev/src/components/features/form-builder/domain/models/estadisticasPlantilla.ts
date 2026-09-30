import type { Question, Section, SimpleSection } from "@/types/formTypes";

/**
 * Cuentas de una plantilla IRO/ISOP en construcción. TypeScript puro.
 *
 * Las usan los contadores de la cabecera, el resumen de imágenes y el botón
 * de guardar. Cada uno las calcula dentro de su propio componente, que es el
 * único que se vuelve a dibujar al escribir: por eso están separadas de la
 * vista y no en la raíz del constructor.
 */

export interface EstadisticasImagenes {
  total: number;
  /** Ya convertidas a base64: listas para guardar. */
  listas: number;
  /** Todavía como `blob:`, procesándose. */
  procesando: number;
  tamanoKB: number;
}

/** Preguntas de una sección, contando las de sus subsecciones. */
export function preguntasDeSeccion(seccion: Section | undefined): number {
  if (!seccion) return 0;
  return (
    (seccion.questions?.length ?? 0) +
    (seccion.subsections ?? []).reduce((t, s) => t + preguntasDeSeccion(s), 0)
  );
}

/** Puntaje máximo de una sección, sumando el de sus subsecciones. */
export function puntosDeSeccion(seccion: Section | undefined): number {
  if (!seccion) return 0;
  return (
    (Number(seccion.maxPoints) || 0) +
    (seccion.subsections ?? []).reduce((t, s) => t + puntosDeSeccion(s), 0)
  );
}

export function totalPreguntas(
  secciones: Section[] = [],
  seccionesImagen: SimpleSection[] = [],
): number {
  return (
    secciones.reduce((t, s) => t + preguntasDeSeccion(s), 0) +
    seccionesImagen.reduce((t, s) => t + (s.questions?.length ?? 0), 0)
  );
}

export function totalPuntos(secciones: Section[] = []): number {
  return secciones.reduce((t, s) => t + puntosDeSeccion(s), 0);
}

export function estadisticasImagenes(
  seccionesImagen: SimpleSection[] = [],
): EstadisticasImagenes {
  const stats: EstadisticasImagenes = { total: 0, listas: 0, procesando: 0, tamanoKB: 0 };
  for (const seccion of seccionesImagen) {
    for (const pregunta of seccion.questions ?? []) {
      if (!pregunta.image) continue;
      stats.total++;
      if (pregunta.image.startsWith("data:image/")) {
        stats.listas++;
        stats.tamanoKB += Math.round((pregunta.image.length * 3) / 4 / 1024);
      } else if (pregunta.image.startsWith("blob:")) {
        stats.procesando++;
      }
    }
  }
  return stats;
}

/**
 * Completa `obligatorio` en las preguntas que no lo traen (plantillas
 * anteriores al campo), recorriendo las subsecciones.
 *
 * Antes lo hacía un efecto en cada sección que se ejecutaba **en cada tecla**
 * y reescribía la pregunta con `update` del field array; ahora se hace una
 * sola vez, al cargar la plantilla.
 */
export function normalizarSecciones(secciones: Section[] = []): Section[] {
  return secciones.map((s) => ({
    ...s,
    questions: (s.questions ?? []).map(
      (q: Question): Question => ({ ...q, obligatorio: Boolean(q.obligatorio) }),
    ),
    subsections: s.subsections ? normalizarSecciones(s.subsections) : s.subsections,
  }));
}
