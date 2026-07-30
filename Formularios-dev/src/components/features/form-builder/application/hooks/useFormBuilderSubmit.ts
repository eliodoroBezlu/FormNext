// src/components/features/form-builder/application/hooks/useFormBuilderSubmit.ts

import { useState, useTransition } from "react";
import type { FormBuilderData, FormTemplate } from "@/types/formTypes";
import { templateAdapter } from "@/components/features/form-builder/infrastructure/adapters/templateAdapter";

interface UseFormBuilderSubmitParams {
  template: FormTemplate | null;
  isEditing: boolean;
  onSave: (template: FormTemplate) => void;
}

/**
 * Orquesta la persistencia (creación/actualización) de una plantilla de
 * formulario: valida imágenes pendientes, transforma los datos del builder
 * al formato esperado por el backend y delega la llamada al adaptador.
 */
export const useFormBuilderSubmit = ({
  template,
  isEditing,
  onSave,
}: UseFormBuilderSubmitParams) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = (data: FormBuilderData) => {
    if (data.sections.length === 0) {
      setError("Debe agregar al menos una sección");
      return;
    }

    startTransition(async () => {
      setError(null);
      setSuccess(null);

      try {
        const hasInvalidImages = (data.simpleSections || []).some((section) =>
          section.questions?.some(
            (question) => question.image && question.image.startsWith("blob:")
          )
        );

        if (hasInvalidImages) {
          setError(
            "Hay imágenes que aún se están procesando. Por favor, espera a que terminen."
          );
          return;
        }

        const transformedData: FormBuilderData = {
          ...data,
          sections: data.sections.map((section, index) => {
            const maxPoints = Number(section.maxPoints);

            if (isNaN(maxPoints) || maxPoints < 0) {
              throw new Error(
                `Sección ${
                  index + 1
                }: El puntaje máximo debe ser un número mayor o igual a 0`
              );
            }

            return {
              ...section,
              maxPoints: maxPoints,
              questions: (section.questions || [])
                .filter((q) => q.text?.trim())
                .map((q) => q),
            };
          }),
          simpleSections: (data.simpleSections || []).map((section) => ({
            ...section,
            questions: (section.questions || [])
              .filter((q) => q.text?.trim())
              .map((q) => q),
          })),
        };
        const imageStats = (transformedData.simpleSections || []).flatMap(
          (section) =>
            (section.questions || [])
              .filter((q) => q.image && q.image.startsWith("data:image/"))
              .map((q) => {
                const sizeInBytes = (q.image!.length * 3) / 4;
                const sizeInKB = Math.round(sizeInBytes / 1024);
                return sizeInKB;
              })
        );

        if (imageStats.length > 0) {
          const totalImageSize = imageStats.reduce(
            (sum, size) => sum + size,
            0
          );
          console.log(
            `Total de imágenes: ${imageStats.length}, Tamaño total: ${totalImageSize}KB`
          );

          if (totalImageSize > 5000) {
            console.warn(
              "⚠️ Tamaño total de imágenes muy grande:",
              totalImageSize,
              "KB"
            );
          }
        }
        console.log("Datos transformados para envío:", transformedData);

        const result =
          isEditing && template
            ? await templateAdapter.updateTemplate(template._id, transformedData)
            : await templateAdapter.createTemplate(transformedData);

        if (result.success) {
          setSuccess(result.message || "Operación completada exitosamente");
          onSave(result.data as FormTemplate);
        } else {
          setError(result.error || "Error desconocido");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      }
    });
  };

  return {
    onSubmit,
    isPending,
    error,
    setError,
    success,
    setSuccess,
  };
};
