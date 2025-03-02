import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import type { Control } from "react-hook-form"
import type { FormularioInspeccion, Mes } from "../../types/formTypes"
import SistemaField from "./SistemaField"

interface SistemasPasivosProps {
  control: Control<FormularioInspeccion>
  currentMes: Mes
}

const SistemasPasivos = ({ control, currentMes }: SistemasPasivosProps) => {
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
        />
        <SistemaField
          name="senaleticaViasEvacuacion"
          label="Señalética Vías de Evacuación"
          control={control}
          currentMes={currentMes}
          type="pasivos"
        />
        <SistemaField
          name="planosEvacuacion"
          label="Planos de Evacuación"
          control={control}
          currentMes={currentMes}
          type="pasivos"
        />
        <SistemaField
          name="registroPersonalEvacuacion"
          label="Registro Personal Evacuación"
          control={control}
          currentMes={currentMes}
          type="pasivos"
        />
        <SistemaField
          name="numerosEmergencia"
          label="Números de Emergencia"
          control={control}
          currentMes={currentMes}
          type="pasivos"
        />
        <SistemaField
          name="luzEmergencia"
          label="Luz de Emergencia"
          control={control}
          currentMes={currentMes}
          type="pasivos"
        />
        <SistemaField
          name="puntoReunion"
          label="Punto de Reunión"
          control={control}
          currentMes={currentMes}
          type="pasivos"
        />
      </AccordionDetails>
    </Accordion>
  )
}

export default SistemasPasivos

