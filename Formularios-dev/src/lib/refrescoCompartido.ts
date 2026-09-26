/**
 * Un solo refresco de sesión por ráfaga de peticiones.
 * ──────────────────────────────────────────────────────────────────
 *
 * ## El problema que resuelve
 *
 * Una pantalla del panel dispara más de una docena de Server Actions a la vez
 * —`/dashboard/formularios-de-inspeccion` llegó a catorce en una sola carga—.
 * Cada una pasa por el proxy, y si el token está en su ventana de renovación,
 * cada una pedía **su propia rotación del mismo refresh token**. Catorce
 * rotaciones para abrir una pantalla.
 *
 * Eso rompía dos cosas a la vez:
 *
 * 1. **El límite de IAM.** `/auth/refresh` admite diez cada cinco minutos. Una
 *    carga de pantalla lo agotaba sola, y a partir de ahí todo era `429`: el
 *    token vencía sin renovarse y el siguiente guardado moría con «Tu sesión
 *    expiró mientras se procesaba la acción».
 * 2. **La rotación misma.** Rotar invalida el token anterior. De catorce
 *    peticiones con el mismo token, la primera rota y las trece restantes
 *    presentan uno que ya no existe: `Sesión no encontrada`, 401. Sobre una
 *    Server Action eso acaba en redirección, y la redirección se lleva por
 *    delante el formulario a medio rellenar.
 *
 * ## Cómo
 *
 * Dos mapas, los dos con el **token viejo** como clave:
 *
 * - `enVuelo` — mientras hay un refresco en curso para ese token, quien llegue
 *   espera ese mismo en vez de lanzar otro.
 * - `reciente` — el resultado se recuerda unos segundos **después** de
 *   resolverse.
 *
 * El segundo no es una optimización, es lo que evita el punto 2. Tras rotar,
 * el token viejo está muerto, pero las peticiones que ya salieron del
 * navegador siguen llevándolo en la cookie: sin el recuerdo cada una pediría
 * una rotación imposible. Con él reciben las cookies que ya se obtuvieron y
 * siguen su camino.
 *
 * ## Alcance
 *
 * El estado vive en el proceso. Con varias instancias de Next, cada una lleva
 * su cuenta: no se pisan —cada una hace un refresco, no catorce— y el reparto
 * sigue siendo correcto. La coordinación entre instancias haría falta el día
 * que el número de instancias se acerque al límite de IAM, no antes.
 */

export interface ResultadoDeRefresco {
  /** ¿IAM aceptó la rotación? */
  ok: boolean;
  /** Cabeceras `Set-Cookie` crudas tal como las devolvió IAM. */
  cookies: string[];
}

export interface RefrescoResuelto {
  resultado: ResultadoDeRefresco;
  /** `true` si se reutilizó otro refresco en vez de pedir uno nuevo a IAM. */
  reutilizado: boolean;
}

/**
 * Cuánto se recuerda un resultado tras resolverse.
 *
 * Tiene que cubrir la ráfaga de Server Actions de una pantalla —que se
 * resuelve en cosa de un segundo— con margen para una red lenta, y quedarse
 * muy por debajo de la ventana de renovación del token, que son minutos.
 */
const VENTANA_DE_RECUERDO_MS = 10_000;

const enVuelo = new Map<string, Promise<ResultadoDeRefresco>>();
const reciente = new Map<string, { resultado: ResultadoDeRefresco; expira: number }>();

function limpiarCaducados(ahora: number): void {
  for (const [clave, entrada] of reciente) {
    if (entrada.expira <= ahora) reciente.delete(clave);
  }
}

/**
 * Ejecuta `hacerRefresco` como mucho una vez por token dentro de la ventana.
 *
 * Si `hacerRefresco` lanza, la excepción llega a todos los que esperaban —es
 * el mismo fallo, y cada uno decide qué hacer— y no queda nada guardado: el
 * siguiente que llegue volverá a intentarlo.
 */
export async function refrescarUnaVez(
  tokenViejo: string,
  hacerRefresco: () => Promise<ResultadoDeRefresco>,
): Promise<RefrescoResuelto> {
  const ahora = Date.now();
  limpiarCaducados(ahora);

  const recordado = reciente.get(tokenViejo);
  if (recordado) {
    return { resultado: recordado.resultado, reutilizado: true };
  }

  const enCurso = enVuelo.get(tokenViejo);
  if (enCurso) {
    return { resultado: await enCurso, reutilizado: true };
  }

  const promesa = hacerRefresco();
  enVuelo.set(tokenViejo, promesa);

  try {
    const resultado = await promesa;

    // Se recuerda tanto el éxito como el rechazo. El éxito, porque el token
    // viejo ya no sirve y hay que repartir el nuevo. El rechazo, porque las
    // razones por las que IAM dice que no —límite alcanzado, sesión revocada,
    // sesión expirada— no cambian en los próximos segundos, y reintentar trece
    // veces seguidas solo empeora la primera de ellas.
    reciente.set(tokenViejo, {
      resultado,
      expira: Date.now() + VENTANA_DE_RECUERDO_MS,
    });

    return { resultado, reutilizado: false };
  } finally {
    enVuelo.delete(tokenViejo);
  }
}

/**
 * Olvida lo recordado. Pensado para pruebas y para el arranque en caliente
 * del servidor de desarrollo, donde el módulo se recarga con estado dentro.
 */
export function olvidarRefrescos(): void {
  enVuelo.clear();
  reciente.clear();
}
