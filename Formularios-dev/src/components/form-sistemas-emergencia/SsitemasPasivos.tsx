import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { Control } from "react-hook-form";
import type { FormularioInspeccion, Mes } from "../../types/formTypes";
import SistemaField from "./SistemaField";

interface SistemasPasivosProps {
  control: Control<FormularioInspeccion>;
  currentMes: Mes;
  disabled?: boolean; // 🔥 Prop para modo lectura
}

const SistemasPasivos = ({ control, currentMes, disabled = false }: SistemasPasivosProps) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Sistemas Pasivos</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <SistemaField
          name="puertasEmergencia"
          label="Puertas de Emergencia"
          control={control}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled} // 🔥 Pasamos la prop
        />
        <SistemaField
          name="senaleticaViasEvacuacion"
          label="Señalética Vías de Evacuación"
          control={control}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
        />
        <SistemaField
          name="planosEvacuacion"
          label="Planos de Evacuación"
          control={control}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
        />
        <SistemaField
          name="registroPersonalEvacuacion"
          label="Registro Personal Evacuación"
          control={control}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
        />
        <SistemaField
          name="numerosEmergencia"
          label="Números de Emergencia"
          control={control}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
        />
        <SistemaField
          name="luzEmergencia"
          label="Luz de Emergencia"
          control={control}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
        />
        <SistemaField
          name="puntoReunion"
          label="Punto de Reunión"
          control={control}
          currentMes={currentMes}
          type="pasivos"
          disabled={disabled}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default SistemasPasivos;