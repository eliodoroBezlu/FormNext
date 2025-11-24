export interface Tag {
  _id: string;
  tag: string;
  area: string;
  superintendencia: string;
  responsable: string;
  activo: boolean;
  createdAt: string;
}

export interface InspeccionExtintor {
  _id: string;
  fechaInspeccion: string;
  codigo: string;
  ubicacion: string;
  inspeccionMensual: '✓' | 'X' | 'N/A' | null;
  manguera: '✓' | 'X' | 'N/A' | null;
  cilindro: '✓' | 'X' | 'N/A' | null;
  indicadorPresion: '✓' | 'X' | 'N/A' | null;
  gatilloChavetaPrecinto: '✓' | 'X' | 'N/A' | null;
  senalizacionSoporte: '✓' | 'X' | 'N/A' | null;
  observaciones: string;
}

export interface Inspector {
  nombre: string;
  firma: string | null;
}

export interface SistemaInspeccion {
  cantidad: number | string;
  estado: '✓' | 'X' | 'N/A' | null;
  observaciones?: string;
}

export interface SistemasPasivos {
  puertasEmergencia: SistemaInspeccion;
  senaleticaViasEvacuacion: SistemaInspeccion;
  planosEvacuacion: SistemaInspeccion;
  registroPersonalEvacuacion: SistemaInspeccion;
  numerosEmergencia: SistemaInspeccion;
  luzEmergencia: SistemaInspeccion;
  puntoReunion: SistemaInspeccion;
}

export interface SistemasActivos {
  kitDerrame: SistemaInspeccion;
  lavaOjos: SistemaInspeccion;
  duchasEmergencia: SistemaInspeccion;
  desfibriladorAutomatico: SistemaInspeccion;
}

export interface InspeccionSistemasMensual {
  sistemasPasivos: SistemasPasivos;
  sistemasActivos: SistemasActivos;
  observaciones?: string;
}

export interface InspeccionMensual {
  inspeccionesActivos: InspeccionSistemasMensual;
  inspeccionesExtintor: InspeccionExtintor[];
  inspector: Inspector;
}

export interface FormularioInspeccion {
  _id: string;
  documentCode: string;
  revisionNumber: number;
  superintendencia: string;
  area: string;
  tag: string;
  responsableEdificio: string;
  edificio: string;
  periodo: 'ENERO-JUNIO' | 'JULIO-DICIEMBRE';
  año: number;
  mesActual: string;
  meses: {
    [mes: string]: InspeccionMensual;
  };
  fechaCreacion: string;
  fechaUltimaModificacion: string;
  estado: 'activo' | 'completado' | 'archivado';
}

export interface AreaStats {
  area: string;
  tag: string;
  responsable: string;
  ultimaInspeccion: string;
  cumplimiento: number;
  estado: string;
  tendencia: number;
  totalInspecciones: number;
  superintendencia: string;
  extintoresInspeccionados: number;
  sistemasPasivosCumplimiento: number;
  sistemasActivosCumplimiento: number;
}

export interface SistemaInspeccionType {
  cantidad: number | string;
  estado: '✓' | 'X' | 'N/A' | null;
  observaciones?: string;
}

export interface DashboardMetricsProps {
  tagsCount: number;
  inspeccionesCount: number;
  promedioCumplimiento: number;
  alertasCriticasCount: number;
  estadisticasGlobales: AreaStats[];
}

export interface ChartData {
  name: string;
  cumplimiento: number;
  inspecciones: number;
  extintores: number;
  tendencia: number;
}