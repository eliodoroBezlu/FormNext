// src/components/features/form-builder/infrastructure/adapters/templateAdapter.ts

import { createTemplate, updateTemplate } from "@/lib/actions/template-actions";
import {
  crearNuevaRevision,
  obtenerEstadoEdicion,
  obtenerHistorialRevisiones,
  publicarRevision,
} from "@/lib/actions/versionado-actions";
import type { FormBuilderData } from "@/types/formTypes";
import type { AdaptadorVersionado } from "@/types/versionado";

/** Versionado de las plantillas IRO/ISOP (`/templates`). */
export const versionadoTemplatesAdapter: AdaptadorVersionado = {
  estadoEdicion: (id) => obtenerEstadoEdicion("templates", id),
  nuevaRevision: (id) => crearNuevaRevision("templates", id),
  publicar: (id, motivo) => publicarRevision("templates", id, motivo),
  historial: (code) => obtenerHistorialRevisiones("templates", code),
};

export const templateAdapter = {
  /**
   * Crea una nueva plantilla de formulario.
   */
  async createTemplate(data: FormBuilderData) {
    return createTemplate(data);
  },

  /**
   * Actualiza una plantilla de formulario existente.
   */
  async updateTemplate(id: string, data: FormBuilderData) {
    return updateTemplate(id, data);
  },
};
