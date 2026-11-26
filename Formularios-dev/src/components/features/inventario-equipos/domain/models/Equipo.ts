/**
 * Los datos del inventario de equipos tal como los usa este módulo.
 *
 * Son un subconjunto de lo que devuelve el backend (`EquipoBackend` en
 * `lib/actions/equipo-actions.ts`): el dominio no depende de la capa de red,
 * y lo que no usa no lo declara.
 */

export type Ambito = "area" | "superintendencia" | "gerencia";

/** Una entrada de catálogo: área, superintendencia, gerencia o clasificación. */
export interface Catalogo {
  _id: string;
  nombre: string;
}

/** Un nodo del árbol de ubicaciones (`ruta` = «Taller › Bodega 1 › Estante A»). */
export interface UbicacionEquipo extends Catalogo {
  padre: string | null;
  ancestros: string[];
  ruta: string;
  nivel: number;
  activo: boolean;
}

/** Una foto del equipo; la primera hace de portada. */
export interface FotoEquipo {
  url: string;
  nombre?: string;
  mime?: string;
  tamano?: number;
}

/** Un dato técnico propio de un tipo de equipo (voltaje, diámetro del disco…). */
export interface CampoEspecificacion {
  name: string;
  label: string;
  /** "text" | "number" | "select" | "boolean" */
  type: string;
  required: boolean;
  options?: string[];
}

/** Los datos técnicos que pide un tipo de equipo (Config. de formulario). */
export interface ConfigTipoEquipo {
  tipo_equipo: string;
  campos: CampoEspecificacion[];
}

export interface Equipo {
  _id: string;
  codigo: string;
  codigo_antiguo?: string;
  codigo_parte?: string;
  descripcion: string;
  marca?: string;
  modelo?: string;
  cantidad: number;
  costo?: number;
  num_serie?: string;
  frecuencia_uso?: string;
  estado?: string;
  observaciones?: string;
  tipo_equipo: string;
  rfid?: string;
  placa?: string;
  ambito?: Ambito;
  area_id?: Catalogo;
  superintendencia_id?: Catalogo;
  gerencia_id?: Catalogo;
  subarea?: string;
  responsable?: string;
  ubicacion_id?: Pick<UbicacionEquipo, "_id" | "nombre" | "ancestros"> & { ruta?: string };
  clasificacion_id?: Catalogo;
  especificaciones?: Record<string, unknown>;
  fotos?: FotoEquipo[];
}

/** Lo que se envía al crear o actualizar un equipo. */
export interface EquipoPayload {
  codigo: string;
  codigo_antiguo?: string;
  codigo_parte?: string;
  descripcion: string;
  marca?: string;
  modelo?: string;
  cantidad: number;
  costo?: number;
  num_serie?: string;
  frecuencia_uso?: string;
  estado?: string;
  observaciones?: string;
  tipo_equipo: string;
  rfid?: string;
  placa?: string;
  ambito: Ambito;
  area_id?: string;
  superintendencia_id?: string;
  gerencia_id?: string;
  subarea?: string;
  responsable?: string;
  ubicacion_id: string;
  clasificacion_id: string;
  especificaciones: Record<string, unknown>;
  fotos: FotoEquipo[];
}

/** Los catálogos que alimentan filtros y formulario. */
export interface CatalogosInventario {
  areas: Catalogo[];
  superintendencias: Catalogo[];
  gerencias: Catalogo[];
  ubicaciones: UbicacionEquipo[];
  clasificaciones: Catalogo[];
  configs: ConfigTipoEquipo[];
}

export const ESTADOS_EQUIPO = ["Operativo", "Inoperativo", "Mantenimiento"] as const;
