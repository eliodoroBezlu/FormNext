/**
 * Reglas de la Carpeta virtual de inspecciones (antes «Mis inspecciones / área»). TypeScript puro:
 * sin React ni MUI, se prueba con `yarn test`.
 *
 * Cada tipo de inspección guarda quién la hizo y cuándo a su manera:
 * - Herramientas y Equipos: `submittedBy` (usuario) y `submittedAt`.
 * - IRO/ISOP: `createdBy` (usuario) y `createdAt`.
 * - Sistemas de Emergencia: un formulario por tag y semestre, con un inspector **escrito a mano**
 *   en cada mes (`meses[MES].inspector.nombre`). No hay usuario: se reconoce por el nombre.
 */

export const MESES = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
] as const;

/** Año y, opcionalmente, mes (1–12). Sin mes = todo el año. */
export interface Periodo {
  año: number;
  mes: number | null;
}

/** Por defecto, todo el año en curso: un borrador del mes pasado tiene que seguir a la vista. */
export const periodoInicial = (hoy: Date = new Date()): Periodo => ({ año: hoy.getFullYear(), mes: null });

/** Si una fecha cae en el periodo (en la hora local de quien mira). */
export function enPeriodo(fecha: string | Date | null | undefined, p: Periodo): boolean {
  if (!fecha) return false;
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return false;
  return d.getFullYear() === p.año && (p.mes === null || d.getMonth() + 1 === p.mes);
}

const tokens = (nombre: string): string[] =>
  nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);

/**
 * Si el inspector escrito a mano es esta persona. El formulario dice «Juan Perez» y el padrón
 * «PEREZ LOPEZ JUAN CARLOS»: cuenta si todas las palabras del nombre más corto están en el otro,
 * con al menos dos palabras (un solo nombre de pila es demasiado ambiguo).
 */
export function mismaPersona(escrito: string, delPadron: string): boolean {
  const a = tokens(escrito);
  const b = tokens(delPadron);
  const [corto, largo] = a.length <= b.length ? [a, b] : [b, a];
  if (corto.length < 2) return false;
  const enLargo = new Set(largo);
  return corto.every((t) => enLargo.has(t));
}

/** Lo mínimo de un formulario de Sistemas de Emergencia que se usa aquí. */
export interface FormularioEmergenciaMin {
  año: number;
  meses?: Record<string, { inspector?: { nombre?: string } } | undefined>;
}

export interface FilaEmergencia<F> {
  formulario: F;
  /** Meses del periodo con inspección (de esta persona, si se filtra por técnico). */
  meses: string[];
  inspectores: string[];
}

/**
 * Formularios de Sistemas de Emergencia con algún mes inspeccionado en el periodo. Con `inspector`,
 * solo los meses que hizo esa persona (por nombre: ver `mismaPersona`).
 */
export function filasEmergencia<F extends FormularioEmergenciaMin>(
  formularios: readonly F[],
  p: Periodo,
  inspector?: string,
): FilaEmergencia<F>[] {
  const candidatos = p.mes === null ? MESES : [MESES[p.mes - 1]];
  const filas: FilaEmergencia<F>[] = [];
  for (const formulario of formularios) {
    if (formulario.año !== p.año) continue;
    const meses = candidatos.filter((m) => {
      const datos = formulario.meses?.[m];
      if (!datos) return false;
      return !inspector || mismaPersona(datos.inspector?.nombre ?? "", inspector);
    });
    if (meses.length === 0) continue;
    const inspectores = [
      ...new Set(meses.map((m) => formulario.meses?.[m]?.inspector?.nombre?.trim() ?? "").filter(Boolean)),
    ];
    filas.push({ formulario, meses, inspectores });
  }
  return filas;
}

/** Años para elegir: desde el primero con inspecciones digitales hasta el actual. */
export const añosDisponibles = (hoy: Date = new Date(), desde = 2024): number[] =>
  Array.from({ length: hoy.getFullYear() - desde + 1 }, (_, i) => hoy.getFullYear() - i);
