// src/components/features/form-builder/infrastructure/adapters/templateAdapter.ts

import { createTemplate, updateTemplate } from "@/lib/actions/template-actions";
import type { FormBuilderData } from "@/types/formTypes";

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
