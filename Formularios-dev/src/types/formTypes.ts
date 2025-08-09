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


/// iro isop 

// types/form-types.ts
export interface Question {
  _id?: string;
  text: string;
  obligatorio: boolean;
}

export interface Section {
  _id?: string;
  title: string;
  maxPoints: number;
  questions: Question[];
}

export interface SimpleQuestion {
  _id?: string;
  text: string;
  image?: string;
}

export interface SimpleSection {
  _id?: string;
  title: string;
  questions: SimpleQuestion[];
}


export interface VerificationField {
  _id?: string
  label: string
  type: "text" | "date" | "number" | "select"
  options?: string[] // Para campos select
  required?: boolean
}

export interface FormBuilderData {
  _id?: string
  name: string
  code: string
  revision: string
  type: "interna" | "externa"
  verificationFields: VerificationField[]
  sections: Section[]
  simpleSections?: SimpleSection[]
}

export interface FormTemplate {
  _id: string
  name: string // Ej: "AISLAMIENTO", "TRABAJO EN ALTURA"
  code: string
  revision: string // Número de revisión
  type: "interna" | "externa" // Tipo de inspección
  verificationFields: VerificationField[] // Campos configurables
  sections: Section[]
  simpleSections?: SimpleSection[]
}

export interface VerificationList {
  [key: string]: string // Datos dinámicos basados en los campos configurables
}

export interface InspectionTeamMember {
  _id?: string
  nombre: string
  cargo: string
  firma: string
}

export interface ValoracionCriterio {
  _id?: string
  valoracion: number | "N/A"
  criterio: string
}

export interface QuestionResponse {
  _id?: string
  questionText: string // Texto completo de la pregunta (snapshot histórico)
  response: string | number // 0, 1, 2, 3, o "N/A"
  points: number // Puntaje obtenido: 0 si N/A, sino igual al response numérico
  comment?: string // Comentario específico de esta pregunta
}

export interface SectionResponse {
  _id?: string
  sectionId: string // ID de la sección del template
  questions: QuestionResponse[]
  
  // Campos calculados para la sección
  maxPoints: number // Máximo teórico de puntos posibles (copiado del template)
  obtainedPoints: number // Puntos realmente obtenidos (suma de points donde response != "N/A")
  applicablePoints: number // Puntos aplicables (maxPoints - puntos de preguntas "N/A")
  naCount: number // Cantidad de preguntas marcadas como "N/A"
  compliancePercentage: number // Porcentaje de cumplimiento: (obtainedPoints/applicablePoints) × 100 (0-100)
  sectionComment?: string // Comentario general de la sección
}

export interface FormInstance {
  _id: string
  templateId: string
  verificationList: VerificationList
  inspectionTeam: InspectionTeamMember[]
  valoracionCriterio: ValoracionCriterio[]
  
  // Cambio principal: respuestas organizadas por secciones
  sections: SectionResponse[]
  
  aspectosPositivos?: string
  aspectosAdicionales?: string
  
  // Campos calculados automáticamente para toda la instancia
  totalObtainedPoints: number // Suma de obtainedPoints de todas las secciones
  totalApplicablePoints: number // Suma de applicablePoints de todas las secciones
  totalMaxPoints: number // Suma de maxPoints de todas las secciones
  totalNaCount: number // Total de preguntas "N/A" en toda la instancia
  overallCompliancePercentage: number // Porcentaje general: (totalObtainedPoints/totalApplicablePoints) × 100 (0-100)
  
  status?: "borrador" | "completado" | "revisado" | "aprobado"
  createdBy?: string
  updatedBy?: string
  reviewedBy?: string
  approvedBy?: string
  reviewedAt?: Date
  approvedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type FormBuilderPath = 
  | "name"
  | "code" 
  | "revision"
  | "type"
  | "verificationFields"
  | "sections"
  | `verificationFields.${number}`
  | `verificationFields.${number}.label`
  | `verificationFields.${number}.type`
  | `verificationFields.${number}.id`
  | `verificationFields.${number}._id`
  | `verificationFields.${number}.options`
  | `verificationFields.${number}.required`
  | `sections.${number}`
  | `sections.${number}.id`
  | `sections.${number}.title`
  | `sections.${number}.maxPoints`
  | `sections.${number}.questions`
  | `sections.${number}.questions.${number}`;



  export interface CustomForm {
  id: string
  title: string
  description?: string
  category: string
  createdBy: string
  createdAt: Date
  status: 'draft' | 'published' | 'archived'
  tags?: string[]
  type: 'manual' | 'imported' | 'copied'
}