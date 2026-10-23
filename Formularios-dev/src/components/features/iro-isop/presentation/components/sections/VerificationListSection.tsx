// src/components/organisms/inspection-form-iro-isop/presentation/components/sections/VerificationListSection.tsx

import React, { useCallback, useMemo } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Grid } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { FormField } from "@/components/ui/inputs/FormField";
import { DataSourceType } from "@/lib/actions/dataSourceService";
import { useFormContext, useWatch, type Control, type Path } from "react-hook-form";
import { useCadenaOrganizativa } from "@/hooks/useCadenaOrganizativa";
import { esCampoDeArea } from "@/lib/organizacion/cadenaOrganizativa";
import { campoDeArea } from "@/components/features/iro-isop/domain/models/valoresIniciales";
import type { VerificationField } from "@/types/formTypes";
import type { InspectionFormData } from "@/components/features/iro-isop/types/IProps";
import { verificationListFieldPath } from "@/components/features/iro-isop/domain/models/IroIsopDomain";

interface VerificationListSectionProps {
  control: Control<InspectionFormData>;
  verificationFields: VerificationField[];
  readonly: boolean;
  /** Editando una IRO guardada: lo declarado aquel día no se pisa al abrirla. */
  isEditMode?: boolean;
}

export const VerificationListSection = ({
  control,
  verificationFields,
  readonly,
  isEditMode = false,
}: VerificationListSectionProps) => {
  const { setValue } = useFormContext<InspectionFormData>();

  // Superintendencia y gerencia salen del área elegida (hook compartido con
  // Herramientas y Equipos). La «Superintendencia Sénior» sigue a mano.
  const etiquetas = useMemo(
    () => verificationFields.map((f) => f.label),
    [verificationFields],
  );
  const area = campoDeArea(verificationFields, esCampoDeArea);
  const areaElegida = useWatch({
    control,
    name: (area
      ? verificationListFieldPath(area.label)
      : "verificationList") as Path<InspectionFormData>,
  });
  const aplicarDesdeArea = useCallback(
    (etiqueta: string, valor: string) =>
      setValue(verificationListFieldPath(etiqueta) as Path<InspectionFormData>, valor, {
        shouldValidate: true,
        shouldDirty: true,
      }),
    [setValue],
  );
  useCadenaOrganizativa({
    etiquetas,
    area: !readonly && area && typeof areaElegida === "string" ? areaElegida : undefined,
    esEdicion: isEditMode,
    aplicar: aplicarDesdeArea,
  });

  return (
    <Accordion elevation={2} sx={{ mb: 2 }} defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{ bgcolor: "primary.main", color: "white" }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          LISTA DE VERIFICACIÓN
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {verificationFields.map((field) => (
            <Grid size={{ xs: 12, sm: 6 }} key={field._id}>
              <FormField
                name={verificationListFieldPath(field.label)}
                control={control}
                type={field.type}
                label={field.required ? `${field.label} *` : field.label}
                dataSource={field.dataSource as DataSourceType}
                options={
                  field.options?.map((opt) => ({
                    value: opt,
                    label: opt,
                  })) || []
                }
                rules={{
                  required:
                    !readonly && field.required
                      ? `${field.label} es requerido`
                      : false,
                }}
                disabled={readonly}
              />
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
