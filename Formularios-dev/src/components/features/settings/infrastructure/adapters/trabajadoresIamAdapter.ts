import {
  aplicarSincronizacionIam,
  obtenerUltimaSincronizacion,
  obtenerVistaPreviaSincronizacion,
} from "@/lib/actions/trabajador-actions";
import type {
  ResultadoDeAplicar,
  UltimaSincronizacion,
  VistaPrevia,
} from "../../domain/models/sincronizacionTrabajadores";

/** Qué cambiaría sincronizar con el IAM. No escribe. */
export function pedirVistaPrevia(): Promise<VistaPrevia> {
  return obtenerVistaPreviaSincronizacion();
}

/** Aplica los ids elegidos (fichas del IAM) y, si se pide, los supervisores. */
export function aplicarSincronizacion(
  ids: string[],
  supervisores: boolean,
): Promise<ResultadoDeAplicar> {
  return aplicarSincronizacionIam(ids, supervisores);
}

/** La última sincronización registrada, o null si nunca se hizo. */
export function pedirUltima(): Promise<UltimaSincronizacion | null> {
  return obtenerUltimaSincronizacion();
}
