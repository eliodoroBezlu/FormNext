// src/components/form-sistemas-emergencia/presentation/components/sections/InformacionInspector.tsx

import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Grid } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { type Control, Controller, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import type { FormularioInspeccion, Mes } from "@/types/formTypes";
import { SignatureField } from "@/components/molecules/team-member-signature/SigantureField";
import AutocompleteTrabajador from "@/components/molecules/autocomplete-trabajador/AutocompleteTrabajador";

interface InformacionInspectorProps {
  control: Control<FormularioInspeccion>;
  currentMes: Mes;
  setValue: UseFormSetValue<FormularioInspeccion>;
  errors: FieldErrors<FormularioInspeccion>;
  disabled?: boolean;
}

export const InformacionInspector = ({
  control,
  currentMes,
  setValue,
  errors,
  disabled = false,
}: InformacionInspectorProps) => {
  return (
    <Accordion defaultExpanded sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Información del Inspector</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          {/* Campo de búsqueda de trabajadores */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name={`meses.${currentMes}.inspector.nombre`}
              control={control}
              rules={{ required: !disabled && "El nombre del inspector es obligatorio" }}
              render={({ field }) => (
                <AutocompleteTrabajador
                  label="Buscar Inspector"
                  placeholder="Seleccione o escriba un nombre"
                  value={field.value || null}
                  onChange={(nomina) => {
                    field.onChange(nomina);
                  }}
                  onBlur={field.onBlur}
                  required={!disabled}
                  error={!!errors.meses?.[currentMes]?.inspector?.nombre}
                  helperText={errors.meses?.[currentMes]?.inspector?.nombre?.message}
                  disabled={disabled}
                />
              )}
            />
          </Grid>

          {/* Campo de firma del inspector */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Firma del Inspector
            </Typography>
            <Controller
              name={`meses.${currentMes}.inspector.firma`}
              control={control}
              rules={{ required: !disabled && "La firma del inspector es obligatoria" }}
              render={({ field }) => (
                <SignatureField
                  fieldName={`meses.${currentMes}.inspector.firma`}
                  control={control}
                  setValue={setValue}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={disabled}
                  heightPercentage={40}
                  error={!!errors.meses?.[currentMes]?.inspector?.firma}
                  helperText={errors.meses?.[currentMes]?.inspector?.firma?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default InformacionInspector;
