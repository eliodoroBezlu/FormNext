/**
 * El código de un equipo («Cód. Nuevo Asig»): cómo proponer el siguiente y
 * cuándo choca con uno que ya existe.
 *
 * El código sigue una serie por tipo y área — `ZE-AM-TG-0076` es ítem (ZE-AM),
 * área (TG) y correlativo (0076) —, y llevarla a mano fue lo que hizo fallar
 * el Excel del inventario. Aquí la serie se deduce de los códigos que ya hay,
 * sin tablas aparte: lo que manda es cómo se codificó lo existente.
 *
 * TypeScript «borrable» (sin enums; solo imports de tipos): sus pruebas
 * corren con `yarn test`.
 */
import type { Ambito, Equipo } from "./models/Equipo";

/** Prefijo + número final: `ZE-AM-TG-` + `0076`. */
const CON_NUMERO_FINAL = /^(.*?)(\d+)$/;

const normal = (codigo: string) => codigo.trim().toUpperCase();

/** Lo más repetido de una lista; en empate, lo primero que apareció. */
function masFrecuente(valores: string[]): string | null {
  const cuenta = new Map<string, number>();
  for (const v of valores) cuenta.set(v, (cuenta.get(v) ?? 0) + 1);
  let mejor: string | null = null;
  let max = 0;
  for (const [v, n] of cuenta) {
    if (n > max) {
      mejor = v;
      max = n;
    }
  }
  return mejor;
}

/** A qué nivel de la organización pertenece el equipo (su área, superintendencia o gerencia). */
export function referenciaDe(e: Equipo, ambito: Ambito): string | undefined {
  if (ambito === "area") return e.area_id?._id;
  if (ambito === "superintendencia") return e.superintendencia_id?._id;
  return e.gerencia_id?._id;
}

export interface SugerenciaCodigo {
  codigo: string;
  /** El último código de la serie, para explicar de dónde sale; `null` si la serie es nueva. */
  ultimo: string | null;
}

interface Serie {
  prefijo: string;
  ancho: number;
  max: number;
  ultimo: string;
}

/** La serie más usada entre unos códigos: la del prefijo que más se repite. */
function serieMasUsada(codigos: string[]): Serie | null {
  const series = new Map<string, Serie & { usos: number }>();
  for (const codigo of codigos) {
    const m = CON_NUMERO_FINAL.exec(codigo.trim());
    if (!m) continue;
    const [, prefijo, digitos] = m;
    const n = Number(digitos);
    const s = series.get(prefijo) ?? { prefijo, ancho: digitos.length, max: -1, ultimo: "", usos: 0 };
    s.usos++;
    if (n > s.max) {
      s.max = n;
      s.ancho = digitos.length;
      s.ultimo = codigo.trim();
    }
    series.set(prefijo, s);
  }
  let mejor: (Serie & { usos: number }) | null = null;
  for (const s of series.values()) if (!mejor || s.usos > mejor.usos) mejor = s;
  return mejor;
}

/** El primer número libre desde `desde`, con el ancho de la serie. */
function primerLibre(prefijo: string, desde: number, ancho: number, usados: Set<string>): string {
  let n = desde;
  let codigo = `${prefijo}${String(n).padStart(ancho, "0")}`;
  while (usados.has(normal(codigo))) {
    n++;
    codigo = `${prefijo}${String(n).padStart(ancho, "0")}`;
  }
  return codigo;
}

/**
 * El código que le tocaría a un equipo nuevo de `tipo` en `referencia` (el id
 * de su área, superintendencia o gerencia, según `ambito`).
 *
 * 1. Si ya hay equipos de ese tipo ahí: el siguiente de su serie. Va después
 *    del **mayor**, no del primer hueco: un número que falta puede ser una
 *    etiqueta que nunca se grabó (pasó con el 0068 de TALLER GENERAL), y
 *    reusarlo daría dos herramientas con la misma etiqueta.
 * 2. Si es el primero de ese tipo en el área: se arma con el prefijo del tipo
 *    (`ZE-AM`, de sus códigos en otras áreas) y el segmento del área (`TG`, de
 *    los códigos de otros equipos del área), empezando en 1.
 * 3. Si no hay de dónde deducirlo, `null`: el código se escribe a mano.
 */
export function sugerirCodigo(
  equipos: Equipo[],
  tipo: string,
  ambito: Ambito,
  referencia: string,
): SugerenciaCodigo | null {
  if (!tipo || !referencia) return null;
  const usados = new Set(equipos.map((e) => normal(e.codigo)));
  const delTipo = equipos.filter((e) => e.tipo_equipo === tipo);

  const serie = serieMasUsada(
    delTipo.filter((e) => referenciaDe(e, ambito) === referencia).map((e) => e.codigo),
  );
  if (serie) {
    return {
      codigo: primerLibre(serie.prefijo, serie.max + 1, serie.ancho, usados),
      ultimo: serie.ultimo,
    };
  }

  if (ambito !== "area") return null;
  const segmentos = (codigo: string) => codigo.trim().split("-");
  const conNumero = (s: string[]) => s.length >= 4 && /^\d+$/.test(s[s.length - 1]);

  const delTipoPartido = delTipo.map((e) => segmentos(e.codigo)).filter(conNumero);
  const prefijoTipo = masFrecuente(delTipoPartido.map((s) => s.slice(0, -2).join("-")));
  const segmentoArea = masFrecuente(
    equipos
      .filter((e) => e.area_id?._id === referencia)
      .map((e) => segmentos(e.codigo))
      .filter(conNumero)
      .map((s) => s[s.length - 2]),
  );
  if (!prefijoTipo || !segmentoArea) return null;
  const ancho = Number(masFrecuente(delTipoPartido.map((s) => String(s[s.length - 1].length)))) || 4;
  return { codigo: primerLibre(`${prefijoTipo}-${segmentoArea}-`, 1, ancho, usados), ultimo: null };
}

/**
 * El equipo que ya usa ese código, si lo hay.
 *
 * La identidad es el par (código, RFID): dos SPCC pueden compartir código si
 * su RFID los distingue. Entre equipos sin RFID —herramientas, vehículos— el
 * código no se puede repetir.
 */
export function equipoConCodigo(
  equipos: Equipo[],
  codigo: string,
  rfid: string,
  idActual?: string,
): Equipo | undefined {
  const buscado = normal(codigo);
  if (!buscado) return undefined;
  const rfidBuscado = rfid.trim();
  return equipos.find(
    (e) =>
      e._id !== idActual &&
      normal(e.codigo) === buscado &&
      (e.rfid ?? "").trim() === rfidBuscado,
  );
}

/**
 * El «Código de parte»: el número final del código, sin ceros a la izquierda
 * (`ZE-AM-TG-0076` → `76`). Así las dos columnas no se separan, que fue el
 * error de uno que tuvo el Excel.
 */
export function codigoParteDesde(codigo: string): string {
  const m = /(\d+)\s*$/.exec(codigo);
  return m ? String(Number(m[1])) : "";
}
