"use server";

import { obtenerTrabajadores } from "@/lib/actions/trabajador-actions";
import { Role } from "@/lib/routePermissions";

export interface SupervisorOption {
  nomina: string;
  puesto: string;
  username: string;
  area: string;
  superintendencia: string;
}

/**
 * Trabajadores con el rol de sistema "supervisor" (no el cargo en texto
 * libre `puesto`, que es solo informativo) — son los únicos que pueden
 * "recibir" una tarea como responsable de cierre, ya que necesitan poder
 * loguearse con ese rol para verla en su vista de Planes de Acción.
 *
 * Fuente de verdad: `roles_iam` (poblado por la sincronización con el IAM
 * Core, ver `POST /trabajadores/sync?role=supervisor` en BackendForm). Se
 * mantiene como respaldo `userId.roles` (el rol local legacy) mientras se
 * corre la primera sincronización, para no dejar el selector vacío.
 */
export async function obtenerSupervisoresDisponibles(): Promise<
  SupervisorOption[]
> {
  const trabajadores = await obtenerTrabajadores();

  return trabajadores
    .filter(
      (t) =>
        t.activo &&
        t.tiene_acceso_sistema &&
        !!(t.userId?.username || t.username) &&
        (!!t.roles_iam?.includes('supervisor') ||
          !!t.userId?.roles?.includes(Role.SUPERVISOR)),
    )
    .map((t) => ({
      nomina: t.nomina,
      puesto: t.puesto,
      username: (t.userId?.username || t.username) as string,
      area: t.area,
      superintendencia: t.superintendencia,
    }))
    .sort((a, b) => a.nomina.localeCompare(b.nomina));
}
