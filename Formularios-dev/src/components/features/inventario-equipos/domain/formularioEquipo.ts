/**
 * Los valores del formulario de un equipo y su traducción al backend y desde él.
 *
 * El formulario trabaja con texto (un costo vacío es `""`, no `0`); el backend
 * con números y referencias. Además decide qué se llena solo: la descripción y
 * la clasificación al elegir el tipo, y qué se conserva al «Guardar y agregar
 * otro» o al duplicar.
 *
 * TypeScript «borrable» (sin enums; solo imports de tipos): sus pruebas
 * corren con `yarn test`.
 */
import type {
  Ambito,
  ConfigTipoEquipo,
  Equipo,
  EquipoPayload,
  FotoEquipo,
} from "./models/Equipo";

export interface ValoresEquipo {
  // ¿Qué equipo es?
  tipo_equipo: string;
  descripcion: string;
  especificaciones: Record<string, string>;
  // ¿Dónde está?
  ambito: Ambito;
  area_id: string;
  superintendencia_id: string;
  gerencia_id: string;
  ubicacion_id: string;
  clasificacion_id: string;
  // Identificación
  codigo: string;
  codigo_parte: string;
  placa: string;
  marca: string;
  modelo: string;
  num_serie: string;
  responsable: string;
  // Más datos
  cantidad: string;
  estado: string;
  codigo_antiguo: string;
  frecuencia_uso: string;
  costo: string;
  observaciones: string;
  fotos: FotoEquipo[];
  // No se editan aquí, pero no se pierden al guardar
  rfid: string;
  subarea: string;
}

export const valoresVacios = (): ValoresEquipo => ({
  tipo_equipo: "",
  descripcion: "",
  especificaciones: {},
  ambito: "area",
  area_id: "",
  superintendencia_id: "",
  gerencia_id: "",
  ubicacion_id: "",
  clasificacion_id: "",
  codigo: "",
  codigo_parte: "",
  placa: "",
  marca: "",
  modelo: "",
  num_serie: "",
  responsable: "",
  cantidad: "1",
  estado: "Operativo",
  codigo_antiguo: "",
  frecuencia_uso: "",
  costo: "",
  observaciones: "",
  fotos: [],
  rfid: "",
  subarea: "",
});

const texto = (v: unknown): string => (v === undefined || v === null ? "" : String(v));

const especificacionesComoTexto = (e?: Record<string, unknown>): Record<string, string> =>
  Object.fromEntries(Object.entries(e ?? {}).map(([k, v]) => [k, texto(v)]));

/** Para editar un equipo existente. */
export function valoresDesdeEquipo(e: Equipo): ValoresEquipo {
  return {
    tipo_equipo: e.tipo_equipo,
    descripcion: e.descripcion,
    especificaciones: especificacionesComoTexto(e.especificaciones),
    ambito: e.ambito ?? "area",
    area_id: e.area_id?._id ?? "",
    superintendencia_id: e.superintendencia_id?._id ?? "",
    gerencia_id: e.gerencia_id?._id ?? "",
    ubicacion_id: e.ubicacion_id?._id ?? "",
    clasificacion_id: e.clasificacion_id?._id ?? "",
    codigo: e.codigo,
    codigo_parte: texto(e.codigo_parte),
    placa: texto(e.placa),
    marca: texto(e.marca),
    modelo: texto(e.modelo),
    num_serie: texto(e.num_serie),
    responsable: texto(e.responsable),
    cantidad: texto(e.cantidad ?? 1),
    estado: e.estado || "Operativo",
    codigo_antiguo: texto(e.codigo_antiguo),
    frecuencia_uso: texto(e.frecuencia_uso),
    // Un 0 guardado casi siempre es «no se cargó», no un costo real.
    costo: e.costo ? String(e.costo) : "",
    observaciones: texto(e.observaciones),
    fotos: e.fotos ?? [],
    rfid: texto(e.rfid),
    subarea: texto(e.subarea),
  };
}

/**
 * Un equipo nuevo a partir de otro igual: lo comparten tipo, ubicación,
 * marca, modelo y datos técnicos; lo que identifica a la unidad (código, serie,
 * RFID, fotos) y a quién está asignada empiezan vacíos.
 */
