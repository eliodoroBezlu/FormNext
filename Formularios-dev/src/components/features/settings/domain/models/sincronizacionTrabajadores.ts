/**
 * Sincronización del padrón de trabajadores con el IAM: la vista previa que
 * devuelve el backend (`GET /trabajadores/sync/vista-previa`), la elección del
 * admin y el resultado de aplicar (`POST /trabajadores/sync`).
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export type TipoDeItem = "nuevo" | "cambio" | "baja" | "problema";

export interface CambioDeCampo {
  campo: string;
  etiqueta: string;
  antes: string;
  despues: string;
}

export interface ItemDelPlan {
  /** Id de la ficha en el IAM: es lo que se elige. */
  idIam: string;
  tipo: TipoDeItem;
  nomina: string;
  ci: string | null;
  puesto: string;
  cambios: CambioDeCampo[];
  motivo?: string;
}

export interface PersonaDelRol {
  idIam: string;
  nomina: string;
}

export interface UltimaSincronizacion {
  fecha: string;
  usuario: string;
  nuevos: number;
  actualizados: number;
  bajas: number;
  fallidos: number;
}

export interface VistaPrevia {
  nuevos: ItemDelPlan[];
  conCambios: ItemDelPlan[];
  bajas: ItemDelPlan[];
  problemas: ItemDelPlan[];
  sinCambios: number;
  supervisores: { rol: string; ganan: PersonaDelRol[]; pierden: PersonaDelRol[] };
  ultima: UltimaSincronizacion | null;
}

export interface ResultadoDeItem {
  idIam: string;
  nomina: string;
  tipo: TipoDeItem;
  ok: boolean;
  error?: string;
}

export interface ResultadoDeAplicar {
  resultados: ResultadoDeItem[];
  omitidos: string[];
  supervisores: { ganan: number; pierden: number; error?: string } | null;
}

export interface Resumen {
  severidad: "success" | "warning" | "error" | "info";
  mensaje: string;
}

/** Lo que se puede aplicar. Los problemas no: se corrigen en el Portal IAM. */
export const aplicables = (v: VistaPrevia): ItemDelPlan[] => [
  ...v.nuevos,
  ...v.conCambios,
  ...v.bajas,
];

/** Todo lo aplicable viene marcado: desmarcar es la excepción. */
export const seleccionInicial = (v: VistaPrevia): Set<string> =>
  new Set(aplicables(v).map((i) => i.idIam));

export const hayCambiosDeRol = (v: VistaPrevia): boolean =>
  v.supervisores.ganan.length + v.supervisores.pierden.length > 0;

/** Nada que hacer: ni fichas para aplicar ni supervisores que cambien. */
export const estaAlDia = (v: VistaPrevia): boolean =>
  aplicables(v).length === 0 && !hayCambiosDeRol(v);

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Busca por nómina, CI o puesto, sin tildes ni mayúsculas. */
export function filtrarItems(items: ItemDelPlan[], busqueda: string): ItemDelPlan[] {
  const q = normalizar(busqueda);
  if (!q) return items;
  return items.filter((i) =>
    [i.nomina, i.ci ?? "", i.puesto].some((campo) => normalizar(campo).includes(q)),
  );
}

const n = (cantidad: number, uno: string, varios: string) =>
  `${cantidad} ${cantidad === 1 ? uno : varios}`;

/** Une «a», «a y b», «a, b y c». */
const enumerar = (partes: string[]) =>
  partes.length <= 1
    ? (partes[0] ?? "")
    : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;

export function resumirResultado(r: ResultadoDeAplicar): Resumen {
  const ok = (tipo: TipoDeItem) => r.resultados.filter((x) => x.ok && x.tipo === tipo).length;
  const fallidos = r.resultados.filter((x) => !x.ok).length;

  const hechos = [
    ok("nuevo") && `se agregaron ${n(ok("nuevo"), "trabajador", "trabajadores")}`,
    ok("cambio") && `se actualizaron ${n(ok("cambio"), "ficha", "fichas")}`,
    ok("baja") && `se dieron de baja ${n(ok("baja"), "ficha", "fichas")}`,
  ].filter((x): x is string => Boolean(x));

  const rol = r.supervisores;
  if (rol && !rol.error && rol.ganan + rol.pierden > 0) {
    hechos.push(`cambiaron ${n(rol.ganan + rol.pierden, "supervisor", "supervisores")}`);
  }

  const avisos: string[] = [];
  if (fallidos) avisos.push(`${n(fallidos, "ficha no se pudo", "fichas no se pudieron")} aplicar (ver detalle).`);
  if (r.omitidos.length) {
    avisos.push(
      `${n(r.omitidos.length, "elegida cambió", "elegidas cambiaron")} en el IAM mientras tanto y no se ${r.omitidos.length === 1 ? "aplicó" : "aplicaron"}: volvé a sincronizar.`,
    );
  }
  if (rol?.error) avisos.push(`No se pudo actualizar quién es supervisor (${rol.error}).`);

  const base = hechos.length
    ? `Listo: ${enumerar(hechos)}.`
    : "No se aplicó ningún cambio.";
  const mensaje = [base, ...avisos].join(" ");

  if (fallidos && !hechos.length) return { severidad: "error", mensaje };
  if (avisos.length) return { severidad: "warning", mensaje };
  return { severidad: hechos.length ? "success" : "info", mensaje };
}

/** «17/11/2026 14:05 por ana: 2 nuevos, 3 actualizados.» */
export function describirUltima(u: UltimaSincronizacion | null): string {
  if (!u) return "Todavía no se sincronizó desde esta pantalla.";
  const fecha = new Date(u.fecha).toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const partes = [
    u.nuevos && n(u.nuevos, "nuevo", "nuevos"),
    u.actualizados && n(u.actualizados, "actualizado", "actualizados"),
    u.bajas && n(u.bajas, "baja", "bajas"),
    u.fallidos && n(u.fallidos, "con error", "con error"),
  ].filter((x): x is string => Boolean(x));
  return `Última sincronización: ${fecha}, por ${u.usuario}${partes.length ? ` (${partes.join(", ")})` : " (sin cambios)"}.`;
}
