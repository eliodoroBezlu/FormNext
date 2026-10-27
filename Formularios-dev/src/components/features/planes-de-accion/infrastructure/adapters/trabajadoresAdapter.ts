"use server";

import { obtenerResponsablesDeCierreApi } from "@/lib/actions/trabajador-actions";

export interface ResponsableCierreOption {
  nomina: string;
  puesto: string;
  username: string;
  area: string;
  superintendencia: string;
  rol: "supervisor" | "superintendente";
}

/**
 * Quiénes pueden recibir una tarea como responsables de cierre: supervisores
 * y superintendentes (rol del sistema, no el `puesto` en texto libre) activos,
 * con acceso y usuario, porque necesitan entrar para ver la tarea en su lista.
 *
 * El filtro lo hace el backend (`GET /trabajadores/responsables-cierre`), que
 * antes de responder refresca esos roles desde el IAM: un cambio de rol en el
 * portal se ve al volver a abrir el formulario.
 */
export async function obtenerResponsablesDeCierre(): Promise<
  ResponsableCierreOption[]
> {
  return obtenerResponsablesDeCierreApi();
}
