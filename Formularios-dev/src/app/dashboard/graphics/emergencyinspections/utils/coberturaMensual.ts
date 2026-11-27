/**
 * Cobertura mensual de Sistemas de Emergencia: qué extintores del catálogo se inspeccionaron en un
 * mes, cruzando código por código. TypeScript puro (sin React) para poder probarlo aparte.
 *
 * Por qué así y no contando filas del «mes actual» de cada formulario:
 * - Un formulario cubre un semestre de un tag; su «mes actual» avanza con cada inspección. Filtrar
 *   por él dejaba vacíos los meses pasados (octubre aparecía con 2 % cuando estaba al 90 %).
 * - Hay tags con dos formularios del mismo semestre (uno con agosto, otro con el resto): se juntan
 *   todos los del tag en vez de quedarse con uno.
 * - Contar filas sumaba extintores dados de baja, repetidos o que no están en el catálogo; aquí se
 *   cruza cada código con los extintores activos y lo que no cruza se informa aparte.
 */

/** Lo mínimo de cada tipo que se usa; los tipos de la página son compatibles con estos. */
export type Marca = "✓" | "X" | "N/A" | null;

export interface RegistroExtintor {
  codigo: string;
  ubicacion?: string;
  fechaInspeccion?: string;
  inspeccionMensual?: Marca;
  manguera?: Marca;
  cilindro?: Marca;
  indicadorPresion?: Marca;
  gatilloChavetaPrecinto?: Marca;
  senalizacionSoporte?: Marca;
  observaciones?: string;
}

export interface FormularioMes {
  _id: string;
  tag: string;
  area: string;
  año: number;
  fechaUltimaModificacion?: string;
  meses: Record<string, { inspeccionesExtintor?: RegistroExtintor[]; inspector?: { nombre?: string } } | undefined>;
}

export interface ExtintorCatalogo {
  CodigoExtintor: string;
  Ubicacion: string;
  tag: string;
  area: string;
  activo: boolean;
}

export interface TagCatalogo {
  tag: string;
  area: string;
  activo: boolean;
}

export type EstadoExtintor = "conforme" | "con-observacion" | "no-inspeccionado";

export const ETIQUETA_ESTADO: Record<EstadoExtintor, string> = {
  conforme: "Inspeccionado",
  "con-observacion": "Con observación",
  "no-inspeccionado": "No inspeccionado",
};

/** Color del tema para cada estado (`docs/SISTEMA_DE_DISENO.md`, 1.3). */
export const COLOR_ESTADO: Record<EstadoExtintor, "success" | "warning" | "error"> = {
  conforme: "success",
  "con-observacion": "warning",
  "no-inspeccionado": "error",
};

/** Semáforo de cobertura: 90 % o más en verde, 60 % o más en ámbar, el resto en rojo. */
export const nivelCobertura = (pct: number): "success" | "warning" | "error" =>
  pct >= 90 ? "success" : pct >= 60 ? "warning" : "error";

/** «2026-10-02T…» → «02/10/2026», sin pasar por la zona horaria del navegador. */
export const fechaCorta = (iso: string | undefined): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
};

/** Componentes del formato, con su nombre para mostrar. */
export const COMPONENTES: { campo: keyof RegistroExtintor; nombre: string }[] = [
  { campo: "inspeccionMensual", nombre: "Inspección mensual" },
  { campo: "manguera", nombre: "Manguera" },
  { campo: "cilindro", nombre: "Cilindro" },
  { campo: "indicadorPresion", nombre: "Indicador de presión" },
  { campo: "gatilloChavetaPrecinto", nombre: "Gatillo, chaveta y precinto" },
  { campo: "senalizacionSoporte", nombre: "Señalización y soporte" },
];

export interface ExtintorDelMes {
  codigo: string;
  ubicacion: string;
  tag: string;
  area: string;
  estado: EstadoExtintor;
  /** Componentes marcados con X (vacío si está conforme o no se inspeccionó). */
  observaciones: string[];
  fechaInspeccion?: string;
  inspector?: string;
}

export interface TagDelMes {
  tag: string;
  area: string;
  /** Tiene al menos un formulario con este mes. */
  inspeccionado: boolean;
  inspector?: string;
  /** Fecha de inspección más reciente del mes en este tag. */
  fecha?: string;
  extintores: ExtintorDelMes[];
  cantidad: number;
  inspeccionados: number;
  conObservacion: number;
  /** Porcentaje de extintores del tag inspeccionados (0–100). */
  pct: number;
}

