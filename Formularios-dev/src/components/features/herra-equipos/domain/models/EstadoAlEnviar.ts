import { InspectionStatus } from "./Inspection";

/**
 * Estados que significan «esto todavía se está llenando».
 *
 * No son un desenlace: son el trabajo a medias. Al enviar el formulario deben
 * dar paso al estado que corresponda, nunca conservarse.
 */
const EN_CURSO: InspectionStatus[] = [
  InspectionStatus.DRAFT,
  InspectionStatus.IN_PROGRESS,
];

export interface ContextoEnvio {
  /** Estado que tenía la inspección al abrirla; `undefined` si es nueva. */
  estadoPrevio?: InspectionStatus | string;
  /** `config.approval?.enabled === true`. */
  requiereAprobacion: boolean;
  /**
   * Qué estados cuentan como «todavía se está llenando» en este formulario.
   *
   * Los andamios lo necesitan: para ellos `in_progress` **no** es trabajo a
   * medias sino un andamio ya aprobado que va acumulando inspecciones
   * rutinarias, y promoverlo lo devolvería a aprobación en cada rutina. Ahí se
   * pasa solo `[DRAFT]`.
   */
  estadosEnCurso?: InspectionStatus[];
}

export interface EstadoResuelto {
  status: InspectionStatus;
  requiresApproval: boolean;
}

/**
 * Qué estado le toca a una inspección cuando el inspector pulsa «enviar».
 *
 * ── El error que corrige ──────────────────────────────────────────────────
 *
 * Antes esto era `isNewForm ? PENDING_APPROVAL : (estadoPrevio ?? COMPLETED)`,
 * repetido en cuatro formularios. Parecía razonable —«si ya existía, respeta su
 * estado»— pero un borrador **ya existe**: el paso de firmas lo guarda y navega
 * a la inspección persistida antes de llegar al envío final. A partir de ahí
 * `isNewForm` es falso y el envío conservaba `draft`, así que un formulario que
 * requería aprobación se quedaba en borrador y **no le llegaba a ningún
 * supervisor**.
 *
 * La regla correcta no mira si el documento existe, sino si su estado es un
 * desenlace o trabajo a medias: un borrador que se envía deja de ser borrador.
 */
export const resolverEstadoAlEnviar = ({
  estadoPrevio,
  requiereAprobacion,
  estadosEnCurso = EN_CURSO,
}: ContextoEnvio): EstadoResuelto => {
  if (!requiereAprobacion) {
    return { status: InspectionStatus.COMPLETED, requiresApproval: false };
  }

  const enCurso =
    !estadoPrevio || estadosEnCurso.includes(estadoPrevio as InspectionStatus);

  if (enCurso) {
    return { status: InspectionStatus.PENDING_APPROVAL, requiresApproval: true };
  }

  // Ya tenía un desenlace (aprobada, rechazada, completada o esperando
  // aprobación): reenviarla no debe cambiarlo por su cuenta.
  return {
    status: estadoPrevio as InspectionStatus,
    requiresApproval: true,
  };
};