export function valoresParaDuplicar(e: Equipo): ValoresEquipo {
  return {
    ...valoresDesdeEquipo(e),
    codigo: "",
    codigo_parte: "",
    placa: "",
    num_serie: "",
    responsable: "",
    codigo_antiguo: "",
    observaciones: "",
    fotos: [],
    rfid: "",
  };
}

/**
 * Lo que queda puesto con «Guardar y agregar otro»: lo que suele repetirse al
 * cargar una tanda (tipo, dónde está, clasificación, marca). El código se
 * vuelve a proponer.
 */
export function valoresParaOtro(v: ValoresEquipo): ValoresEquipo {
  return {
    ...valoresVacios(),
    tipo_equipo: v.tipo_equipo,
    descripcion: v.descripcion,
    ambito: v.ambito,
    area_id: v.area_id,
    superintendencia_id: v.superintendencia_id,
    gerencia_id: v.gerencia_id,
    ubicacion_id: v.ubicacion_id,
    clasificacion_id: v.clasificacion_id,
    marca: v.marca,
    estado: v.estado,
    frecuencia_uso: v.frecuencia_uso,
  };
}

/** `"12,5"` → 12.5; vacío o inválido → `undefined`. */
export function numero(v: string): number | undefined {
  const limpio = v.trim().replace(",", ".");
  if (!limpio) return undefined;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : undefined;
}

const opcional = (v: string): string | undefined => v.trim() || undefined;

/**
 * Lo que se envía al backend.
 *
 * - Solo va la referencia del nivel elegido (área, superintendencia o
 *   gerencia): con dos, el equipo parecería pertenecer a ambos.
 * - Con configuración del tipo, solo van sus datos técnicos (al cambiar de
 *   tipo no quedan restos del anterior), los numéricos como número y los
 *   de sí/no como booleano.
 */
export function payloadDesdeValores(
  v: ValoresEquipo,
  config?: ConfigTipoEquipo | null,
): EquipoPayload {
  const especificaciones: Record<string, unknown> = {};
  const campos = config?.campos;
  const nombres = campos ? campos.map((c) => c.name) : Object.keys(v.especificaciones);
  for (const nombre of nombres) {
    const valor = (v.especificaciones[nombre] ?? "").trim();
    if (!valor) continue;
    const campo = campos?.find((c) => c.name === nombre);
    especificaciones[nombre] =
      campo?.type === "number"
        ? numero(valor) ?? valor
        : campo?.type === "boolean"
          ? valor === "true"
          : valor;
  }

  return {
    codigo: v.codigo.trim(),
    codigo_antiguo: opcional(v.codigo_antiguo),
    codigo_parte: opcional(v.codigo_parte),
    descripcion: v.descripcion.trim(),
    marca: opcional(v.marca),
    modelo: opcional(v.modelo),
    cantidad: numero(v.cantidad) ?? 1,
    costo: numero(v.costo),
    num_serie: opcional(v.num_serie),
    frecuencia_uso: opcional(v.frecuencia_uso),
    estado: v.estado || "Operativo",
    observaciones: opcional(v.observaciones),
    tipo_equipo: v.tipo_equipo,
    rfid: opcional(v.rfid),
    placa: opcional(v.placa),
    ambito: v.ambito,
    area_id: v.ambito === "area" ? v.area_id : undefined,
    superintendencia_id: v.ambito === "superintendencia" ? v.superintendencia_id : undefined,
    gerencia_id: v.ambito === "gerencia" ? v.gerencia_id : undefined,
    subarea: opcional(v.subarea),
    responsable: opcional(v.responsable),
    ubicacion_id: v.ubicacion_id,
    clasificacion_id: v.clasificacion_id,
    especificaciones,
    fotos: v.fotos,
  };
}

/** El id del nivel elegido: el área, la superintendencia o la gerencia. */
export function referenciaElegida(v: Pick<ValoresEquipo, "ambito" | "area_id" | "superintendencia_id" | "gerencia_id">): string {
  if (v.ambito === "area") return v.area_id;
  if (v.ambito === "superintendencia") return v.superintendencia_id;
  return v.gerencia_id;
}

