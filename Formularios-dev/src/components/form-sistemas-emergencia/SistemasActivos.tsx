import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { type Control } from "react-hook-form";
import type { FormularioInspeccion, Mes } from "../../types/formTypes";
import SistemaField from "./SistemaField";

interface SistemasActivosProps {
  control: Control<FormularioInspeccion>;
  currentMes: Mes;
  disabled?: boolean; // 🔥 Prop para modo lectura
}

const SistemasActivos = ({ control, currentMes, disabled = false }: SistemasActivosProps) => {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Sistemas Activos</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <SistemaField
          name="kitDerrame"
          label="Kit de Derrame"
          control={control}
          currentMes={currentMes}
          type="activos"
          disabled={disabled} // 🔥 Pasamos la prop
        />
        <SistemaField
          name="lavaOjos"
          label="Lava Ojos"
          control={control}
          currentMes={currentMes}
          type="activos"
          disabled={disabled}
        />
        <SistemaField
          name="duchasEmergencia"
          label="Duchas de Emergencia"
          control={control}
          currentMes={currentMes}
          type="activos"
          disabled={disabled}
        />
        <SistemaField
          name="desfibriladorAutomatico"
          label="Desfibrilador Automático"
          control={control}
          currentMes={currentMes}
          type="activos"
          disabled={disabled}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default SistemasActivos;