// src/components/form-sistemas-emergencia/presentation/components/sections/SistemasActivos.tsx

import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Control, UseFormSetValue, FieldErrors } from "react-hook-form";
import type { FormularioInspeccion, Mes } from "@/types/formTypes";
import SistemaField from "./SistemaField";

interface SistemasActivosProps {
  control: Control<FormularioInspeccion>;
  setValue: UseFormSetValue<FormularioInspeccion>;
  currentMes: Mes;
  disabled?: boolean;
  errors?: FieldErrors<FormularioInspeccion>;
}

export const SistemasActivos = ({
  control,
  setValue,
  currentMes,
  disabled = false,
  errors,
}: SistemasActivosProps) => {
  return (
    <Accordion defaultExpanded sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Sistemas Activos</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <SistemaField
          name="kitDerrame"
          label="Kit de Derrame"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="activos"
          disabled={disabled}
          errors={errors}
        />
        <SistemaField
          name="lavaOjos"
          label="Lava Ojos"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="activos"
          disabled={disabled}
          errors={errors}
        />
        <SistemaField
          name="duchasEmergencia"
          label="Duchas de Emergencia"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="activos"
          disabled={disabled}
          errors={errors}
        />
        <SistemaField
          name="desfibriladorAutomatico"
          label="Desfibrilador Automático"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="activos"
          disabled={disabled}
          errors={errors}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default SistemasActivos;
