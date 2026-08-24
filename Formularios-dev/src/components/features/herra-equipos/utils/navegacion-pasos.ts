/**
 * Sube la vista al principio al cambiar de sección.
 *
 * Sin esto, el navegador conserva el desplazamiento: como el botón «Siguiente»
 * está al final, la sección nueva aparecía empezada por abajo y había que subir
 * a mano para ver su primer campo.
 *
 * Se llama tras `setActiveStep`, dentro de un `requestAnimationFrame`, para que
 * React haya pintado ya la sección nueva; si se hace antes, se desplaza el
 * contenido viejo y el nuevo vuelve a aparecer donde estaba.
 */
export const subirAlInicio = (): void => {
  if (typeof window === "undefined") return;

  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

/**
 * Si se ofrece el botón «Guardar Borrador» en los formularios de inspección.
 *
 * Oculto a petición del usuario (18-08-2026). **No desactiva el guardado**: el
 * paso de firmas sigue persistiendo la inspección al avanzar, que es lo que
 * permite recuperarla si el navegador se cierra. Esto solo quita el botón.
 *
 * Se centraliza aquí para que volver a mostrarlo sea cambiar una línea y no
 * buscar por los cuatro formularios.
 */
export const MOSTRAR_BOTON_BORRADOR = false;
