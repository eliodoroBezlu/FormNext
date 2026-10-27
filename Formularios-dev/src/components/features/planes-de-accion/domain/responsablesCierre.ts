/**
 * Una tarea puede tener varios responsables de área para el cierre (como en
 * el backend, `domain/responsables-cierre.ts`).
 *
 * La lista va en `responsablesAreaCierreUsernames`. Los campos de uno solo
 * siguen: `responsableAreaCierre` con los nombres separados por coma (lo que
 * se muestra) y `responsableAreaCierreUsername` con el primero.
 *
 * TypeScript puro: se prueba con `yarn test`.
 */

export interface ConResponsablesDeCierre {
  responsableAreaCierreUsername?: string;
  responsablesAreaCierreUsernames?: string[];
}

export interface ResponsableDeCierre {
  nomina: string;
  username: string;
}

/** Quiénes tiene la tarea: la lista o, en una tarea de antes, el único. */
export const usuariosDeCierre = (
  tarea?: ConResponsablesDeCierre | null,
): string[] => {
  if (tarea?.responsablesAreaCierreUsernames?.length) {
    return tarea.responsablesAreaCierreUsernames;
  }
  return tarea?.responsableAreaCierreUsername
    ? [tarea.responsableAreaCierreUsername]
    : [];
};

/** Los tres campos de la tarea para una selección de responsables. */
export const camposDeCierre = (seleccion: ResponsableDeCierre[]) => ({
  responsableAreaCierre: seleccion.map((s) => s.nomina).join(", "),
  responsableAreaCierreUsername: seleccion[0]?.username ?? "",
  responsablesAreaCierreUsernames: seleccion.map((s) => s.username),
});
