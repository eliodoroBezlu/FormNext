// src/components/organisms/inspection-form-iro-isop/presentation/components/sections/VerificationListSection.tsx

import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Grid } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { FormField } from "@/components/ui/inputs/FormField";
import { DataSourceType } from "@/lib/actions/dataSourceService";
import type { Control } from "react-hook-form";
import type { VerificationField } from "@/types/formTypes";
import type { InspectionFormData } from "@/components/features/iro-isop/types/IProps";

interface VerificationListSectionProps {
  control: Control<InspectionFormData>;
  verificationFields: VerificationField[];
  readonly: boolean;
}

export const VerificationListSection = ({
  control,
  verificationFields,
  readonly,
}: VerificationListSectionProps) => {
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
                name={`verificationList.${field.label}`}
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
