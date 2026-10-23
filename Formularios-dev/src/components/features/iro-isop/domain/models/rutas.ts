/**
 * Cada formulario IRO/ISOP tiene su dirección: recargar no lo cierra y «atrás»
 * vuelve al listado. Abre la revisión vigente del código.
 */
export const rutaDelFormularioIro = (codigo: string) =>
  `/dashboard/formularios-de-inspeccion/iro-isop/${encodeURIComponent(codigo)}`;

/** El listado de formularios, en la pestaña de IRO/ISOP. */
export const LISTADO_DE_IRO = "/dashboard/formularios-de-inspeccion?tab=iro";
