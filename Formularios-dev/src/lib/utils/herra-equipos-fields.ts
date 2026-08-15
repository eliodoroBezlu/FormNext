import { InspectionResponse } from "@/lib/actions/inspection-herra-equipos";

/**
 * El área de una inspección de herra-equipos no es un campo propio — vive
 * dentro de `verification` con distintas claves según la plantilla, ya que
 * cada formulario define sus propios campos. No hay filtro de área
 * server-side para este módulo por esta razón.
 */
export function getArea(i: InspectionResponse): string {
  if (!i.verification) return "N/A";
  const v = i.verification;
  return (
    v["ÁREA"] ||
    v["Área"] ||
    v["Area"] ||
    v["AREA"] ||
    v["AREA FÍSICA DE UBICACIÓN DE LA ESCALERA"] ||
    v["UBICACIÓN FÍSICA DEL EQUIPO"] ||
    "N/A"
  ).toString();
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
