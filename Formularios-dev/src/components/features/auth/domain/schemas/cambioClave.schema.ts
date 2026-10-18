import { z } from "zod";

/**
 * Regla de la contraseña nueva, igual que `ClaveSegura` del IAM
 * (`iam-core/src/common/decorators/clave-segura.decorator.ts`).
 *
 * Se repite aquí solo para avisar mientras se escribe: quien decide es el IAM,
 * que es donde vive la contraseña. Si cambia allá, cambia aquí.
 *
 * «Carácter especial» es cualquiera que no sea letra, número ni espacio.
 */
export const REQUISITOS_CLAVE: ReadonlyArray<{
  texto: string;
  cumple: (valor: string) => boolean;
}> = [
  { texto: "Al menos 8 caracteres", cumple: (v) => v.length >= 8 },
  { texto: "Una minúscula", cumple: (v) => /[a-z]/.test(v) },
  { texto: "Una mayúscula", cumple: (v) => /[A-Z]/.test(v) },
  { texto: "Un número", cumple: (v) => /\d/.test(v) },
  {
    texto: "Un carácter especial (# . @ - _ …)",
    cumple: (v) => /[^A-Za-z0-9\s]/.test(v),
  },
];

export const cambioClaveSchema = z
  .object({
    actual: z.string().min(1, "Escribe tu contraseña actual"),
    nueva: z.string().superRefine((valor, ctx) => {
      const falta = REQUISITOS_CLAVE.find((r) => !r.cumple(valor));
      if (falta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Falta: ${falta.texto.toLowerCase()}`,
        });
      }
    }),
    confirmar: z.string().min(1, "Repite la contraseña nueva"),
  })
  .refine((d) => d.nueva === d.confirmar, {
    path: ["confirmar"],
    message: "Las contraseñas no coinciden",
  })
  .refine((d) => !d.actual || d.nueva !== d.actual, {
    path: ["nueva"],
    message: "La contraseña nueva debe ser distinta de la actual",
  });

export type CambioClaveDatos = z.infer<typeof cambioClaveSchema>;