/** La placa solo tiene sentido en vehículos. */
export const esVehiculo = (tipo: string): boolean =>
  /veh[ií]culo|camioneta|cami[oó]n|minib[uú]s|\bbus\b|montacarga/i.test(tipo);

/** Los tipos que se pueden elegir: los configurados y los que ya hay en el inventario. */
export function tiposDeEquipo(configs: ConfigTipoEquipo[], equipos: Equipo[]): string[] {
  const tipos = new Set<string>();
  for (const c of configs) if (c.tipo_equipo) tipos.add(c.tipo_equipo);
  for (const e of equipos) if (e.tipo_equipo) tipos.add(e.tipo_equipo);
  return [...tipos].sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * La clasificación que más tienen los equipos de ese tipo (todas las
 * amoladoras son «Herramientas eléctricas»); `null` si no hay ninguno.
 */
export function clasificacionSugerida(equipos: Equipo[], tipo: string): string | null {
  const cuenta = new Map<string, number>();
  for (const e of equipos) {
    const id = e.clasificacion_id?._id;
    if (e.tipo_equipo === tipo && id) cuenta.set(id, (cuenta.get(id) ?? 0) + 1);
  }
  let mejor: string | null = null;
  let max = 0;
  for (const [id, n] of cuenta) {
    if (n > max) {
      mejor = id;
      max = n;
    }
  }
  return mejor;
}

/** Sin mayúsculas, tildes ni espacios de más: «Bosch » y «BOSCH» son lo mismo. */
export const clave = (v: string): string =>
  v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

export interface OpcionTexto {
  valor: string;
  usos: number;
}

type CampoTexto = "marca" | "modelo" | "responsable" | "frecuencia_uso";

/**
 * Los valores ya cargados de un campo, para sugerirlos al escribir. Las
 * variantes de mayúsculas o tildes se juntan y queda la escritura más usada.
 * `filtro` acota (p. ej. los modelos de una marca).
 */
export function opcionesDe(
  equipos: Equipo[],
  campo: CampoTexto,
  filtro: (e: Equipo) => boolean = () => true,
): OpcionTexto[] {
  const grupos = new Map<string, Map<string, number>>();
  for (const e of equipos) {
    const valor = (e[campo] ?? "").trim();
    if (!valor || !filtro(e)) continue;
    const k = clave(valor);
    const escrituras = grupos.get(k) ?? new Map<string, number>();
    escrituras.set(valor, (escrituras.get(valor) ?? 0) + 1);
    grupos.set(k, escrituras);
  }
  const opciones: OpcionTexto[] = [];
  for (const escrituras of grupos.values()) {
    let mejor = "";
    let max = 0;
    let usos = 0;
    for (const [valor, n] of escrituras) {
      usos += n;
      if (n > max) {
        mejor = valor;
        max = n;
      }
    }
    opciones.push({ valor: mejor, usos });
  }
  return opciones.sort((a, b) => a.valor.localeCompare(b.valor, "es"));
}

/** Distancia de edición (cuántas letras cambiar para pasar de una a otra). */
function distancia(a: string, b: string): number {
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const arriba = fila[j];
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = arriba;
    }
  }
  return fila[b.length];
}

/**
 * Si lo escrito parece una errata de un valor más usado («BOCH» → «BOSCH»),
 * ese valor; si no, `null`. Solo sugiere: el usuario decide.
 */
export function parecidoA(valor: string, opciones: OpcionTexto[]): string | null {
  const k = clave(valor);
  if (k.length < 3) return null;
  const propios = opciones.find((o) => clave(o.valor) === k)?.usos ?? 0;
  let mejor: OpcionTexto | null = null;
  for (const o of opciones) {
    const ko = clave(o.valor);
    if (ko === k || o.usos <= propios) continue;
    if (distancia(k, ko) > 1) continue;
    if (!mejor || o.usos > mejor.usos) mejor = o;
  }
  return mejor?.valor ?? null;
}
