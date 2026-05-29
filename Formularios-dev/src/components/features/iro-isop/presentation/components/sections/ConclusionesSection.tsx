// src/components/organisms/inspection-form-iro-isop/presentation/components/sections/ConclusionesSection.tsx

import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Grid, TextField, Box } from "@mui/material";
import { ExpandMore, Comment } from "@mui/icons-material";
import { Controller, type Control } from "react-hook-form";
import type { InspectionFormData } from "@/components/features/iro-isop/types/IProps";

interface ConclusionesSectionProps {
  control: Control<InspectionFormData>;
  readonly: boolean;
}

export const ConclusionesSection = ({ control, readonly }: ConclusionesSectionProps) => {
  return (
    <Accordion elevation={2} sx={{ mb: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{ bgcolor: "secondary.main", color: "white" }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Comment />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            CONCLUSIONES Y RECOMENDACIONES
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="aspectosPositivos"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="1. Aspectos positivos:"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  disabled={readonly}
                  placeholder="Describa los aspectos positivos identificados durante la inspección..."
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="aspectosAdicionales"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value || ""}
                  label="2. Ítems Críticos / Aspectos Adicionales:"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  disabled={readonly}
                  placeholder="Describa los ítems críticos, desviaciones encontradas o recomendaciones generales..."
                />
              )}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};
