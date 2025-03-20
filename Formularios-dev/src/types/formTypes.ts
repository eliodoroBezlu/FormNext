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

export type InspectionTitle ={
  id: string
  title: string
  items: InspectionSection[]
}

export type FormData = {
  documentCode:string 
  revisionNumber:number 
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
  operativo:  OperativoOption | null
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
  cantidad: string
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
            puertasEmergencia: { cantidad: "", estado: null },
            senaleticaViasEvacuacion: { cantidad: "", estado: null },
            planosEvacuacion: { cantidad: "", estado: null },
            registroPersonalEvacuacion: { cantidad: "", estado: null },
            numerosEmergencia: { cantidad: "", estado: null },
            luzEmergencia: { cantidad: "", estado: null },
            puntoReunion: { cantidad: "", estado: null },
          },
          sistemasActivos: {
            kitDerrame: { cantidad: "", estado: null },
            lavaOjos: { cantidad: "", estado: null },
            duchasEmergencia: { cantidad: "", estado: null },
            desfibriladorAutomatico: { cantidad: "", estado: null },
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
  tag: string;
  periodo: "ENERO-JUNIO" | "JULIO-DICIEMBRE";
  año: number;
  mesActual: Mes;
}

export interface DatosMes {
  inspeccionesActivos: InspeccionSistemasMensual;
  inspeccionesExtintor: InspeccionExtintor[];
  inspector: Inspector;
}
export type SistemaPath =
  | `meses.${Mes}.inspeccionesActivos.sistemasPasivos.${string}`
  | `meses.${Mes}.inspeccionesActivos.sistemasActivos.${string}`;


  export interface Trabajador {
    _id: string;
    ci: string;
    nomina: string;
    puesto: string;
    fecha_ingreso: Date;
    superintendencia: string;
  }