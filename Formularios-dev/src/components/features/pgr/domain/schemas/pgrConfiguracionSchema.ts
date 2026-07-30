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

// Mirrors backend `CreateActividadDto` (src/modules/pgr/dto/create-pgr.dto.ts).
export const actividadSchema = z.object({
  _id: z.string().optional(),
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  responsable: z.string().min(1, "El responsable es obligatorio"),
  verificador: z.string().min(1, "El verificador es obligatorio"),
  recurso: z.string().min(1, "El recurso es obligatorio"),
  entregable: z.string().min(1, "El entregable es obligatorio"),
  programacion: z
    .array(programacionMesSchema)
    .refine((p) => p.some((m) => m.programado > 0), {
      message: "Programe al menos un mes con cantidad mayor a cero",
    }),
  historialTrazabilidad: z.string().optional(),
  estadoAprobacion: z.string().optional(),
  motivoRechazo: z.string().optional(),
});

// Mirrors backend `CreatePgrDto`: empresa, vicepresidencia, gerencia,
// superintendencia y gestion son `@IsString()` obligatorios.
export const pgrConfiguracionSchema = z.object({
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
