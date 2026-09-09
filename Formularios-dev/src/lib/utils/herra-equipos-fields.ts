import { InspectionResponse } from "@/lib/actions/inspection-herra-equipos";

/**
 * Campos que llevan «área» en la etiqueta y sin embargo guardan **una
 * persona**: `SUPERVISOR DE ÁREA` contiene un nombre propio, no un lugar.
 */
const ES_DE_PERSONA =
  /SUPERVISOR|RESPONSABLE|INSPECTOR|PERSONA|TRABAJADOR|JEFE|FIRMA/;

/**
 * El área de una inspección.
 *
 * Se busca en dos sitios y en este orden:
 *
 * 1. **El campo `area` del documento**, que el backend extrae al crear la
 *    inspección. Es el bueno: ya está resuelto y es el que consultan los
 *    informes del servidor.
 * 2. **`verification`**, para los documentos anteriores a ese campo o creados
 *    cuando el extractor todavía no reconocía su etiqueta.
 *
 * ── Por qué no vale una lista de grafías ─────────────────────────────────
 *
 * Aquí había una lista fija (`ÁREA`, `Área`, `Area`, `AREA`…) y cada plantilla
 * nombra el campo a su manera, así que se quedaban fuera:
 *
 * ```
 * ÁREA/SECCIÓN                             F19   ← 443 inspecciones
 * UBICACIÓN FÍSICA EL EQUIPO               F39, F40, F42   ← nótese «EL»
 * ÁREA FÍSICA DEL MONTAJE DEL ANDAMIO      F30
 * ```
 *
 * Devolvían `N/A`, y como el filtro por área compara contra esto, **ninguna
 * aparecía al buscar por su área** ni salía su carpeta en «Mis Inspecciones».
 * No daba error: simplemente no estaban.
 *
 * El criterio es el mismo que usa el backend en `extractAreaFromVerification`.
 * Si uno cambia, hay que cambiar el otro o las dos vistas dejarán de coincidir.
 */
export function getArea(i: InspectionResponse): string {
  const denormalizada = i.area?.trim();
  if (denormalizada) return denormalizada;

  if (!i.verification) return "N/A";

  const claves = Object.keys(i.verification).filter(
    (k) => !ES_DE_PERSONA.test(normalizar(k)),
  );

  const primeraConValor = (
    cumple: (claveNormalizada: string) => boolean,
  ): string | undefined => {
    for (const clave of claves) {
      if (!cumple(normalizar(clave))) continue;
      const valor = i.verification![clave];
      const texto = valor === null || valor === undefined ? "" : String(valor).trim();
      if (texto) return texto;
    }
    return undefined;
  };

  // El orden importa: `2.03.P10.F05` pide AREA y UBICACIÓN a la vez. Un área
  // es dónde trabaja la cuadrilla; una ubicación puede ser «Caja soldadura
  // 320», un sitio dentro del área. Gana la primera.
  return (
    primeraConValor((k) => k === "AREA" || k === "AREA/SECCION") ??
    primeraConValor((k) => k.includes("AREA") || k.includes("SECCION")) ??
    primeraConValor((k) => k.includes("UBICAC")) ??
    "N/A"
  );
}

/** Mayúsculas, sin tildes y sin espacios de más, para comparar textos libres. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * ¿La inspección corresponde al área buscada?
 *
 * Se compara por «contiene» y sin tildes porque el área la escribe cada
 * inspector a mano en su formulario, y en la base conviven `Flotacion`,
 * `flotación`, `Taller Flotacion` y `taller de flotación` para el mismo lugar.
 * Una comparación exacta contra el maestro de áreas dejaría fuera la mayoría.
 */
export function coincideArea(i: InspectionResponse, filtro: string): boolean {
  const buscado = normalizar(filtro);
  if (!buscado) return true;
  return normalizar(getArea(i)).includes(buscado);
}

/**
 * Campo de `verification` que identifica al equipo/elemento inspeccionado
 * (TAG, placa, código interno, etc.) — varía por plantilla, cada formulario
 * usa su propio nombre de campo para esto.
 */
const VERIFICATION_FIELD_NAMES: Record<string, string> = {
  "3.04.P48.F03": "PLACA",
  "1.02.P06.F37": "PLACA/N° INTERNO",
  "3.04.P37.F24": "TAG",
  "3.04.P37.F25": "TAG",
  "3.04.P04.F23": "TAG del Puente Grúa",
  "3.04.P04.F35": "Tag del puente grúa",
  "1.02.P06.F33": "CÓDIGO DE LA ESCALERA",
  "1.02.P06.F39": "IDENTIFICACIÓN INTERNA DEL EQUIPO",
  "1.02.P06.F40": "UBICACIÓN FÍSICA EL EQUIPO",
  "1.02.P06.F42": "IDENTIFICACIÓN INTERNA DEL EQUIPO",
  "2.03.P10.F05": "CÓDIGO TALADRO",
  "1.02.P06.F20": "Lugar exacto del trabajo/depósito (lugar físico)",
  "1.02.P06.F30": "PROYECTO/Nº DE ORDEN DE TRABAJO",
};

export function getEquipmentId(i: InspectionResponse): string {
  const field = VERIFICATION_FIELD_NAMES[i.templateCode];
  if (!field || !i.verification) return "N/A";
  return i.verification[field]?.toString() || "N/A";
}
