/**
 * Versionado de plantillas (IRO/ISOP y herramientas). Espejo de
 * `BackendForm/src/common/versionado/`.
 *
 * - **Borrador**: revisión nueva en preparación; se edita libremente y no se
 *   ofrece para inspeccionar.
 * - **Vigente**: la única que se usa para inspecciones nuevas.
 * - **Obsoleta**: reemplazada; solo lectura. Se conserva porque las
 *   inspecciones hechas con ella se siguen viendo con ella.
 */
export type EstadoRevision = "borrador" | "vigente" | "obsoleta";

/** Campos de versionado que trae cada plantilla. */
export interface CamposVersionado {
  numeroRevision?: number;
  /** Ausente en plantillas anteriores al versionado: cuentan como vigentes. */
  estadoRevision?: EstadoRevision;
  revisionAnteriorId?: string | null;
  motivoCambio?: string;
  vigenteDesde?: string;
  obsoletaDesde?: string;
  publicadaPor?: string;
  creadaPor?: string;
}

/** Lo mínimo de una plantilla para operar su versionado desde la UI. */
export interface PlantillaVersionada extends CamposVersionado {
  _id: string;
  code: string;
  name: string;
  revision: string;
}

export interface EstadoEdicion {
  editable: boolean;
  estado: EstadoRevision;
  inspecciones: number;
  motivo?: string;
}

export interface EntradaHistorial {
  _id: string;
  name?: string;
  revision: string;
  numeroRevision: number;
  estadoRevision: EstadoRevision;
  motivoCambio?: string;
  vigenteDesde?: string;
  obsoletaDesde?: string;
  publicadaPor?: string;
  creadaPor?: string;
  createdAt?: string;
  inspecciones: number;
}

/** El estado de una plantilla, contando como vigente a la que no lo tiene. */
export const estadoDeRevision = (p: CamposVersionado): EstadoRevision =>
  p.estadoRevision ?? "vigente";

/**
 * Operaciones de versionado que expone cada API de plantillas. Cada feature
 * lo implementa en su `infrastructure/adapters/` sobre sus Server Actions.
 */
export interface AdaptadorVersionado {
  estadoEdicion(id: string): Promise<EstadoEdicion>;
  nuevaRevision(id: string): Promise<PlantillaVersionada>;
  publicar(id: string, motivoCambio: string): Promise<unknown>;
  historial(code: string): Promise<EntradaHistorial[]>;
}
