export type CheckboxOption = "si" | "no" | "na"
export type OperativoOption = "SI" | "NO"

export type InspectionItem = {
  id: string
  description: string
  response: CheckboxOption | null
  observation: string
}

export type InspectionSection = {
  id: string
  category: string
  items: InspectionItem[]
}

export type InspectionTitle = {
  id: string
  title: string
  items: InspectionSection[]
}

export type FormData = {
  documentCode: string
  revisionNumber: number
  informacionGeneral: {
    superintendencia: string
    trabajador: string
    supervisor: string
    area: string
    numInspeccion: string
    codConector: string
    codArnes: string
    fecha: Date
  }
  resultados: InspectionTitle[]
  operativo: OperativoOption | null
  observacionesComplementarias: string
  inspectionConductedBy: string
  firmaInspector: string
  inspectionApprovedBy: string
  firmaSupervisor: string
  reviewDate: Date
}

export type FormFieldName =
  | `informacionGeneral.${keyof FormData["informacionGeneral"]}`
  | `resultados.${number}.items.${number}.items.${number}.response`
  | `resultados.${number}.items.${number}.items.${number}.observation`
  | "observacionesComplementarias"
  | "reviewDate"
  | "inspectionApprovedBy"
  | "inspectionConductedBy"
  | "firmaInspector"
  | "firmaSupervisor"

// Crear FormDataExport extendiendo FormData
export interface FormDataExport extends FormData {
  _id: string
}

// form sistemas de emergencia
export type Mes =
  | "ENERO"
  | "FEBRERO"
  | "MARZO"
  | "ABRIL"
  | "MAYO"
  | "JUNIO"
  | "JULIO"
  | "AGOSTO"
  | "SEPTIEMBRE"
  | "OCTUBRE"
  | "NOVIEMBRE"
  | "DICIEMBRE"
export type PeriodoFormulario = "ENERO-JUNIO" | "JULIO-DICIEMBRE"

export type EstadoInspeccion = "✓" | "X" | "N/A" | null
// Interfaz para el inspector
export interface Inspector {
  nombre: string
  firma: string | null // Base64 de la firma
}

// Interfaz para los sistemas (pasivos y activos)
export interface SistemaInspeccion {
  cantidad: number
  estado: EstadoInspeccion
  observaciones?: string
}

// Interfaz para un mes de inspección de sistemas
export interface InspeccionSistemasMensual {
  sistemasPasivos: {
    puertasEmergencia: SistemaInspeccion
    senaleticaViasEvacuacion: SistemaInspeccion
    planosEvacuacion: SistemaInspeccion
    registroPersonalEvacuacion: SistemaInspeccion
    numerosEmergencia: SistemaInspeccion
    luzEmergencia: SistemaInspeccion
    puntoReunion: SistemaInspeccion
  }
  sistemasActivos: {
    kitDerrame: SistemaInspeccion
    lavaOjos: SistemaInspeccion
    duchasEmergencia: SistemaInspeccion
    desfibriladorAutomatico: SistemaInspeccion
  }
  observaciones?: string
}

// Interfaz para la inspección de extintores
export interface InspeccionExtintor {
  fechaInspeccion: string
  codigo: string
  ubicacion: string
  inspeccionMensual: EstadoInspeccion
  manguera: EstadoInspeccion
  cilindro: EstadoInspeccion
  indicadorPresion: EstadoInspeccion
  gatilloChavetaPrecinto: EstadoInspeccion
  senalizacionSoporte: EstadoInspeccion
  observaciones: string
}

// Interfaz principal del formulario
export interface FormularioInspeccion {
  // Información del documento
  documentCode: string // 3.02.P01.F17
  revisionNumber: number // 2

  // Información general
  superintendencia: string
  area: string
  tag: string
  responsableEdificio: string
  edificio: string

  // Control de período
  periodo: PeriodoFormulario
  año: number
  mesActual: Mes // Añadimos esta propiedad
  // Inspecciones organizadas por mes
  meses: {
    [mes: string]: {
      inspeccionesActivos: InspeccionSistemasMensual
      inspeccionesExtintor: InspeccionExtintor[]
      inspector: Inspector
    }
  }

