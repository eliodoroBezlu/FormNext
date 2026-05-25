// src/components/form-sistemas-emergencia/presentation/components/sections/SistemasPasivos.tsx

import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Control, UseFormSetValue, FieldErrors } from "react-hook-form";
import type { FormularioInspeccion, Mes } from "@/types/formTypes";
import SistemaField from "./SistemaField";

interface SistemasPasivosProps {
  control: Control<FormularioInspeccion>;
  setValue: UseFormSetValue<FormularioInspeccion>;
  currentMes: Mes;
  disabled?: boolean;
  errors?: FieldErrors<FormularioInspeccion>;
}

export const SistemasPasivos = ({
  control,
  setValue,
  currentMes,
  disabled = false,
  errors,
}: SistemasPasivosProps) => {
  return (
    <Accordion defaultExpanded sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Sistemas Pasivos</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <SistemaField
          name="puertasEmergencia"
          label="Puertas de Emergencia"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
          errors={errors}
        />
        <SistemaField
          name="senaleticaViasEvacuacion"
          label="Señalética Vías de Evacuación"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
          errors={errors}
        />
        <SistemaField
          name="planosEvacuacion"
          label="Planos de Evacuación"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
          errors={errors}
        />
        <SistemaField
          name="registroPersonalEvacuacion"
          label="Registro Personal Evacuación"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
          errors={errors}
        />
        <SistemaField
          name="numerosEmergencia"
          label="Números de Emergencia"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
          errors={errors}
        />
        <SistemaField
          name="luzEmergencia"
          label="Luz de Emergencia"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
          errors={errors}
        />
        <SistemaField
          name="puntoReunion"
          label="Punto de Reunión"
          control={control}
          setValue={setValue}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
          errors={errors}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default SistemasPasivos;
