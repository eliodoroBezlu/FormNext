import type { Section } from "./Section";

/**
 * Los cuatro elementos del formulario SPCC (`1.02.P06.F19`).
 *
 * Este archivo existe porque la correspondencia «tipo de equipo del inventario
 * ↔ sección del formulario» estaba escrita a mano en `OutOfServiceSection`, y
 * ahora la necesitan también el selector de equipos y el autocompletado. Tres
 * copias de la misma tabla es una de más.
 *
 * Es TypeScript puro —sin React, sin MUI— porque es dominio (regla 7 del
 * CLAUDE.md).
 *
 * **Solo aplica a este formulario.** El inventario divide el SPCC en cinco
 * tipos (`Arnes`, `ConectorTT`, `ConectorAN`, `Autoretractil`, `Retractil`)
 * pero el formulario tiene cuatro secciones: retráctil y autorretráctil
 * comparten sección, que es como se inspeccionan en papel.
 */
export interface ElementoSpcc {
  /** Clave estable; no se muestra. */
  clave: "arnes" | "autoretractil" | "conectorTT" | "conectorAN";
  /** Etiqueta del selector en la pantalla inicial. */
  etiqueta: string;
  /**
   * Inicio del título de la sección en la plantilla. Se compara por prefijo y
   * no por igualdad porque los títulos llevan detrás una lista de ejemplos
   * entre paréntesis que se edita con frecuencia desde el builder.
   */
  prefijoSeccion: string;
  /** Tipos de `equipos.tipo_equipo` que alimentan este elemento. */
  tiposEquipo: string[];
}

export const ELEMENTOS_SPCC: readonly ElementoSpcc[] = [
  {
    clave: "arnes",
    etiqueta: "Arnés de cuerpo entero",
    prefijoSeccion: "ARNÉS DE CUERPO ENTERO",
    tiposEquipo: ["Arnes"],
  },
  {
    clave: "autoretractil",
    etiqueta: "Autorretráctil personal",
    prefijoSeccion: "AUTORETRACTIL PERSONAL",
    // Las dos familias del inventario se inspeccionan con la misma sección.
    tiposEquipo: ["Autoretractil", "Retractil"],
  },
  {
    clave: "conectorTT",
    etiqueta: "Conector de tejido trenzado / cable de acero",
    prefijoSeccion: "CONECTORES DE TEJIDO TRENZADO",
    tiposEquipo: ["ConectorTT"],
  },
  {
    clave: "conectorAN",
    etiqueta: "Conector de anclaje",
    prefijoSeccion: "CONECTORES DE ANCLAJE",
    tiposEquipo: ["ConectorAN"],
  },
] as const;

/** Todos los tipos de inventario que este formulario sabe inspeccionar. */
export const TIPOS_EQUIPO_SPCC: string[] = ELEMENTOS_SPCC.flatMap(
  (e) => e.tiposEquipo,
);

const normalizar = (texto: string): string =>
  texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/** El elemento al que pertenece una sección, o `undefined` si no es del SPCC. */
export const elementoDeSeccion = (
  tituloSeccion: string,
): ElementoSpcc | undefined => {
  const norm = normalizar(tituloSeccion);
  return ELEMENTOS_SPCC.find((e) =>
    norm.startsWith(normalizar(e.prefijoSeccion)),
  );
};

/**
 * Los elementos SPCC que esta plantilla realmente tiene.
 *
 * Es la forma de acotar la funcionalidad «solo a este formulario» sin escribir
 * su código en ningún sitio: se deduce de las secciones. Dos plantillas
 * comparten el código `1.02.P06.F19` —la de 4 secciones y una vieja de 2— y
 * atarse al código le habría dado a la vieja una pantalla que no sabe llenar.
 * Devuelve lista vacía para cualquier otro formulario, que es lo que apaga la
 * pantalla de selección múltiple.
 */
export const elementosPresentesEn = (secciones: Section[]): ElementoSpcc[] =>
  ELEMENTOS_SPCC.filter((elemento) =>
    secciones.some((s) =>
      normalizar(s.title).startsWith(normalizar(elemento.prefijoSeccion)),
    ),
  );

