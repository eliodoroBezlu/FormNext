import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { type Control, Controller } from "react-hook-form"
import type { FormularioInspeccion, Mes } from "../../types/formTypes"
import SistemaField from "./SistemaField"

interface SistemasActivosProps {
  control: Control<FormularioInspeccion>
  currentMes: Mes
}

const SistemasActivos = ({ control, currentMes }: SistemasActivosProps) => {
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
        />
        <SistemaField name="lavaOjos" label="Lava Ojos" control={control} currentMes={currentMes} type="activos" />
        <SistemaField
          name="duchasEmergencia"
          label="Duchas de Emergencia"
          control={control}
          currentMes={currentMes}
          type="activos"
        />
        <SistemaField
          name="desfibriladorAutomatico"
          label="Desfibrilador Automático"
          control={control}
          currentMes={currentMes}
          type="activos"
        />
      </AccordionDetails>
    </Accordion>
  )
}

export default SistemasActivos

