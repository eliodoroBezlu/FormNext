/**
 * Con qué nace cada campo de la lista de verificación en una IRO **nueva**.
 *
 * - La fecha de inspección: hoy. Se inspecciona y se llena el mismo día; si no,
 *   el inspector la cambia.
 * - La empresa: «MSC», la propia; si la inspección es de una contratista, se
 *   cambia (es el mismo valor que el plan de acción toma cuando falta).
 *
 * Al editar una IRO ya guardada no se usa: lo declarado aquel día es el
 * registro.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export const EMPRESA_PROPIA = "MSC";

export interface CampoDeVerificacion {
  label: string;
  type?: string;
  dataSource?: string;
}

const normalizar = (texto: string) =>
  texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/** El valor con que nace el campo, o `""` si nace vacío. */
export function valorInicialDelCampo(
  campo: CampoDeVerificacion,
  hoy: Date = new Date(),
): string | Date {
  const etiqueta = normalizar(campo.label);
  if (campo.type === "date" && etiqueta.includes("FECHA")) {
    return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  }
  if (campo.dataSource === "empresa" || etiqueta.startsWith("EMPRESA")) {
    return EMPRESA_PROPIA;
  }
  return "";
}

/**
 * El área por la que se deducen superintendencia y gerencia.
 *
 * Va primero la que se elige del maestro de áreas (`dataSource: "area"`):
 * varias plantillas (F47, F48, F51) tienen antes un «Área Física» de texto
 * libre, que suele quedar vacío y no siempre coincide con un área del
 * maestro. Si no hay ninguna del maestro, la primera que parezca un área
 * («Lugar» no lo es: es el punto dentro del área).
 */
export function campoDeArea<T extends CampoDeVerificacion>(
  campos: readonly T[],
  esCampoDeArea: (etiqueta: string) => boolean,
): T | undefined {
  return (
    campos.find((c) => c.dataSource === "area") ??
    campos.find((c) => esCampoDeArea(c.label))
  );
}