export interface FueraDeCatalogo {
  codigo: string;
  ubicacion: string;
  tag: string;
  /** «dado-de-baja»: el código está en el catálogo pero inactivo; «sin-registro»: no está. */
  motivo: "dado-de-baja" | "sin-registro";
}

export interface AreaDelMes {
  area: string;
  cantidad: number;
  inspeccionados: number;
  conObservacion: number;
  pct: number;
  tagsActivos: number;
  tagsInspeccionados: number;
}

export interface CoberturaMes {
  mes: string;
  /** Año usado (el elegido, o el más reciente con datos de ese mes si no se eligió). */
  año: number | null;
  tags: TagDelMes[];
  extintores: ExtintorDelMes[];
  areas: AreaDelMes[];
  /** Códigos inspeccionados que no corresponden a ningún extintor activo del catálogo. */
  fueraDeCatalogo: FueraDeCatalogo[];
  totales: {
    cantidad: number;
    inspeccionados: number;
    conObservacion: number;
    noInspeccionados: number;
    pct: number;
    tagsActivos: number;
    tagsInspeccionados: number;
    pctTags: number;
  };
}

/** Código comparable: sin espacios, guiones ni mayúsculas («Msp-315» = «MSP 315»). */
export const claveCodigo = (codigo: string | null | undefined): string =>
  String(codigo ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

const porcentaje = (parte: number, total: number): number => (total > 0 ? Math.round((parte / total) * 100) : 0);

const fechaDe = (f: FormularioMes): string => f.fechaUltimaModificacion ?? "";

export interface Alcance {
  /** Áreas consideradas (sin definir = todas; una lista vacía no deja ninguna). */
  areas?: string[];
  /** Tags considerados (sin definir = todos los de las áreas). */
  tags?: string[];
}

/**
 * Cobertura de un mes. `año` vacío: para cada tag se usa el año más reciente que tenga ese mes.
 * El área de cada extintor es la de su tag (el texto del extintor a veces está mal escrito);
 * si el tag no existe, la del extintor.
 */
export function calcularCoberturaMes(
  formularios: FormularioMes[],
  extintores: ExtintorCatalogo[],
  tags: TagCatalogo[],
  mes: string,
  año: number | null,
  alcance: Alcance = {},
): CoberturaMes {
  const areaDeTag = new Map(tags.map((t) => [t.tag, t.area]));
  const enAlcance = (tag: string, area: string) =>
    (!alcance.areas || alcance.areas.includes(area)) && (!alcance.tags || alcance.tags.includes(tag));

  // 1. Formularios con este mes, agrupados por tag (y por año más reciente si no se eligió).
  const conMes = formularios.filter((f) => f.meses?.[mes] && (año === null || f.año === año));
  const porTag = new Map<string, FormularioMes[]>();
  for (const f of conMes) porTag.set(f.tag, [...(porTag.get(f.tag) ?? []), f]);
  let añoUsado: number | null = año;
  for (const [tag, lista] of porTag) {
    if (año !== null) continue;
    const ultimo = Math.max(...lista.map((f) => f.año));
    porTag.set(tag, lista.filter((f) => f.año === ultimo));
    añoUsado = Math.max(añoUsado ?? 0, ultimo);
  }

  // 2. Registros inspeccionados por código. Si un código está en dos formularios del tag, gana el
  //    del formulario modificado más tarde.
  const registros = new Map<string, { r: RegistroExtintor; tag: string; inspector?: string }>();
  const infoTag = new Map<string, { inspector?: string; fecha?: string }>();
  for (const [tag, lista] of porTag) {
    for (const f of [...lista].sort((a, b) => fechaDe(a).localeCompare(fechaDe(b)))) {
      const datos = f.meses[mes];
      const inspector = datos?.inspector?.nombre?.trim() || undefined;
      const previo = infoTag.get(tag);
      let fecha = previo?.fecha;
      for (const r of datos?.inspeccionesExtintor ?? []) {
        const k = claveCodigo(r.codigo);
        if (k) registros.set(k, { r, tag, inspector });
        if (r.fechaInspeccion && (!fecha || r.fechaInspeccion > fecha)) fecha = r.fechaInspeccion;
      }
      infoTag.set(tag, { inspector: inspector ?? previo?.inspector, fecha });
    }
  }

  // 3. Extintores activos del catálogo, con su estado del mes. Con códigos repetidos en el
  //    catálogo, uno solo por código.
  const vistos = new Set<string>();
  const extintoresMes: ExtintorDelMes[] = [];
  for (const e of extintores) {
    if (!e.activo) continue;
    const k = claveCodigo(e.CodigoExtintor);
    if (!k || vistos.has(k)) continue;
    const area = areaDeTag.get(e.tag) ?? e.area.trim();
    if (!enAlcance(e.tag, area)) continue;
    vistos.add(k);
    const hallado = registros.get(k);
    const observaciones = hallado ? COMPONENTES.filter((c) => hallado.r[c.campo] === "X").map((c) => c.nombre) : [];
    extintoresMes.push({
      codigo: e.CodigoExtintor,
      ubicacion: e.Ubicacion,
      tag: e.tag,
      area,
      estado: !hallado ? "no-inspeccionado" : observaciones.length ? "con-observacion" : "conforme",
      observaciones,
      fechaInspeccion: hallado?.r.fechaInspeccion,
      inspector: hallado?.inspector,
    });
  }

  // 4. Lo inspeccionado que no cruza con ningún extintor activo (en el alcance): o está dado de
  //    baja en el catálogo, o el código no existe.
  const dadosDeBaja = new Set(extintores.filter((e) => !e.activo).map((e) => claveCodigo(e.CodigoExtintor)));
  const fueraDeCatalogo: FueraDeCatalogo[] = [];
  for (const [k, { r, tag }] of registros) {
    if (vistos.has(k)) continue;
    const area = areaDeTag.get(tag) ?? "";
    if (!enAlcance(tag, area)) continue;
    fueraDeCatalogo.push({
      codigo: r.codigo,
      ubicacion: r.ubicacion ?? "",
      tag,
      motivo: dadosDeBaja.has(k) ? "dado-de-baja" : "sin-registro",
    });
  }
  fueraDeCatalogo.sort((a, b) => a.tag.localeCompare(b.tag) || a.codigo.localeCompare(b.codigo));

  // 5. Por tag (activos en el alcance) y por área.
  const resumen = (lista: ExtintorDelMes[]) => {
    const inspeccionados = lista.filter((x) => x.estado !== "no-inspeccionado").length;
    return {
      cantidad: lista.length,
      inspeccionados,
      conObservacion: lista.filter((x) => x.estado === "con-observacion").length,
      pct: porcentaje(inspeccionados, lista.length),
    };
  };
  const tagsMes: TagDelMes[] = tags
    .filter((t) => t.activo && enAlcance(t.tag, t.area))
    .map((t) => {
      const lista = extintoresMes.filter((x) => x.tag === t.tag);
      return {
        tag: t.tag,
        area: t.area,
        inspeccionado: porTag.has(t.tag),
        inspector: infoTag.get(t.tag)?.inspector,
        fecha: infoTag.get(t.tag)?.fecha,
        extintores: lista,
        ...resumen(lista),
      };
    })
    .sort((a, b) => a.tag.localeCompare(b.tag));

  const nombresArea = [...new Set([...tagsMes.map((t) => t.area), ...extintoresMes.map((x) => x.area)])].sort();
  const areas: AreaDelMes[] = nombresArea.map((area) => {
    const tagsArea = tagsMes.filter((t) => t.area === area);
    return {
      area,
      ...resumen(extintoresMes.filter((x) => x.area === area)),
      tagsActivos: tagsArea.length,
      tagsInspeccionados: tagsArea.filter((t) => t.inspeccionado).length,
    };
  });

  const total = resumen(extintoresMes);
  const tagsInspeccionados = tagsMes.filter((t) => t.inspeccionado).length;
  return {
    mes,
    año: añoUsado,
    tags: tagsMes,
    extintores: extintoresMes,
    areas,
    fueraDeCatalogo,
    totales: {
      ...total,
      noInspeccionados: total.cantidad - total.inspeccionados,
      tagsActivos: tagsMes.length,
      tagsInspeccionados,
      pctTags: porcentaje(tagsInspeccionados, tagsMes.length),
    },
  };
}

/** CSV para Excel (separador «;» y BOM, como lo abre Excel en español). */
export function extintoresACsv(lista: ExtintorDelMes[]): string {
  const celda = (v: string | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const filas = [
    ["Área", "Tag", "Código", "Ubicación", "Estado", "Observaciones", "Fecha de inspección", "Inspector"],
    ...lista.map((x) => [
      x.area,
      x.tag,
      x.codigo,
      x.ubicacion,
      ETIQUETA_ESTADO[x.estado],
      x.observaciones.join(", "),
      fechaCorta(x.fechaInspeccion),
      x.inspector ?? "",
    ]),
  ];
  return "﻿" + filas.map((f) => f.map(celda).join(";")).join("\r\n");
}
