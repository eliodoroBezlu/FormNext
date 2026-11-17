/**
 * Las opciones del diálogo de confirmación. TypeScript puro: se prueba con
 * `yarn test`.
 */

export interface OpcionesConfirmacion {
  mensaje: string;
  titulo?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Borra o da de baja algo: botón rojo y el foco en «Cancelar». */
  peligro?: boolean;
}

/**
 * Título, botón y tono a partir del texto, para reemplazar un `confirm()` del
 * navegador sin más cambios: «¿Eliminar…?» pide «Eliminar» en rojo; «¿Dar de
 * baja…?», «Dar de baja»; lo demás, «Continuar».
 */
export function completarOpciones(opciones: string | OpcionesConfirmacion): Required<OpcionesConfirmacion> {
  const o = typeof opciones === "string" ? { mensaje: opciones } : opciones;
  const eliminar = /eliminar/i.test(o.mensaje);
  const darDeBaja = /dar de baja/i.test(o.mensaje);
  const peligro = o.peligro ?? (eliminar || darDeBaja);
  const accion = eliminar ? "Eliminar" : darDeBaja ? "Dar de baja" : "Continuar";
  return {
    mensaje: o.mensaje,
    titulo: o.titulo ?? (peligro ? `${accion}: ¿está seguro?` : "¿Continuar?"),
    textoConfirmar: o.textoConfirmar ?? accion,
    textoCancelar: o.textoCancelar ?? "Cancelar",
    peligro,
  };
}