  // Metadata
  fechaCreacion: Date
  fechaUltimaModificacion: Date
  estado: "activo" | "completado" | "archivado"
}

// Helper function para crear un formulario nuevo
export const crearFormularioInicial = (
  superintendencia: string,
  area: string,
  tag: string,
  responsableEdificio: string,
  edificio: string,
  periodo: PeriodoFormulario,
  año: number,
  mesActual: Mes,
): FormularioInspeccion => {
  return {
    documentCode: "3.02.P01.F17",
    revisionNumber: 2,
    superintendencia,
    area,
    tag,
    responsableEdificio,
    edificio,
    periodo,
    año,
    mesActual,
    meses: {
      [mesActual]: {
        inspeccionesActivos: {
          sistemasPasivos: {
            puertasEmergencia: { cantidad: 0, estado: "✓", observaciones:"" },
            senaleticaViasEvacuacion: { cantidad: 0, estado: "✓", observaciones:"" },
            planosEvacuacion: { cantidad: 0, estado: "✓", observaciones:"" },
            registroPersonalEvacuacion: { cantidad: 0, estado: "✓",observaciones:"" },
            numerosEmergencia: { cantidad: 0, estado: "✓", observaciones:"" },
            luzEmergencia: { cantidad: 0, estado: "✓", observaciones:"" },
            puntoReunion: { cantidad: 0, estado: "✓", observaciones:"" },
          },
          sistemasActivos: {
            kitDerrame: { cantidad: 0, estado: "✓", observaciones:"" },
            lavaOjos: { cantidad: 0, estado: "✓", observaciones:"" },
            duchasEmergencia: { cantidad: 0, estado: "✓", observaciones:"" },
            desfibriladorAutomatico: { cantidad: 0, estado: "✓", observaciones:"" },
          },
          observaciones: "",
        },
        inspeccionesExtintor: [],
        inspector: { nombre: "", firma: null },
      },
    },
    fechaCreacion: new Date(),
    fechaUltimaModificacion: new Date(),
    estado: "activo",
  }
}

export interface VerificarTagData {
  tag: string
  periodo: "ENERO-JUNIO" | "JULIO-DICIEMBRE"
  año: number
  mesActual: Mes
}



export interface DatosMes {
  inspeccionesActivos: InspeccionSistemasMensual
  inspeccionesExtintor: InspeccionExtintor[]
  inspector: Inspector
}
export type SistemaPath =
  | `meses.${Mes}.inspeccionesActivos.sistemasPasivos.${string}`
  | `meses.${Mes}.inspeccionesActivos.sistemasActivos.${string}`
  | `meses.${Mes}.inspeccionesActivos.sistemasActivos.${string}`

export interface Trabajador {
  _id: string
  ci: string
  nomina: string
  puesto: string
  fecha_ingreso: Date
  superintendencia: string
}

export interface InspeccionServiceExport extends FormularioInspeccion {
  _id: string
}

export interface ExtintorBackend {
  _id: string
  tag: string
  CodigoExtintor: string
  Ubicacion: string
  inspeccionado: boolean
  activo: boolean
  area: string
  totalActivos: number
}

export interface ExtintorAreaResponse {
  success: boolean;
  extintores: ExtintorBackend[]; // <- Directamente el array, no anidado
  count: number;
  totalExtintoresActivosArea: number;
}



export interface ExtintoresUpdateData {
  tag: string;
  extintores: InspeccionExtintor[];
  area: string;
}


export interface FiltrosInspeccion {
  area?: string;
  superintendencia?: string;
  mesActual?: string;
  documentCode?: string;
}

export interface TagConEstado {
  tag: string;
  extintoresPendientes: number;
  totalActivos: number;
  inspeccionado: boolean; 
}


export interface QROptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRGenerateRequest {
  text: string;
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export interface QRGenerateResponse {
  success: boolean;
  data: {
    text: string;
    qrCode: string; // base64
    timestamp: string;
  };
}

export interface QRCompleteResponse {
  success: boolean;
  data: {
    text: string;
    dataUrl: string;
    buffer: Buffer;
    svg: string;
    timestamp: string;
  };
}