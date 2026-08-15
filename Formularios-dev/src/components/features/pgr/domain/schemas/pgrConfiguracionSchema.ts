import { z } from "zod";

/**
 * Programación de un mes. Refleja `ProgramacionMesDto` del backend.
 * `programado` es la cantidad de la celda combinada `Prog.`; las tres
 * cantidades `real*` reparten lo ejecutado según cuándo se hizo.
 */
export const programacionMesSchema = z.object({
  mes: z.number().int().min(1).max(12),
  programado: z.number().int().min(0),
  realMesPasado: z.number().int().min(0).optional(),
  realDelMes: z.number().int().min(0).optional(),
  realMesAdelantado: z.number().int().min(0).optional(),
});

/**
 * Actividad en un borrador: solo lo que la identifica.
 *
 * Responsable, recurso, entregable y la programación mensual **no salen de la
 * matriz de riesgo**: una actividad recién consolidada nace sin ellos y se
 * completan a mano. Exigirlos para guardar dejaba a un PGR consolidado sin
 * forma de guardarse —198 actividades, 198 errores— y obligaba a completar las
 * 198 de una sentada. El esquema de Mongo ya los tiene como opcionales por el
 * mismo motivo.
 */
export const responsableActividadSchema = z.object({
  tipo: z.enum(["grupo", "trabajador"]),
  /** `_id` del grupo, o `ci` del trabajador. */
  referencia: z.string().min(1),
  nombre: z.string().min(1),
});

export const recursoActividadSchema = z.object({
  cantidad: z.number().int().min(0),
  /** Código del catálogo de unidades. Hoy la única en uso es `HH`. */
  unidad: z.string().min(1, "Elegí la unidad"),
});

export const actividadBorradorSchema = z.object({
  _id: z.string().optional(),
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  verificador: z.string().min(1, "El verificador es obligatorio"),
  /** Vacío = todas las áreas de la superintendencia. */
  areas: z.array(z.string()),
  responsables: z.array(responsableActividadSchema),
  recursos: z.array(recursoActividadSchema),
  entregables: z.array(z.string()),
  programacion: z.array(programacionMesSchema),
  historialTrazabilidad: z.string().optional(),
  estadoAprobacion: z.string().optional(),
  motivoRechazo: z.string().optional(),
});

/**
 * Actividad al **enviar a aprobación**: acá sí tiene que estar todo.
 *
 * Es el mismo corte que hace el backend, que valida la completitud recién en
 * `PgrService.aprobar` y no al guardar.
 */
export const actividadSchema = actividadBorradorSchema.extend({
  responsables: z
    .array(responsableActividadSchema)
    .min(1, "Indicá al menos un responsable"),
  recursos: z.array(recursoActividadSchema).min(1, "Indicá al menos un recurso"),
  entregables: z.array(z.string()).min(1, "Indicá al menos un entregable"),
  programacion: z
    .array(programacionMesSchema)
    .refine((p) => p.some((m) => m.programado > 0), {
      message: "Programe al menos un mes con cantidad mayor a cero",
    }),
});

// Mirrors backend `CreatePgrDto`: empresa, vicepresidencia, gerencia,
// superintendencia y gestion son `@IsString()` obligatorios.
const pgrBaseSchema = z.object({
  empresa: z.string().min(1, "La empresa es obligatoria"),
  vicepresidencia: z.string().min(1, "La vicepresidencia es obligatoria"),
  gerencia: z.string().min(1, "La gerencia es obligatoria"),
  superintendencia: z.string().min(1, "La superintendencia es obligatoria"),
  gestion: z.string().min(1, "La gestión es obligatoria"),
  areas: z.array(z.string()).optional(),
  supervisor: z.string().optional(),
  responsable: z.string().optional(),
  /** `$J$4` — hasta qué mes acumulan los indicadores de periodo. */
  mesCorte: z.number().int().min(1).max(12),
  /** `$W$4` — ventana de la gestión completa. */
  ventanaGestion: z.number().int().min(1).max(12),
  actividades: z.array(actividadBorradorSchema),
});

/**
 * Alta de un PGR: solo el encabezado.
 *
 * Nace **sin actividades** a propósito. Las trae el paso siguiente,
 * consolidando las matrices de riesgo aprobadas de la superintendencia; exigir
 * una actividad acá obligaba a inventar una fila en blanco que después había
 * que borrar a mano.
 */
export const pgrCreacionSchema = pgrBaseSchema;

/** Guardar borrador: se admite el trabajo a medias, que es lo que un borrador es. */
export const pgrBorradorSchema = pgrBaseSchema;

/** Enviar a aprobación: tiene que haber actividades y estar completas. */
export const pgrConfiguracionSchema = pgrBaseSchema.extend({
  actividades: z
    .array(actividadSchema)
    .min(1, "Debe agregar al menos una actividad"),
});

export type ProgramacionMesFormData = z.infer<typeof programacionMesSchema>;
export type ActividadFormData = z.infer<typeof actividadSchema>;
export type PgrConfiguracionFormData = z.infer<typeof pgrConfiguracionSchema>;

/** Programación vacía de los 12 meses, para una actividad nueva. */
export const programacionVacia = (): ProgramacionMesFormData[] =>
  Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    programado: 0,
    realMesPasado: 0,
    realDelMes: 0,
    realMesAdelantado: 0,
  }));