/** El elemento que corresponde a un `tipo_equipo` del inventario. */
export const elementoDeTipoEquipo = (
  tipoEquipo: string,
): ElementoSpcc | undefined =>
  ELEMENTOS_SPCC.find((e) => e.tiposEquipo.includes(tipoEquipo));

// ── Localización de preguntas dentro de la plantilla ──────────────────────

/**
 * Ruta RHF de una pregunta: `responses.section_<i>.sub<j>.q<k>`.
 *
 * Se resuelve buscando por **texto**, no por posición: los índices son los que
 * usa el renderizador, pero fijarlos aquí como constantes rompería el
 * autocompletado en cuanto alguien reordene una pregunta desde el builder.
 */
export interface PreguntaLocalizada {
  ruta: string;
  texto: string;
}

/** Subsección «Características» de una sección; es donde viven código y marca. */
const subseccionCaracteristicas = (
  seccion: Section,
): { sub: Section; indice: number } | undefined => {
  const indice = (seccion.subsections ?? []).findIndex((s) =>
    normalizar(s.title).startsWith("CARACTERISTICAS"),
  );
  if (indice < 0) return undefined;
  return { sub: seccion.subsections![indice], indice };
};

/**
 * Busca preguntas dentro de «Características» y devuelve sus rutas RHF.
 *
 * `coincide` recibe el texto ya normalizado. Devuelve todas las coincidencias
 * en el orden de la plantilla, porque el autorretráctil tiene dos códigos.
 */
export const localizarPreguntas = (
  secciones: Section[],
  prefijoSeccion: string,
  coincide: (textoNormalizado: string) => boolean,
): PreguntaLocalizada[] => {
  const indiceSeccion = secciones.findIndex((s) =>
    normalizar(s.title).startsWith(normalizar(prefijoSeccion)),
  );
  if (indiceSeccion < 0) return [];

  const caracteristicas = subseccionCaracteristicas(secciones[indiceSeccion]);
  if (!caracteristicas) return [];

  const salida: PreguntaLocalizada[] = [];
  (caracteristicas.sub.questions ?? []).forEach((pregunta, indicePregunta) => {
    if (!coincide(normalizar(pregunta.text))) return;
    salida.push({
      ruta: `responses.section_${indiceSeccion}.sub${caracteristicas.indice}.q${indicePregunta}`,
      texto: pregunta.text,
    });
  });
  return salida;
};

/** «COD. DEL ARNÉS», «COD. AUTORETRACTIL 1»… (el 1 trae un salto de línea). */
export const esPreguntaCodigo = (textoNormalizado: string): boolean =>
  /^COD\b|^CODIGO\b/.test(textoNormalizado);

/** «MARCA». */
export const esPreguntaMarca = (textoNormalizado: string): boolean =>
  textoNormalizado === "MARCA";

/** «TIPO AUTORETRACTIL (E, F o G)» y sus equivalentes en las otras secciones. */
export const esPreguntaTipo = (textoNormalizado: string): boolean =>
  textoNormalizado.startsWith("TIPO");

/**
 * Tipos de autorretráctil que llevan **dos** códigos.
 *
 * Los E y G son de doble línea —el trabajador se ancla con dos ramales— así
 * que el formulario pide dos códigos; el F es de una sola y pedir el segundo
 * obligaría a inventarlo o a dejar un obligatorio sin llenar.
 */
const TIPOS_CON_DOS_CODIGOS = new Set(["E", "G"]);

/**
 * Decide si toca mostrar el segundo código del autorretráctil.
 *
 * Tolera texto libre además de la lista E/F/G: la pregunta era un `textarea`
 * antes de tener opciones, y las inspecciones ya guardadas traen lo que el
 * inspector escribió. Se queda con la primera letra significativa.
 */
