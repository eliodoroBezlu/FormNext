"use client"


import { useRef } from "react"
import { Accordion, AccordionSummary, AccordionDetails, Typography, Grid, TextField } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { type Control, Controller, type FieldErrors, type UseFormSetValue } from "react-hook-form"
import type { FormularioInspeccion, Mes } from "../../types/formTypes"
import type SignatureCanvas from "react-signature-canvas"
import DynamicSignatureCanvas from "../molecules/signature-canvas/SigantureCanvas"

interface InformacionInspectorProps {
  control: Control<FormularioInspeccion>
  currentMes: Mes
  setValue: UseFormSetValue<FormularioInspeccion>
  errors: FieldErrors<FormularioInspeccion>
}

const InformacionInspector = ({ control, currentMes, setValue, errors }: InformacionInspectorProps) => {
  const sigCanvasRef = useRef<SignatureCanvas>(null)

  const guardarFirma = () => {
    if (sigCanvasRef.current && !sigCanvasRef.current.isEmpty()) {
      const dataURL = sigCanvasRef.current.toDataURL()
      setValue(`meses.${currentMes}.inspector.firma`, dataURL)
    }
  }

  const limpiarFirma = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear()
      setValue(`meses.${currentMes}.inspector.firma`, null)
    }
  }

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Información del Inspector</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name={`meses.${currentMes}.inspector.nombre`}
              control={control}
              rules={{ required: "El nombre del inspector es obligatorio" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre del Inspector"
                  fullWidth
                  error={!!errors.meses?.[currentMes]?.inspector?.nombre}
                  helperText={errors.meses?.[currentMes]?.inspector?.nombre?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Firma del Inspector
            </Typography>
            <DynamicSignatureCanvas
              ref={sigCanvasRef}
              onClear={limpiarFirma}
              heightPercentage={40}
              onSave={guardarFirma}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

export default InformacionInspector