export const requiereSegundoCodigo = (valorTipo: unknown): boolean => {
  if (typeof valorTipo !== "string") return false;
  const letra = normalizar(valorTipo).replace(/[^A-Z]/g, "").charAt(0);
  return TIPOS_CON_DOS_CODIGOS.has(letra);
};

/**
 * ¿Es la pregunta del **segundo** código del autorretráctil?
 *
 * Se reconoce por su propio texto y no por la sección que la contiene porque
 * el renderizador recibe la subsección («Características»), no el título de
 * arriba. El texto nombra el elemento y el número, así que no puede chocar con
 * ninguna pregunta de otro formulario.
 */
export const esSegundoCodigoAutoretractil = (texto: string): boolean =>
  /^COD.*AUTORETRACTIL\s*2$/.test(normalizar(texto));

/** La pregunta del tipo dentro de una lista de preguntas; -1 si no está. */
export const indiceDePreguntaTipo = (
  preguntas: { text: string }[],
): number => preguntas.findIndex((p) => esPreguntaTipo(normalizar(p.text)));

// ── Precarga del formulario a partir de los equipos elegidos ──────────────

/** Equipo elegido en el selector de cada elemento; todos son opcionales. */
export type SeleccionSpcc = Partial<
  Record<ElementoSpcc["clave"], EquipoSeleccionado>
>;

/** Lo que el selector necesita del equipo. Evita atar el dominio al backend. */
export interface EquipoSeleccionado {
  codigo: string;
  marca?: string;
  descripcion?: string;
  tipo_equipo: string;
}

/** Una respuesta lista para `setValue`. */
export interface AsignacionSpcc {
  /** Ruta RHF completa, `responses.section_0.sub0.q2`. */
  ruta: string;
  valor: { value: string; description: string; observacion: string };
}

export interface PrecargaSpcc {
  /** Respuestas a escribir, una por campo. */
  asignaciones: AsignacionSpcc[];
  /** Títulos de las secciones a inspeccionar, para `selectedItems.ROOT`. */
  seccionesElegidas: string[];
}

const respuesta = (value: string): AsignacionSpcc["valor"] => ({
  value,
  description: "",
  observacion: "",
});

/**
 * Traduce «qué equipos eligió el inspector» a «qué secciones se llenan y con
 * qué datos».
 *
 * Elegir un equipo hace dos cosas a la vez: marca su sección como una de las
 * que hay que inspeccionar y deja el código y la marca ya escritos. No elegir
 * nada no rompe nada — el inspector sigue pudiendo marcar las secciones a mano
 * en el paso 1, que es como funcionaba hasta ahora.
 *
 * Del autorretráctil solo se llena el primer código: el segundo depende del
 * tipo (E y G llevan dos, F uno solo) y ese dato no está en el inventario, así
 * que aparece dentro del formulario cuando el inspector elige el tipo.
 */
export const construirPrecargaSpcc = (
  secciones: Section[],
  seleccion: SeleccionSpcc,
): PrecargaSpcc => {
  const asignaciones: AsignacionSpcc[] = [];
  const seccionesElegidas: string[] = [];

  for (const elemento of ELEMENTOS_SPCC) {
    const equipo = seleccion[elemento.clave];
    if (!equipo) continue;

    const seccion = secciones.find((s) =>
      normalizar(s.title).startsWith(normalizar(elemento.prefijoSeccion)),
    );
    if (!seccion) continue;
    seccionesElegidas.push(seccion.title);

    const codigos = localizarPreguntas(
      secciones,
      elemento.prefijoSeccion,
      esPreguntaCodigo,
    );
    if (codigos.length > 0) {
      asignaciones.push({
        ruta: codigos[0].ruta,
        valor: respuesta(equipo.codigo),
      });
    }

    if (!equipo.marca) continue;
    const marcas = localizarPreguntas(
      secciones,
      elemento.prefijoSeccion,
      esPreguntaMarca,
    );
    if (marcas.length > 0) {
      asignaciones.push({
        ruta: marcas[0].ruta,
        valor: respuesta(equipo.marca),
      });
    }
  }

  return { asignaciones, seccionesElegidas };
};
